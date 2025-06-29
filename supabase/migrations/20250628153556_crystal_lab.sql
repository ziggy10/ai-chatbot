/*
  # Fix app_settings RLS policies

  1. Security Updates
    - Drop and recreate INSERT policy to allow authenticated users to create settings
    - Ensure singleton pattern is maintained
    - Fix RLS violations for app_settings table

  2. Changes
    - Allow authenticated users to insert if no row exists
    - Maintain existing read/update policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert app settings" ON app_settings;

-- Create proper INSERT policy for authenticated users
CREATE POLICY "Users can insert app settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM app_settings)
  );

-- Ensure we have a default row if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM app_settings) THEN
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
  END IF;
END $$;