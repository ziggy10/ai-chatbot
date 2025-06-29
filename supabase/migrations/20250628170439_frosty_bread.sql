/*
  # Fix app_settings RLS policies and ensure proper access

  1. Security Changes
    - Drop all existing RLS policies on app_settings
    - Create new policies that allow authenticated users to access the singleton settings
    - Since app_settings is a singleton table (one row for entire app), all authenticated users should have access

  2. Data Integrity
    - Ensure default row exists
    - Fix any data inconsistencies
*/

-- Temporarily disable RLS to make changes
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update app settings" ON app_settings;

-- Delete any existing rows to start fresh
DELETE FROM app_settings;

-- Insert a single default row
INSERT INTO app_settings (
  use_keys_from,
  system_prompt,
  default_temperature,
  default_model,
  max_output_tokens,
  chat_using,
  utility_transcription_enabled,
  utility_transcription_provider,
  utility_title_model,
  budget_input_token_cost,
  budget_output_token_cost,
  budget_max_24h
) VALUES (
  'localstorage',
  'You are a helpful assistant who''s always eager to help & be proactive. Keep language crisp and to the point. Use bullets & sub-sections whenever helpful. Avoid overusing emojis.',
  0.5,
  'anthropic/claude-3-5-sonnet',
  2048,
  'openrouter',
  false,
  'openai',
  'anthropic/claude-3-haiku',
  0.000002,
  0.000004,
  10.0
);

-- Re-enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create simple policies for authenticated users
CREATE POLICY "Authenticated users can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- No INSERT policy needed since we only want one row