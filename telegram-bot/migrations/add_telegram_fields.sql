-- Migration: Add Telegram integration fields to tutors table
-- Run this SQL script on your PostgreSQL database before starting the bot

-- Add Telegram ID field (unique identifier for Telegram users)
ALTER TABLE tutors
ADD COLUMN IF NOT EXISTS telegram_id TEXT UNIQUE;

-- Add Telegram username field (optional)
ALTER TABLE tutors
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Add notifications enabled flag
ALTER TABLE tutors
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT false;

-- Create index on telegram_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tutors_telegram_id ON tutors(telegram_id);

-- Create index on notifications_enabled for alert queries
CREATE INDEX IF NOT EXISTS idx_tutors_notifications_enabled ON tutors(notifications_enabled) WHERE notifications_enabled = true;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! Telegram fields added to tutors table.';
END $$;
