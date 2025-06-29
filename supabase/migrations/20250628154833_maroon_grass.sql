/*
  # Fix app_settings RLS policies

  1. Security Changes
    - Drop existing restrictive RLS policies on app_settings table
    - Add new policies that allow authenticated users to access the singleton settings row
    - Allow INSERT only if no row exists (singleton pattern)
    - Allow SELECT and UPDATE for all authenticated users

  The app_settings table is designed as a singleton table for global application settings,
  not user-specific settings, so the policies should reflect this.
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Allow authenticated users to insert app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to read app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update app settings" ON app_settings;

-- Create new policies for singleton app_settings access
CREATE POLICY "Allow authenticated users to read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert app settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM app_settings));

CREATE POLICY "Allow authenticated users to update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);