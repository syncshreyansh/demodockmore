/**
 * Google OAuth routes
 *
 * GET /api/auth/google/connect   — redirect to Google consent screen (requires auth)
 * GET /api/auth/google/callback  — receive code, exchange, store, redirect
 */

'use strict';

const express = require('express');
const crypto = require('crypto');
const db = require('../db/connection');
const googleDrive = require('../providers/GoogleDriveProvider');
const { encrypt } = require('../auth/tokenManager');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// ── GET /api/auth/google/connect ─────────────────────────────────────────────
router.get('/connect', requireAuth, (req, res) => {
  // Encode authenticated user's id along with random CSRF nonce into state
  const stateData = {
    userId: req.user.id,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');

  const authUrl = googleDrive.getAuthUrl(state);
  return res.redirect(authUrl);
});

// ── GET /api/auth/google/callback ────────────────────────────────────────────
router.get('/callback', async (req, res) => {
  const { code, error, state } = req.query;

  if (error) {
    console.error('[google/callback] OAuth error:', error);
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // 1. Exchange code for tokens + user info
    const { accessToken, refreshToken, expiresAt, email, name } =
      await googleDrive.exchangeCode(code);

    // 2. Decode user ID from state if present
    let targetUserId = null;
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        if (parsed && parsed.userId) {
          targetUserId = parsed.userId;
        }
      } catch (stateErr) {
        console.warn('[google/callback] Failed to decode OAuth state:', stateErr.message);
      }
    }

    let user = null;
    if (targetUserId) {
      user = await db('users').where({ id: targetUserId }).first();
    }

    // Fallback: match or create by email if state wasn't available
    if (!user) {
      user = await db('users').where({ email }).first();
      if (!user) {
        const [inserted] = await db('users')
          .insert({ email, name: name || email })
          .returning('*');
        user = inserted;
      }
    }

    // 3. Check if this Google account is already connected for this user
    const existing = await db('cloud_accounts')
      .where({ user_id: user.id, provider: 'google_drive', account_email: email })
      .first();

    const accountData = {
      provider: 'google_drive',
      account_email: email,
      access_token_enc: encrypt(accessToken),
      refresh_token_enc: encrypt(refreshToken),
      expires_at: expiresAt,
      scopes: db.raw("ARRAY['drive','userinfo.email','userinfo.profile']"),
      status: 'active',
      last_synced_at: new Date(),
    };

    let accountId;
    if (existing) {
      // Update tokens on re-auth
      await db('cloud_accounts').where({ id: existing.id }).update(accountData);
      accountId = existing.id;
      console.log(`[google/callback] Re-authenticated account ${accountId} (${email}) for user ${user.id}`);
    } else {
      const [newAccount] = await db('cloud_accounts')
        .insert({ user_id: user.id, ...accountData })
        .returning('id');
      accountId = newAccount.id;
      console.log(`[google/callback] New account created: ${accountId} (${email}) for user ${user.id}`);
    }

    // 4. Redirect back to frontend
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accounts?connected=${accountId}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('[google/callback] Error during OAuth exchange:', err);
    return res.status(500).json({ error: 'OAuth callback failed', detail: err.message });
  }
});

module.exports = router;
