-- Migration: Add display_name column to profiles table
-- This migration adds the display_name column to store user's display names from Clerk

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN profiles.display_name IS 'User display name from Clerk authentication';

-- Update existing profiles to use username as display_name if display_name is null
UPDATE profiles 
SET display_name = username 
WHERE display_name IS NULL AND username IS NOT NULL;
