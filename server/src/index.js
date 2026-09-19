/**
 * DockMore — Express entry point (Stage 2)
 *
 * Responsibilities:
 *   - Load environment variables
 *   - Configure middleware (CORS, JSON body parser)
 *   - Mount route modules
 *   - Start the HTTP server
 */

'use strict';

// ── Environment ──────────────────────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const healthRouter        = require('./routes/health');
const googleAuthRouter    = require('./routes/auth.google');
const accountsRouter      = require('./routes/accounts');
const codeProjectsRouter  = require('./routes/codeProjects');

// ── App setup ────────────────────────────────────────────────────────────────
const app = express();

// CORS — allow requests from the Vite dev server (and any configured FRONTEND_URL)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Parse incoming JSON bodies
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health',        healthRouter);
app.use('/api/auth/google',   googleAuthRouter);   // /connect, /callback
app.use('/api/accounts',      accountsRouter);     // /:accountId/files
app.use('/api/code-projects', codeProjectsRouter); // CRUD + /snapshots + /commit

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Server start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[dockmore-server] Running on http://localhost:${PORT}`);
  console.log(`[dockmore-server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[dockmore-server] Routes: /api/health | /api/auth/google | /api/accounts`);
});

module.exports = app;
