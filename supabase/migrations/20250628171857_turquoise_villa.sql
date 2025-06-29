/*
  # Ensure app_settings row exists and fix RLS

  1. Security Changes
    - Temporarily disable RLS to insert default row
    - Add INSERT policy for creating settings if none exist
    - Ensure proper policies exist

  2. Data Integrity
    - Insert default settings row if none exists
    - Ensure singleton constraint works properly
*/

-- Temporarily disable RLS to ensure we can insert default data
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Insert default settings if none exist
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
) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- Re-enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can update app settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can insert app settings" ON app_settings;

-- Create comprehensive policies
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

CREATE POLICY "Authenticated users can insert app settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM app_settings));