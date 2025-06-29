/*
  # Create app_settings table

  1. New Tables
    - `app_settings`
      - Single row table for application settings
      - Contains API keys, system prompts, and configuration
      - Enforced single row constraint

  2. Security
    - Enable RLS on `app_settings` table
    - Add policy for authenticated users to read/write settings
*/

-- Create app_settings table with single row constraint
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_keys_from text NOT NULL DEFAULT 'localstorage' CHECK (use_keys_from IN ('localstorage', 'database')),
  dangerous_openai_api_key text,
  dangerous_openrouter_api_key text,
  dangerous_huggingface_api_key text,
  system_prompt text NOT NULL DEFAULT 'You are a helpful assistant who''s always eager to help & be proactive. Keep language crisp and to the point. Use bullets & sub-sections whenever helpful. Avoid overusing emojis.',
  default_temperature numeric(3,2) NOT NULL DEFAULT 0.5 CHECK (default_temperature >= 0 AND default_temperature <= 2),
  default_model text,
  max_output_tokens integer NOT NULL DEFAULT 0 CHECK (max_output_tokens >= 0),
  chat_using text NOT NULL DEFAULT 'openrouter' CHECK (chat_using IN ('openrouter', 'openai')),
  utility_transcription_enabled boolean NOT NULL DEFAULT false,
  utility_transcription_provider text DEFAULT 'openai' CHECK (utility_transcription_provider IN ('openai', 'huggingface')),
  utility_transcription_model text,
  utility_title_model text DEFAULT 'anthropic/claude-3-haiku',
  budget_input_token_cost numeric(15,12) NOT NULL DEFAULT 0.000002,
  budget_output_token_cost numeric(15,12) NOT NULL DEFAULT 0.000004,
  budget_max_24h numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure only one row can exist
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_single_row ON app_settings ((true));

-- Insert default settings row
INSERT INTO app_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();