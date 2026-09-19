'use strict';

const crypto = require('crypto');
const db = require('../db/connection');
const { getProvider } = require('../providers');

// ── Key loading ───────────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must be set to a 64-character hex string. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, 'hex'); // 32 bytes
}

// ── Encryption / Decryption ───────────────────────────────────────────────────

/**
 * Encrypt a plain-text string with AES-256-GCM.
 * @param {string} plaintext
 * @returns {string}  "<iv>:<authTag>:<ciphertext>" all Base64
 */
function encrypt(plaintext) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypt a value produced by encrypt().
 * @param {string} encoded  "<iv>:<authTag>:<ciphertext>" all Base64
 * @returns {string}  original plain text
 */
function decrypt(encoded) {
  const key = getEncryptionKey();
  const [ivB64, authTagB64, ciphertextB64] = encoded.split(':');

  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

// ── Token refresh logic ───────────────────────────────────────────────────────

const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Return a valid (non-expired) access token for the given cloud account.
 *
 * - If the stored token is still valid (with a 5-min buffer), returns it.
 * - If expired / near-expiry, calls provider.refreshToken(), stores the
 *   new token encrypted, and returns the fresh one.
 * - If refresh fails with a revocation error, marks the account 'expired'
 *   and throws a descriptive error.
 *
 * @param {string} accountId  UUID from cloud_accounts table
 * @returns {Promise<string>}  plain-text access token ready to use
 */
async function getValidAccessToken(accountId) {
  const account = await db('cloud_accounts').where({ id: accountId }).first();
  if (!account) throw new Error(`Account not found: ${accountId}`);

  if (account.status === 'expired') {
    throw new Error(
      `Cloud account ${accountId} has expired/revoked credentials. ` +
      'User must reconnect.'
    );
  }

  // Check if token is still valid (with buffer)
  const now = Date.now();
  const expiresAt = account.expires_at ? new Date(account.expires_at).getTime() : 0;

  if (expiresAt - now > EXPIRY_BUFFER_MS) {
    // Token is fresh — just decrypt and return
    return decrypt(account.access_token_enc);
  }

  // Token is expired or near-expiry — refresh it
  console.log(`[tokenManager] Refreshing token for account ${accountId}`);

  const provider = getProvider(account.provider);

  try {
    const storedRefreshToken = decrypt(account.refresh_token_enc);
    const { accessToken, expiresAt: newExpiry } = await provider.refreshToken(storedRefreshToken);

    // Persist the new encrypted access token
    await db('cloud_accounts').where({ id: accountId }).update({
      access_token_enc: encrypt(accessToken),
      expires_at: newExpiry,
      last_synced_at: new Date(),
    });

    return accessToken;
  } catch (err) {
    // Detect revocation signals from Google
    const isRevoked =
      err.message?.includes('invalid_grant') ||
      err.message?.includes('Token has been expired or revoked') ||
      err.status === 401;

    if (isRevoked) {
      console.error(`[tokenManager] Token revoked for account ${accountId}. Marking expired.`);
      await db('cloud_accounts').where({ id: accountId }).update({ status: 'expired' });
      throw new Error(
        `Cloud account ${accountId} credentials were revoked. User must reconnect.`
      );
    }

    throw err; // Re-throw unexpected errors
  }
}

module.exports = { encrypt, decrypt, getValidAccessToken };
