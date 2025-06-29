/*
  # Add bookmark and user name features

  1. Schema Changes
    - Add is_bookmarked column to threads table
    - Add user_name column to app_settings table

  2. Security
    - Maintain existing RLS policies
*/

-- Add is_bookmarked column to threads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'threads' AND column_name = 'is_bookmarked'
  ) THEN
    ALTER TABLE threads ADD COLUMN is_bookmarked boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add user_name column to app_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN user_name text;
  END IF;
END $$;

-- Update existing app_settings row to include user_name
UPDATE app_settings SET user_name = NULL WHERE user_name IS NULL;