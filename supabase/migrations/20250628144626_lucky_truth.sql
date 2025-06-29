/*
  # Create thread_errors table

  1. New Tables
    - `thread_errors`
      - Capture all thread associated errors
      - Links to threads table

  2. Security
    - Enable RLS on `thread_errors` table
    - Add policy for authenticated users to manage their thread errors

  3. Indexes
    - Performance indexes on thread_id and created_at
*/

CREATE TABLE IF NOT EXISTS thread_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
  error_code text,
  error_message text,
  raised_by text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS thread_errors_thread_id_idx ON thread_errors(thread_id);
CREATE INDEX IF NOT EXISTS thread_errors_created_at_idx ON thread_errors(created_at);
CREATE INDEX IF NOT EXISTS thread_errors_user_id_idx ON thread_errors(user_id);

-- Enable RLS
ALTER TABLE thread_errors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own thread errors"
  ON thread_errors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thread errors"
  ON thread_errors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thread errors"
  ON thread_errors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thread errors"
  ON thread_errors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);