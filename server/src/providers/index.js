/**
 * Provider registry — getProvider(name) → CloudProvider instance
 *
 * Adding a new provider in a future stage is a one-line addition here:
 *   const dropboxProvider = require('./DropboxProvider');
 *   ...
 *   dropbox: dropboxProvider,
 *
 * Do NOT add business logic here — this file is purely a lookup table.
 */

'use strict';

const googleDriveProvider = require('./GoogleDriveProvider');

const PROVIDERS = {
  google_drive: googleDriveProvider,
  // dropbox:    dropboxProvider,   ← Stage 3
  // onedrive:   onedriveProvider,  ← Stage 3
};

/**
 * Return the provider implementation for the given name.
 * @param {string} providerName  e.g. 'google_drive'
 * @returns {import('./CloudProvider')}
 * @throws {Error} if the provider name is unknown
 */
function getProvider(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(
      `Unknown provider: "${providerName}". Supported: ${Object.keys(PROVIDERS).join(', ')}`
    );
  }
  return provider;
}

module.exports = { getProvider };
