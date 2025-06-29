/*
  # Create microtasks table

  1. New Tables
    - `microtasks`
      - Background tasks like transcription and title generation
      - Comprehensive cost and usage tracking
      - Links to threads table

  2. Security
    - Enable RLS on `microtasks` table
    - Add policy for authenticated users to manage their microtasks

  3. Indexes
    - Performance indexes on common query fields
*/

CREATE TABLE IF NOT EXISTS microtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL CHECK (task_type IN ('transcribe', 'generate_title')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'failed', 'done')),
  model text,
  temperature numeric(3,2) DEFAULT 0.5 CHECK (temperature >= 0 AND temperature <= 2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  input_data jsonb,
  output_data jsonb,
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
  retry_count integer DEFAULT 0,
  error_code text,
  error_message text,
  
  -- Cost fields (same as messages table)
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
  
  -- Usage fields (same as messages table)
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
CREATE INDEX IF NOT EXISTS microtasks_status_idx ON microtasks(status);
CREATE INDEX IF NOT EXISTS microtasks_thread_id_idx ON microtasks(thread_id);
CREATE INDEX IF NOT EXISTS microtasks_task_type_idx ON microtasks(task_type);
CREATE INDEX IF NOT EXISTS microtasks_created_at_idx ON microtasks(created_at);
CREATE INDEX IF NOT EXISTS microtasks_completed_at_idx ON microtasks(completed_at);
CREATE INDEX IF NOT EXISTS microtasks_started_at_idx ON microtasks(started_at);
CREATE INDEX IF NOT EXISTS microtasks_model_idx ON microtasks(model);
CREATE INDEX IF NOT EXISTS microtasks_user_id_idx ON microtasks(user_id);

-- Enable RLS
ALTER TABLE microtasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own microtasks"
  ON microtasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own microtasks"
  ON microtasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own microtasks"
  ON microtasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own microtasks"
  ON microtasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_microtasks_updated_at
  BEFORE UPDATE ON microtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();