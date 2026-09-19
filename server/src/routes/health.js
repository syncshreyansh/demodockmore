/**
 * Health-check router.
 *
 * GET /api/health — liveness probe (no DB required)
 * GET /api/health/db — readiness probe (verifies DB connection)
 */

const express = require('express');
const db = require('../db/connection');

const router = express.Router();

// ── Liveness probe ──────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Readiness probe (DB ping) ───────────────────────────────────────────────
router.get('/db', async (_req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[health/db] DB connection failed:', err.message);
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      message: err.message,
    });
  }
});

module.exports = router;
