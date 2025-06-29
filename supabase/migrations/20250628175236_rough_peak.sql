/*
  # Remove all authentication dependencies

  1. Drop dependent views first
  2. Remove user_id columns and constraints
  3. Recreate views without user_id references
  4. Update RLS policies for anonymous access
*/

-- Disable RLS temporarily to make changes
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE thread_errors DISABLE ROW LEVEL SECURITY;
ALTER TABLE microtasks DISABLE ROW LEVEL SECURITY;

-- Drop dependent views first to avoid cascade errors
DROP VIEW IF EXISTS thread_stats;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own settings" ON app_settings;
DROP POLICY IF EXISTS "Users can read own settings" ON app_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON app_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON app_settings;
DROP POLICY IF EXISTS "app_settings_select_policy" ON app_settings;
DROP POLICY IF EXISTS "app_settings_update_policy" ON app_settings;
DROP POLICY IF EXISTS "app_settings_insert_policy" ON app_settings;

DROP POLICY IF EXISTS "Users can read own threads" ON threads;
DROP POLICY IF EXISTS "Users can insert own threads" ON threads;
DROP POLICY IF EXISTS "Users can update own threads" ON threads;
DROP POLICY IF EXISTS "Users can delete own threads" ON threads;

DROP POLICY IF EXISTS "Users can read own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

DROP POLICY IF EXISTS "Users can read own thread errors" ON thread_errors;
DROP POLICY IF EXISTS "Users can insert own thread errors" ON thread_errors;
DROP POLICY IF EXISTS "Users can update own thread errors" ON thread_errors;
DROP POLICY IF EXISTS "Users can delete own thread errors" ON thread_errors;

DROP POLICY IF EXISTS "Users can read own microtasks" ON microtasks;
DROP POLICY IF EXISTS "Users can insert own microtasks" ON microtasks;
DROP POLICY IF EXISTS "Users can update own microtasks" ON microtasks;
DROP POLICY IF EXISTS "Users can delete own microtasks" ON microtasks;

-- Remove user_id columns and constraints
ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_user_id_unique;
ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_user_id_fkey;
ALTER TABLE app_settings DROP COLUMN IF EXISTS user_id;

ALTER TABLE threads DROP CONSTRAINT IF EXISTS threads_user_id_fkey;
ALTER TABLE threads DROP COLUMN IF EXISTS user_id;

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE messages DROP COLUMN IF EXISTS user_id;

ALTER TABLE thread_errors DROP CONSTRAINT IF EXISTS thread_errors_user_id_fkey;
ALTER TABLE thread_errors DROP COLUMN IF EXISTS user_id;

ALTER TABLE microtasks DROP CONSTRAINT IF EXISTS microtasks_user_id_fkey;
ALTER TABLE microtasks DROP COLUMN IF EXISTS user_id;

-- Drop user_id indexes
DROP INDEX IF EXISTS threads_user_id_idx;
DROP INDEX IF EXISTS messages_user_id_idx;
DROP INDEX IF EXISTS thread_errors_user_id_idx;
DROP INDEX IF EXISTS microtasks_user_id_idx;

-- Restore singleton constraint for app_settings
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_single_row ON app_settings ((true));

-- Clear existing data and insert default settings
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

-- Recreate thread_stats view without user_id references
CREATE OR REPLACE VIEW thread_stats AS
SELECT 
  t.id,
  t.title,
  t.created_at,
  t.updated_at,
  COALESCE(msg_stats.message_count, 0) as message_count,
  COALESCE(msg_stats.total_input_tokens, 0) as total_input_tokens,
  COALESCE(msg_stats.total_cached_tokens, 0) as total_cached_tokens,
  CASE 
    WHEN COALESCE(msg_stats.total_input_tokens, 0) > 0 
    THEN (COALESCE(msg_stats.total_cached_tokens, 0)::numeric / msg_stats.total_input_tokens::numeric * 100)
    ELSE 0 
  END as cached_tokens_percentage,
  COALESCE(msg_stats.total_output_tokens, 0) as total_output_tokens,
  COALESCE(msg_stats.total_tokens, 0) as total_tokens,
  COALESCE(msg_stats.total_input_cost, 0) as total_input_cost,
  COALESCE(msg_stats.total_output_cost, 0) as total_output_cost,
  COALESCE(msg_stats.total_cost, 0) + COALESCE(micro_stats.other_costs, 0) as total_cost,
  COALESCE(micro_stats.other_costs, 0) as other_costs,
  COALESCE(msg_stats.models, ARRAY[]::text[]) as models
