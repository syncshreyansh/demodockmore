/**
 * Migration: 001 — Create core tables
 *
 * Tables created (in dependency order):
 *   1. users
 *   2. cloud_accounts
 *   3. files_cache
 *   4. transfers
 *   5. code_projects
 *   6. snapshots
 *   7. chain_verifications
 *
 * Uses PostgreSQL-native uuid_generate_v4() for primary keys (available on Supabase
 * via the pgcrypto extension, which is enabled by default).
 */

exports.up = async function (knex) {
  // ── Enable pgcrypto for uuid_generate_v4() ─────────────────────────────
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // ── 1. users ────────────────────────────────────────────────────────────
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email').notNullable().unique();
    t.string('name').notNullable();
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── 2. cloud_accounts ───────────────────────────────────────────────────
  await knex.schema.createTable('cloud_accounts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('provider').notNullable();                 // e.g. 'google_drive', 'dropbox'
    t.string('account_email').notNullable();
    t.text('access_token_enc');                       // encrypted at-rest (Stage 2+)
    t.text('refresh_token_enc');
    t.timestamp('expires_at', { useTz: true });
    t.specificType('scopes', 'text[]');               // PostgreSQL text array
    t.text('status').notNullable().defaultTo('active');
    t.timestamp('last_synced_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── 3. files_cache ──────────────────────────────────────────────────────
  await knex.schema.createTable('files_cache', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('cloud_account_id')
      .notNullable()
      .references('id')
      .inTable('cloud_accounts')
      .onDelete('CASCADE');
    t.text('provider_file_id').notNullable();         // ID as returned by the cloud provider
    t.text('name').notNullable();
    t.text('path');
    t.bigInteger('size_bytes');
    t.text('mime_type');
    t.timestamp('modified_at', { useTz: true });
    t.timestamp('synced_at', { useTz: true }).defaultTo(knex.fn.now());

    // Prevent duplicate entries for the same file in the same account
    t.unique(['cloud_account_id', 'provider_file_id']);
  });

  // ── 4. transfers ────────────────────────────────────────────────────────
  await knex.schema.createTable('transfers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('source_account_id')
      .notNullable()
      .references('id')
      .inTable('cloud_accounts')
      .onDelete('CASCADE');
    t.uuid('dest_account_id')
      .notNullable()
      .references('id')
      .inTable('cloud_accounts')
      .onDelete('CASCADE');
    t.text('file_name').notNullable();
    t.bigInteger('size_bytes');
    t.text('status').notNullable().defaultTo('in_progress');  // in_progress | done | failed
    t.integer('progress').notNullable().defaultTo(0);          // 0–100
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('completed_at', { useTz: true });
  });

  // ── 5. code_projects ────────────────────────────────────────────────────
  await knex.schema.createTable('code_projects', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('name').notNullable();
    t.text('local_path');
    t.uuid('backup_account_id').references('id').inTable('cloud_accounts').onDelete('SET NULL');
    t.integer('snapshot_interval_minutes').notNullable().defaultTo(15);
    t.text('watch_status').notNullable().defaultTo('paused'); // paused | watching
    t.timestamp('last_snapshot_at', { useTz: true });
    t.text('last_commit_message');
    t.timestamp('last_commit_at', { useTz: true });
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── 6. snapshots ────────────────────────────────────────────────────────
  await knex.schema.createTable('snapshots', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('project_id')
      .notNullable()
      .references('id')
      .inTable('code_projects')
      .onDelete('CASCADE');
    t.integer('files_changed_count').notNullable().defaultTo(0);
    t.timestamp('taken_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  // ── 7. chain_verifications ──────────────────────────────────────────────
  await knex.schema.createTable('chain_verifications', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('project_id')
      .notNullable()
      .references('id')
      .inTable('code_projects')
      .onDelete('CASCADE');
    t.text('content_hash').notNullable();   // SHA-256 / IPFS CID etc.
    t.text('tx_hash');                       // blockchain tx hash (filled post-submission)
    t.timestamp('block_timestamp', { useTz: true });
    t.text('explorer_url');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  // Drop in reverse dependency order
  await knex.schema.dropTableIfExists('chain_verifications');
  await knex.schema.dropTableIfExists('snapshots');
  await knex.schema.dropTableIfExists('code_projects');
  await knex.schema.dropTableIfExists('transfers');
  await knex.schema.dropTableIfExists('files_cache');
  await knex.schema.dropTableIfExists('cloud_accounts');
  await knex.schema.dropTableIfExists('users');
};
