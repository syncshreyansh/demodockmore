/**
 * CloudProvider — base interface / abstract class
 *
 * Every cloud provider implementation (Google Drive, Dropbox, OneDrive, etc.)
 * must extend this class and implement all methods below. Calling an
 * unimplemented method throws a clear error rather than failing silently.
 *
 * All methods receive a plain access token string (already decrypted by
 * tokenManager) rather than raw DB rows — providers should be stateless.
 */

'use strict';

class CloudProvider {
  /** @param {string} name  human-readable identifier, e.g. 'google_drive' */
  constructor(name) {
    this.name = name;
  }

  // ── File operations ──────────────────────────────────────────────────────

  /**
   * List files in a folder (or root if folderId omitted).
   * @param {string} accessToken
   * @param {string} [folderId]
   * @returns {Promise<Array<{id, name, mimeType, size, modifiedAt, path}>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listFiles(accessToken, folderId) {
    throw new Error(`${this.name}: listFiles() not implemented`);
  }

  /**
   * Upload a file stream.
   * @param {string} accessToken
   * @param {import('stream').Readable} fileStream
   * @param {{ name: string, mimeType: string, parentId?: string }} meta
   * @returns {Promise<{ id: string, name: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async uploadFile(accessToken, fileStream, meta) {
    throw new Error(`${this.name}: uploadFile() not implemented`);
  }

  /**
   * Download a file by its provider-specific ID.
   * @param {string} accessToken
   * @param {string} fileId
   * @returns {Promise<import('stream').Readable>}
   */
  // eslint-disable-next-line no-unused-vars
  async downloadFile(accessToken, fileId) {
    throw new Error(`${this.name}: downloadFile() not implemented`);
  }

  /**
   * Permanently delete a file.
   * @param {string} accessToken
   * @param {string} fileId
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async deleteFile(accessToken, fileId) {
    throw new Error(`${this.name}: deleteFile() not implemented`);
  }

  /**
   * Create a folder.
   * @param {string} accessToken
   * @param {string} name
   * @param {string} [parentId]
   * @returns {Promise<{ id: string, name: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async createFolder(accessToken, name, parentId) {
    throw new Error(`${this.name}: createFolder() not implemented`);
  }

  // ── Account info ─────────────────────────────────────────────────────────

  /**
   * Return storage quota info.
   * @param {string} accessToken
   * @returns {Promise<{ used: number, total: number }>}
   */
  // eslint-disable-next-line no-unused-vars
  async getStorageInfo(accessToken) {
    throw new Error(`${this.name}: getStorageInfo() not implemented`);
  }

  // ── Token management ─────────────────────────────────────────────────────

  /**
   * Exchange a refresh token for a new access token.
   * @param {string} refreshToken
   * @returns {Promise<{ accessToken: string, expiresAt: Date }>}
   */
  // eslint-disable-next-line no-unused-vars
  async refreshToken(refreshToken) {
    throw new Error(`${this.name}: refreshToken() not implemented`);
  }
}

module.exports = CloudProvider;
