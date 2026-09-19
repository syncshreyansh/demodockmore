

'use strict';

const { commitComposer } = require('./commitComposer');
const { codeGuardian }   = require('./codeGuardian');

/**
 * Run both agents concurrently and return their combined output.
 * @param {string} diffText  Raw output of `git diff`
 * @returns {Promise<{ commitMessage: string, warnings: string[] }>}
 */
async function handleGitpushTrigger(diffText) {
  const [commitMessage, guardianResult] = await Promise.all([
    commitComposer(diffText),
    codeGuardian(diffText),
  ]);

  return {
    commitMessage,
    warnings: guardianResult.warnings,
  };
}

module.exports = { handleGitpushTrigger };
