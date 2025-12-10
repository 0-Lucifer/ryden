#!/usr/bin/env node
// Script: fix-providers.js
// Purpose: Ensure all users have a `provider` value ('local' or 'firebase')
// Usage: node scripts/fix-providers.js

const { pgPool } = require('../shared/database');

async function run() {
  try {
    console.log('Starting provider-fix script...');

    // 1. Add column if not exists
    await pgPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(32) DEFAULT 'local'");
    console.log('Ensured provider column exists with default local');

    // 2. Mark firebase users
    const res1 = await pgPool.query("UPDATE users SET provider = 'firebase' WHERE firebase_uid IS NOT NULL AND TRIM(firebase_uid) <> '' RETURNING COUNT(*)");
    console.log('Set provider=firebase for users with firebase_uid');

    // 3. Mark local users with password_hash
    await pgPool.query("UPDATE users SET provider = 'local' WHERE (password_hash IS NOT NULL AND TRIM(password_hash) <> '') AND (provider IS NULL OR provider = '')");
    console.log('Set provider=local for users with password_hash');

    // 4. Default remaining to local
    await pgPool.query("UPDATE users SET provider = 'local' WHERE provider IS NULL OR TRIM(provider) = ''");
    console.log('Defaulted any remaining null/empty provider to local');

    // 5. Make column NOT NULL
    await pgPool.query("ALTER TABLE users ALTER COLUMN provider SET NOT NULL");
    console.log('Set provider column to NOT NULL');

    // 6. Create index
    await pgPool.query("CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider)");
    console.log('Ensured index on provider');

    console.log('Provider fix completed successfully');
  } catch (err) {
    console.error('Error running provider fix:', err);
  } finally {
    await pgPool.end();
    process.exit(0);
  }
}

run();
