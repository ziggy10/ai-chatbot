/*
  # Fix app_settings RLS policies

  1. Security Updates
    - Fix RLS policies to allow proper access to app_settings
    - The table is designed as a singleton (single row for entire app)
    - Allow authenticated users to read, insert (if empty), and update

  2. Changes
    - Drop and recreate all policies with proper permissions
    - Ensure default row exists
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Users can update app settings" ON app_settings;
DROP POLICY IF EXISTS "Users can insert app settings" ON app_settings;

-- Create new policies that allow all authenticated users access
-- Since this is a singleton table for app-wide settings
CREATE POLICY "Allow authenticated users to read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert app settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM app_settings));

-- Ensure we have a default row
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