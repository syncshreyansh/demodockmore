/**
 * GoogleDriveProvider — implements CloudProvider for Google Drive v3
 *
 * Stateless: every method receives a plain access token.
 * OAuth credential config (clientId / clientSecret / redirectUri) comes from
 * environment variables so no secrets are hard-coded.
 */

'use strict';

const { google } = require('googleapis');
const CloudProvider = require('./CloudProvider');

class GoogleDriveProvider extends CloudProvider {
  constructor() {
    super('google_drive');

    // Build a reusable OAuth2 client with app credentials.
    // Tokens are injected per-call via _getClient().
    this._oauth2Config = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    };
  }

  // ── Internal helpers ─────────────────────────────────────────────────────

  /**
   * Return a googleapis OAuth2 client pre-loaded with the given access token.
   * @param {string} accessToken
   */
  _getClient(accessToken) {
    const auth = new google.auth.OAuth2(
      this._oauth2Config.clientId,
      this._oauth2Config.clientSecret,
      this._oauth2Config.redirectUri
    );
    auth.setCredentials({ access_token: accessToken });
    return auth;
  }

  /**
   * Return a googleapis OAuth2 client with NO pre-set token (for refresh).
   */
  _getFreshOAuth2Client() {
    return new google.auth.OAuth2(
      this._oauth2Config.clientId,
      this._oauth2Config.clientSecret,
      this._oauth2Config.redirectUri
    );
  }

  // ── CloudProvider implementation ─────────────────────────────────────────

  /**
   * List files in Google Drive.
   * @param {string} accessToken
   * @param {string} [folderId]  defaults to 'root'
   */
  async listFiles(accessToken, folderId = 'root') {
    const auth = this._getClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    const query = folderId === 'root'
      ? `'root' in parents and trashed = false`
      : `'${folderId}' in parents and trashed = false`;

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, modifiedTime, parents)',
      pageSize: 100,
      orderBy: 'name',
    });

    return (response.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size ? parseInt(f.size, 10) : null,
      modifiedAt: f.modifiedTime,
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
      parents: f.parents || [],
    }));
  }

  /**
   * Upload a file stream to Google Drive.
   * @param {string} accessToken
   * @param {import('stream').Readable} fileStream
   * @param {{ name: string, mimeType: string, parentId?: string }} meta
   */
  async uploadFile(accessToken, fileStream, meta) {
    const auth = this._getClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    const requestBody = {
      name: meta.name,
      ...(meta.parentId && { parents: [meta.parentId] }),
    };

    const response = await drive.files.create({
      requestBody,
      media: { mimeType: meta.mimeType, body: fileStream },
      fields: 'id, name',
    });

    return { id: response.data.id, name: response.data.name };
  }

  /**
   * Download a file from Google Drive — returns a readable stream.
   * @param {string} accessToken
   * @param {string} fileId
   */
  async downloadFile(accessToken, fileId) {
    const auth = this._getClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return response.data; // Readable stream
  }

  /**
   * Permanently delete a file.
   * @param {string} accessToken
   * @param {string} fileId
   */
  async deleteFile(accessToken, fileId) {
    const auth = this._getClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.delete({ fileId });
  }

  /**
   * Create a folder in Google Drive.
   * @param {string} accessToken
   * @param {string} name
   * @param {string} [parentId]
   */
  async createFolder(accessToken, name, parentId) {
    const auth = this._getClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    const requestBody = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] }),
    };

    const response = await drive.files.create({
      requestBody,
      fields: 'id, name',
    });

    return { id: response.data.id, name: response.data.name };
  }

  /**
   * Get storage quota.
   * @param {string} accessToken
   */
  async getStorageInfo(accessToken) {
    const auth = this._getClient(accessToken);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.about.get({
      fields: 'storageQuota',
    });

    const q = response.data.storageQuota;
    return {
      used: q.usage ? parseInt(q.usage, 10) : 0,
      total: q.limit ? parseInt(q.limit, 10) : null, // null = unlimited (GSuite)
    };
  }

  /**
   * Exchange a refresh token for a new access token.
   * @param {string} storedRefreshToken
   * @returns {Promise<{ accessToken: string, expiresAt: Date }>}
   */
  async refreshToken(storedRefreshToken) {
    const auth = this._getFreshOAuth2Client();
    auth.setCredentials({ refresh_token: storedRefreshToken });

    const { credentials } = await auth.refreshAccessToken();

    return {
      accessToken: credentials.access_token,
      expiresAt: new Date(credentials.expiry_date),
    };
  }

  // ── OAuth helpers (used by auth routes, not part of CloudProvider base) ──

  /**
   * Build the Google consent-screen URL.
   * @param {string} state  CSRF-safe opaque value
   */
  getAuthUrl(state) {
    const auth = this._getFreshOAuth2Client();
    return auth.generateAuthUrl({
      access_type: 'offline',   // needed to receive a refresh_token
      prompt: 'consent',        // force refresh_token even on re-auth
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state,
    });
  }

  /**
   * Exchange an authorization code for tokens.
   * @param {string} code
   * @returns {Promise<{ accessToken, refreshToken, expiresAt, email, name }>}
   */
  async exchangeCode(code) {
    const auth = this._getFreshOAuth2Client();
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    // Fetch user profile via the oauth2 v2 userinfo endpoint
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfo = await oauth2.userinfo.get();

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date),
      email: userInfo.data.email,
      name: userInfo.data.name,
    };
  }
}

module.exports = new GoogleDriveProvider(); // singleton — stateless, safe to share
