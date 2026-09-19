/**
 * Knex configuration file.
 *
 * Knex reads this file when you run knex CLI commands via the `--knexfile` flag.
 * The `development` config is also imported by src/db/connection.js at runtime.
 *
 * CONNECTION NOTES (from Supabase docs):
 * - Migrations must use the Session pooler (port 5432) or Direct connection.
 * - Direct connection is IPv6-only on the free plan — use Session pooler if on IPv4.
 * - Session pooler username = postgres.[PROJECT-REF]  (NOT just postgres)
 * - The pooler host MUST be copied from the Supabase Dashboard → Connect dialog.
 *   It cannot be guessed from the region name (e.g. aws-0 vs aws-1).
 * - SSL: pass individual connection fields (host/port/user/password/database) so
 *   pg-connection-string cannot override the ssl option we set here.
 */

// Load .env when running knex CLI directly
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

/**
 * Parse a postgres:// URL into individual pg connection parameters.
 * Parsing manually (instead of passing connectionString) ensures our
 * ssl: { rejectUnauthorized: false } is respected and not overridden
 * by pg-connection-string's own ssl flag parsing.
 *
 * @param {string} url
 */
function parseDbUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || '5432', 10),
    database: u.pathname.replace(/^\//, ''),
    user: u.username,
    password: decodeURIComponent(u.password), // %40 → @, %23 → #, etc.
    ssl: { rejectUnauthorized: false },
  };
}

const connectionParams = parseDbUrl(process.env.DATABASE_URL);

/** @type {import('knex').Knex.Config} */
const config = {
  development: {
    client: 'pg',
    connection: connectionParams,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    pool: { min: 2, max: 10 },
  },

  production: {
    client: 'pg',
    connection: connectionParams,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    pool: { min: 2, max: 10 },
  },
};

module.exports = config;
