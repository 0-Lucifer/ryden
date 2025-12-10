-- Migration: Add provider column to users table and populate values

-- 1) Add column with nullable state and default 'local'
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(32) DEFAULT 'local';

-- 2) Set provider = 'firebase' for rows with firebase_uid
UPDATE users SET provider = 'firebase' WHERE firebase_uid IS NOT NULL AND TRIM(firebase_uid) <> '';

-- 3) Set provider = 'local' for rows that appear to have a password hash
UPDATE users SET provider = 'local' WHERE (password_hash IS NOT NULL AND TRIM(password_hash) <> '') AND (provider IS NULL OR provider = '');

-- 4) For any remaining null providers, default to 'local'
UPDATE users SET provider = 'local' WHERE provider IS NULL OR TRIM(provider) = '';

-- 5) Make column NOT NULL to enforce presence going forward
ALTER TABLE users ALTER COLUMN provider SET NOT NULL;

-- Optional: create an index for provider to speed lookups
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