FROM threads t
LEFT JOIN (
  SELECT 
    thread_id,
    COUNT(*) as message_count,
    SUM(COALESCE(input_tokens::numeric, 0)) as total_input_tokens,
    SUM(COALESCE(input_cached_tokens::numeric, 0)) as total_cached_tokens,
    SUM(COALESCE(output_tokens::numeric, 0)) as total_output_tokens,
    SUM(COALESCE(input_tokens::numeric, 0) + COALESCE(output_tokens::numeric, 0)) as total_tokens,
    SUM(calculate_input_cost(
      input_tokens, input_token_price, input_cached_tokens, input_cached_token_price,
      input_audio_tokens, input_audio_token_price, input_cached_audio_tokens, input_cached_audio_token_price,
      input_image_tokens, input_image_token_price, input_cached_image_tokens, input_cached_image_token_price
    )) as total_input_cost,
    SUM(calculate_output_cost(
      output_tokens, output_token_price, output_reasoning_tokens, output_reasoning_token_price,
      output_audio_tokens, output_audio_token_price, output_image_tokens, output_image_token_price
    )) as total_output_cost,
    SUM(
      calculate_input_cost(
        input_tokens, input_token_price, input_cached_tokens, input_cached_token_price,
        input_audio_tokens, input_audio_token_price, input_cached_audio_tokens, input_cached_audio_token_price,
        input_image_tokens, input_image_token_price, input_cached_image_tokens, input_cached_image_token_price
      ) + 
      calculate_output_cost(
        output_tokens, output_token_price, output_reasoning_tokens, output_reasoning_token_price,
        output_audio_tokens, output_audio_token_price, output_image_tokens, output_image_token_price
      )
    ) as total_cost,
    ARRAY_AGG(DISTINCT model) FILTER (WHERE model IS NOT NULL) as models
  FROM messages 
  GROUP BY thread_id
) msg_stats ON t.id = msg_stats.thread_id
LEFT JOIN (
  SELECT 
    thread_id,
    SUM(
      calculate_input_cost(
        input_tokens, input_token_price, input_cached_tokens, input_cached_token_price,
        input_audio_tokens, input_audio_token_price, input_cached_audio_tokens, input_cached_audio_token_price,
        input_image_tokens, input_image_token_price, input_cached_image_tokens, input_cached_image_token_price
      ) + 
      calculate_output_cost(
        output_tokens, output_token_price, output_reasoning_tokens, output_reasoning_token_price,
        output_audio_tokens, output_audio_token_price, output_image_tokens, output_image_token_price
      )
    ) as other_costs
  FROM microtasks 
  WHERE status = 'done'
  GROUP BY thread_id
) micro_stats ON t.id = micro_stats.thread_id;

-- Re-enable RLS with anonymous access policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE microtasks ENABLE ROW LEVEL SECURITY;

-- Create anonymous access policies for app_settings
CREATE POLICY "Allow anonymous access to app settings"
  ON app_settings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create anonymous access policies for threads
CREATE POLICY "Allow anonymous access to threads"
  ON threads
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create anonymous access policies for messages
CREATE POLICY "Allow anonymous access to messages"
  ON messages
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create anonymous access policies for thread_errors
CREATE POLICY "Allow anonymous access to thread errors"
  ON thread_errors
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create anonymous access policies for microtasks
CREATE POLICY "Allow anonymous access to microtasks"
  ON microtasks
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anonymous role
GRANT ALL ON app_settings TO anon;
GRANT ALL ON threads TO anon;
GRANT ALL ON messages TO anon;
GRANT ALL ON thread_errors TO anon;
GRANT ALL ON microtasks TO anon;