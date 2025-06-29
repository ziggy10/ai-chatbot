/*
  # Fix app_settings table schema and RLS policies

  1. Schema Changes
    - Remove user_id column since this is a singleton table for app-wide settings
    - Update RLS policies to work without user context
    - Ensure proper singleton constraint

  2. Security
    - Allow all authenticated users to read/write app settings
    - Maintain singleton pattern (only one row allowed)
*/

-- First, disable RLS temporarily to make changes
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update app settings" ON app_settings;

-- Remove user_id column since this is a singleton table
ALTER TABLE app_settings DROP COLUMN IF EXISTS user_id;

-- Re-enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

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

-- Ensure we have a default row if none exists
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
) ON CONFLICT DO NOTHING;