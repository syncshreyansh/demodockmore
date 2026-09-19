#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';
import fetch from 'node-fetch';

// ── Config from environment ──────────────────────────────────────────────────
const PROJECT_DIR  = process.env.DOCKMORE_PROJECT_DIR;
const SHADOW_DIR   = process.env.DOCKMORE_SHADOW_DIR;
const PROJECT_ID   = process.env.DOCKMORE_PROJECT_ID;
const INTERVAL_MIN = parseInt(process.env.DOCKMORE_INTERVAL || '15', 10);
const TOKEN        = process.env.DOCKMORE_TOKEN;
const API_BASE     = process.env.DOCKMORE_API_URL || 'http://localhost:5000';

if (!PROJECT_DIR || !SHADOW_DIR || !PROJECT_ID || !TOKEN) {
  process.exit(1);
}

// ── Shadow git instance ──────────────────────────────────────────────────────
const git = simpleGit({
  baseDir: PROJECT_DIR,
}).env({
  GIT_DIR: SHADOW_DIR,
  GIT_WORK_TREE: PROJECT_DIR,
});

// ── Main loop ────────────────────────────────────────────────────────────────
async function snapshot() {
  try {
    const status = await git.status();
    const changedCount = status.files.length;

    if (changedCount === 0) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await git.add('-A');
    await git.commit(`snapshot: ${timestamp} (${changedCount} files changed)`);

    // Notify backend
    await fetch(`${API_BASE}/api/code-projects/${PROJECT_ID}/snapshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ filesChangedCount: changedCount }),
    });
  } catch (err) {
    // Silently continue — daemon should never crash
    const logPath = path.join(SHADOW_DIR, 'daemon-error.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${err.message}\n`);
  }
}

// Initial snapshot
await snapshot();

// Set interval
const intervalMs = INTERVAL_MIN * 60 * 1000;
setInterval(snapshot, intervalMs);

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});
