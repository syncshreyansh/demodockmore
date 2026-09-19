/**
 * Shared Knex database connection instance.
 *
 * Import this module wherever you need to run queries:
 *   const db = require('./db/connection');
 *   const rows = await db('users').select('*');
 */

const knex = require('knex');
const knexfile = require('./knexfile');

const env = process.env.NODE_ENV || 'development';
const config = knexfile[env];

const db = knex(config);

module.exports = db;
