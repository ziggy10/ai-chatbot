/*
  # Add app_greeting microtask type

  1. Schema Changes
    - Add 'app_greeting' to microtasks task_type enum
    - This allows the new greeting generation microtasks

  2. Notes
    - The microtasks table already exists with proper structure
    - Just need to extend the allowed task types
*/

-- Add app_greeting to the task_type check constraint
ALTER TABLE microtasks DROP CONSTRAINT IF EXISTS microtasks_task_type_check;
ALTER TABLE microtasks ADD CONSTRAINT microtasks_task_type_check 
  CHECK (task_type IN ('transcribe', 'generate_title', 'app_greeting'));