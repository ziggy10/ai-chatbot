/*
  # Fix App Settings RLS Policy Issues

  1. Changes
    - Add user_id column to app_settings table
    - Update RLS policies to work with user-specific settings
    - Add unique constraint to ensure one settings row per user
    - Update existing data to work with new schema

  2. Security
    - Users can only access their own settings
    - Each user gets their own settings row
*/

-- Add user_id column to app_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update existing settings to have a user_id (if any exist)
-- This will assign existing settings to the first authenticated user, or delete them if no users exist
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user ID
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Update existing settings to belong to the first user
    UPDATE app_settings SET user_id = first_user_id WHERE user_id IS NULL;
  ELSE
    -- If no users exist, delete existing settings (they'll be recreated when a user signs in)
    DELETE FROM app_settings WHERE user_id IS NULL;
  END IF;
END $$;

-- Make user_id NOT NULL after updating existing data
ALTER TABLE app_settings ALTER COLUMN user_id SET NOT NULL;

-- Drop the old single-row constraint
DROP INDEX IF EXISTS app_settings_single_row;

-- Add unique constraint to ensure one settings row per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'app_settings_user_id_unique'
  ) THEN
    ALTER TABLE app_settings ADD CONSTRAINT app_settings_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Update RLS policies to work with user-specific settings
DROP POLICY IF EXISTS "app_settings_insert_policy" ON app_settings;
DROP POLICY IF EXISTS "app_settings_select_policy" ON app_settings;
DROP POLICY IF EXISTS "app_settings_update_policy" ON app_settings;

-- Create new RLS policies for user-specific settings
CREATE POLICY "Users can insert own settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON app_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);