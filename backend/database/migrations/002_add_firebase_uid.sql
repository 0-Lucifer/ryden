-- Migration: Add Firebase UID column to users table
-- This enables Firebase Authentication integration

-- Add firebase_uid column
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- Make password_hash nullable for Firebase-only users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Create index on firebase_uid for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
