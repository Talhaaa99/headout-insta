-- Complete Migration: Add missing columns to profiles table
-- This migration adds display_name and profile_picture_url columns

-- Add display_name column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add profile_picture_url column  
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN profiles.display_name IS 'User display name from Clerk authentication';
COMMENT ON COLUMN profiles.profile_picture_url IS 'URL to user profile picture from Clerk';

-- Update existing profiles to use username as display_name if display_name is null
UPDATE profiles 
SET display_name = username 
WHERE display_name IS NULL AND username IS NOT NULL;
