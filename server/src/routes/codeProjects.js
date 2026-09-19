/**
 * Code Projects routes
 *
 * All routes require authentication via `requireAuth` middleware.
 * All database operations strictly filter by `req.user.id`.
 *
 * ── Project CRUD ──────────────────────────────────────────────────────────────
 * POST   /api/code-projects                     create a new tracked project
 * GET    /api/code-projects                     list all projects (with account info)
 * GET    /api/code-projects/:id                 single project + last 20 snapshots
 * PATCH  /api/code-projects/:id                 update watch_status / interval / account
 * DELETE /api/code-projects/:id                 remove project (cascades snapshots)
 *
 * ── CLI event recording ──────────────────────────────────────────────────────
 * POST   /api/code-projects/:id/snapshots       log a snapshot (from CLI watcher)
 * POST   /api/code-projects/:id/commit          record a git push event (from CLI)
 *
 * ── AI agents (Stage 4) ───────────────────────────────────────────────────────
 * POST   /api/code-projects/:id/generate-commit  run Commit Composer + Code Guardian
 */

'use strict';

const express = require('express');
const db = require('../db/connection');
const { handleGitpushTrigger } = require('../agents/orchestrator');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Protect all code-projects routes with requireAuth
router.use(requireAuth);

// ── Validation helpers ────────────────────────────────────────────────────────
const VALID_WATCH_STATUSES = ['watching', 'paused'];

function isValidUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/code-projects
// Create a new tracked project for the authenticated user
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, local_path, backup_account_id, snapshot_interval_minutes } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: '`name` is required' });
  }

  // Validate backup_account_id if provided
  if (backup_account_id) {
    if (!isValidUuid(backup_account_id)) {
      return res.status(400).json({ error: '`backup_account_id` must be a valid UUID' });
    }
    const account = await db('cloud_accounts')
      .where({ id: backup_account_id, user_id: req.user.id })
      .first();
    if (!account) {
      return res.status(404).json({ error: `cloud_account not found or not owned by user: ${backup_account_id}` });
    }
  }

  if (snapshot_interval_minutes !== undefined) {
    const interval = parseInt(snapshot_interval_minutes, 10);
    if (!Number.isInteger(interval) || interval < 1) {
      return res.status(400).json({ error: '`snapshot_interval_minutes` must be a positive integer' });
    }
  }

  try {
    const [project] = await db('code_projects')
      .insert({
        user_id: req.user.id,
        name: name.trim(),
        local_path: local_path || null,
        backup_account_id: backup_account_id || null,
        snapshot_interval_minutes: snapshot_interval_minutes
          ? parseInt(snapshot_interval_minutes, 10)
          : 15,
        watch_status: 'paused',
      })
      .returning('*');

    return res.status(201).json(project);
  } catch (err) {
    console.error('[code-projects POST] Error:', err.message);
    return res.status(500).json({ error: 'Failed to create project', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/code-projects
// List all tracked projects for the authenticated user, with backup account info joined
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const projects = await db('code_projects as cp')
      .leftJoin('cloud_accounts as ca', 'cp.backup_account_id', 'ca.id')
      .where('cp.user_id', req.user.id)
      .orderBy('cp.created_at', 'desc')
      .select(
        'cp.id',
        'cp.name',
        'cp.local_path',
        'cp.snapshot_interval_minutes',
        'cp.watch_status',
        'cp.last_snapshot_at',
        'cp.last_commit_message',
        'cp.last_commit_at',
        'cp.created_at',
        'ca.id        as backup_account_id',
        'ca.provider  as backup_provider',
        'ca.account_email as backup_account_email'
      );

    return res.json({ count: projects.length, projects });
  } catch (err) {
    console.error('[code-projects GET /] Error:', err.message);
    return res.status(500).json({ error: 'Failed to list projects', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/code-projects/:id
// Single project detail + most recent 20 snapshots
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Project with backup account info
    const project = await db('code_projects as cp')
      .leftJoin('cloud_accounts as ca', 'cp.backup_account_id', 'ca.id')
      .where({ 'cp.id': id, 'cp.user_id': req.user.id })
      .select(
        'cp.*',
        'ca.provider  as backup_provider',
        'ca.account_email as backup_account_email'
      )
      .first();

    if (!project) {
      return res.status(404).json({ error: `Project not found: ${id}` });
    }

    // Recent snapshots
    const snapshots = await db('snapshots')
      .where({ project_id: id })
      .orderBy('taken_at', 'desc')
      .limit(20)
      .select('id', 'files_changed_count', 'taken_at');

    return res.json({ ...project, snapshots });
  } catch (err) {
    console.error(`[code-projects GET /${req.params.id}] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to fetch project', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/code-projects/:id
// Update watch_status, snapshot_interval_minutes, or backup_account_id
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { watch_status, snapshot_interval_minutes, backup_account_id } = req.body;

  // Must have at least one field to update
  if (watch_status === undefined && snapshot_interval_minutes === undefined && backup_account_id === undefined) {
    return res.status(400).json({
      error: 'Provide at least one field to update: watch_status, snapshot_interval_minutes, backup_account_id',
    });
  }

  // Field-level validation
  if (watch_status !== undefined && !VALID_WATCH_STATUSES.includes(watch_status)) {
    return res.status(400).json({
      error: `watch_status must be one of: ${VALID_WATCH_STATUSES.join(', ')}`,
    });
  }

  if (snapshot_interval_minutes !== undefined) {
    const interval = parseInt(snapshot_interval_minutes, 10);
    if (!Number.isInteger(interval) || interval < 1) {
      return res.status(400).json({ error: '`snapshot_interval_minutes` must be a positive integer' });
    }
  }

  if (backup_account_id !== undefined && backup_account_id !== null) {
    if (!isValidUuid(backup_account_id)) {
      return res.status(400).json({ error: '`backup_account_id` must be a valid UUID or null' });
    }
    const account = await db('cloud_accounts')
      .where({ id: backup_account_id, user_id: req.user.id })
      .first();
    if (!account) {
      return res.status(404).json({ error: `cloud_account not found or not owned by user: ${backup_account_id}` });
    }
  }

  try {
    const updates = {};
    if (watch_status !== undefined)             updates.watch_status = watch_status;
    if (snapshot_interval_minutes !== undefined) updates.snapshot_interval_minutes = parseInt(snapshot_interval_minutes, 10);
    if (backup_account_id !== undefined)         updates.backup_account_id = backup_account_id; // null allowed

    const [updated] = await db('code_projects')
      .where({ id, user_id: req.user.id })
      .update(updates)
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: `Project not found: ${id}` });
    }

    return res.json(updated);
  } catch (err) {
    console.error(`[code-projects PATCH /${req.params.id}] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to update project', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/code-projects/:id
// Remove a tracked project (snapshots cascade via FK)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db('code_projects')
      .where({ id, user_id: req.user.id })
      .delete();

    if (!deleted) {
      return res.status(404).json({ error: `Project not found: ${id}` });
    }

    return res.json({ success: true, deleted: id });
  } catch (err) {
    console.error(`[code-projects DELETE /${req.params.id}] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to delete project', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/code-projects/:id/snapshots
// Called by the CLI watcher every time it takes a snapshot
// Body: { filesChangedCount }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/snapshots', async (req, res) => {
  const { id } = req.params;
  const { filesChangedCount } = req.body;

  const count = parseInt(filesChangedCount ?? 0, 10);
  if (!Number.isInteger(count) || count < 0) {
    return res.status(400).json({ error: '`filesChangedCount` must be a non-negative integer' });
  }

  try {
    // Verify project belongs to authenticated user
    const project = await db('code_projects').where({ id, user_id: req.user.id }).first();
    if (!project) {
      return res.status(404).json({ error: `Project not found: ${id}` });
    }

    const now = new Date();

    // Insert snapshot row
    const [snapshot] = await db('snapshots')
      .insert({
        project_id: id,
        files_changed_count: count,
        taken_at: now,
      })
      .returning('*');

    // Update parent project's last_snapshot_at
    await db('code_projects')
      .where({ id })
      .update({ last_snapshot_at: now });

    return res.status(201).json(snapshot);
  } catch (err) {
    console.error(`[code-projects POST /${req.params.id}/snapshots] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to log snapshot', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/code-projects/:id/commit
// Called by the CLI after a successful git push — records the event for the
// dashboard. Does NOT perform any git operations itself.
// Body: { commitMessage }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/commit', async (req, res) => {
  const { id } = req.params;
  const { commitMessage } = req.body;

  if (!commitMessage || typeof commitMessage !== 'string' || !commitMessage.trim()) {
    return res.status(400).json({ error: '`commitMessage` is required' });
  }

  try {
    const [updated] = await db('code_projects')
      .where({ id, user_id: req.user.id })
      .update({
        last_commit_message: commitMessage.trim(),
        last_commit_at: new Date(),
      })
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: `Project not found: ${id}` });
    }

    return res.json({
      success: true,
      project_id: id,
      last_commit_message: updated.last_commit_message,
      last_commit_at: updated.last_commit_at,
    });
  } catch (err) {
    console.error(`[code-projects POST /${req.params.id}/commit] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to record commit', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/code-projects/:id/generate-commit
// Agentic flow (Stage 4)
// Calls Commit Composer and Code Guardian via orchestrator. Stateless (no DB).
// Body: { diffText }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/generate-commit', async (req, res) => {
  const { id } = req.params;
  const { diffText } = req.body;

  if (!diffText || typeof diffText !== 'string' || !diffText.trim()) {
    return res.status(400).json({ error: '`diffText` is required and must be a string' });
  }

  try {
    // Verify project belongs to authenticated user before running expensive AI calls
    const project = await db('code_projects').where({ id, user_id: req.user.id }).first();
    if (!project) {
      return res.status(404).json({ error: `Project not found: ${id}` });
    }

    const result = await handleGitpushTrigger(diffText);
    return res.json(result);
  } catch (err) {
    console.error(`[code-projects POST /${req.params.id}/generate-commit] Error:`, err.message);
    return res.status(500).json({ error: 'Failed to generate commit', detail: err.message });
  }
});

module.exports = router;
