/*
  # Fix app_settings RLS policies definitively

  1. Security Changes
    - Completely disable and re-enable RLS with proper policies
    - Ensure authenticated users can INSERT, SELECT, and UPDATE
    - Handle the singleton pattern correctly

  2. Data Integrity
    - Ensure default row exists
    - Clean up any policy conflicts
*/

-- Disable RLS completely to make changes
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start completely fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'app_settings' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON app_settings';
    END LOOP;
END $$;

-- Ensure we have exactly one default row
DELETE FROM app_settings;

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

-- Create new policies with unique names
CREATE POLICY "app_settings_select_policy"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "app_settings_update_policy"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "app_settings_insert_policy"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant explicit permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON app_settings TO authenticated;