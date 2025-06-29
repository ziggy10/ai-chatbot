/*
  # Fix app_settings RLS policies

  1. Security Changes
    - Add INSERT policy for authenticated users to create app_settings
    - The table appears to be a singleton table (single row for entire app)
    - Allow authenticated users to insert if no row exists

  2. Notes
    - The app_settings table has a unique constraint on (true) making it a singleton
    - This means only one row can exist in the entire table
    - The INSERT policy should allow creation only if no row exists
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert app settings" ON app_settings;

-- Create INSERT policy for authenticated users
-- Allow insert only if no row exists (singleton pattern)
CREATE POLICY "Users can insert app settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM app_settings)
  );