-- Migration: Add application message and job special requests fields
-- Run this SQL script on your PostgreSQL database to add new fields for enhanced application flow

-- Add special requests field to jobs table (for parent's special requirements)
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Add message field to applications table (for tutor's personalized message)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS message TEXT;

-- Create index on applications for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_tutor_job ON applications(tutor_id, job_id);

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! Application message and job special requests fields added.';
END $$;
