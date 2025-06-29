/*
  # Create messages table

  1. New Tables
    - `messages`
      - Chat messages with comprehensive cost and usage tracking
      - Links to threads table
      - Supports multiple providers and models

  2. Security
    - Enable RLS on `messages` table
    - Add policy for authenticated users to manage their messages

  3. Indexes
    - Performance indexes on common query fields
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
  column_position integer NOT NULL DEFAULT 0,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content text,
  tool_call jsonb,
  model text,
  provider text CHECK (provider IN ('openrouter', 'openai')),
  external_id text,
  raw_output jsonb,
  
  -- Cost fields (per token pricing, up to 12 decimal places)
  input_token_price text,
  input_cached_token_price text,
  input_audio_token_price text,
  input_cached_audio_token_price text,
  input_image_token_price text,
  input_cached_image_token_price text,
  output_token_price text,
  output_audio_token_price text,
  output_image_token_price text,
  output_reasoning_token_price text,
  
  -- Usage fields
  input_tokens text,
  input_cached_tokens text,
  input_audio_tokens text,
  input_cached_audio_tokens text,
  input_image_tokens text,
  input_cached_image_tokens text,
  output_tokens text,
  output_audio_tokens text,
  output_image_tokens text,
  output_reasoning_tokens text,
  
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS messages_thread_id_idx ON messages(thread_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS messages_role_idx ON messages(role);
CREATE INDEX IF NOT EXISTS messages_content_idx ON messages USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS messages_model_idx ON messages(model);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);