/*
  # Create threads table

  1. New Tables
    - `threads`
      - Chat conversation threads
      - Contains title, timestamps
      - Calculated fields for costs and tokens

  2. Security
    - Enable RLS on `threads` table
    - Add policy for authenticated users to manage their threads

  3. Indexes
    - Performance indexes on common query fields
*/

CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text CHECK (length(title) <= 120),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS threads_created_at_idx ON threads(created_at);
CREATE INDEX IF NOT EXISTS threads_updated_at_idx ON threads(updated_at);
CREATE INDEX IF NOT EXISTS threads_title_idx ON threads(title);
CREATE INDEX IF NOT EXISTS threads_user_id_idx ON threads(user_id);

-- Enable RLS
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own threads"
  ON threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
  ON threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON threads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_threads_updated_at
  BEFORE UPDATE ON threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();