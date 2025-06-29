/*
  # Create calculated views and functions

  1. Views
    - Thread aggregation views for calculated fields
    - Cost calculation functions

  2. Functions
    - Helper functions for cost calculations
    - Thread statistics functions
*/

-- Function to calculate input costs
CREATE OR REPLACE FUNCTION calculate_input_cost(
  input_tokens text,
  input_token_price text,
  input_cached_tokens text DEFAULT NULL,
  input_cached_token_price text DEFAULT NULL,
  input_audio_tokens text DEFAULT NULL,
  input_audio_token_price text DEFAULT NULL,
  input_cached_audio_tokens text DEFAULT NULL,
  input_cached_audio_token_price text DEFAULT NULL,
  input_image_tokens text DEFAULT NULL,
  input_image_token_price text DEFAULT NULL,
  input_cached_image_tokens text DEFAULT NULL,
  input_cached_image_token_price text DEFAULT NULL
) RETURNS numeric AS $$
DECLARE
  total_cost numeric := 0;
BEGIN
  -- Regular input cost
  IF input_tokens IS NOT NULL AND input_token_price IS NOT NULL THEN
    total_cost := total_cost + (input_tokens::numeric * input_token_price::numeric);
  END IF;
  
  -- Cached input cost
  IF input_cached_tokens IS NOT NULL AND input_cached_token_price IS NOT NULL THEN
    total_cost := total_cost + (input_cached_tokens::numeric * input_cached_token_price::numeric);
  END IF;
  
  -- Audio input cost
  IF input_audio_tokens IS NOT NULL AND input_audio_token_price IS NOT NULL THEN
    total_cost := total_cost + (input_audio_tokens::numeric * input_audio_token_price::numeric);
  END IF;
  
  -- Cached audio input cost
  IF input_cached_audio_tokens IS NOT NULL AND input_cached_audio_token_price IS NOT NULL THEN
    total_cost := total_cost + (input_cached_audio_tokens::numeric * input_cached_audio_token_price::numeric);
  END IF;
  
  -- Image input cost
  IF input_image_tokens IS NOT NULL AND input_image_token_price IS NOT NULL THEN
    total_cost := total_cost + (input_image_tokens::numeric * input_image_token_price::numeric);
  END IF;
  
  -- Cached image input cost
  IF input_cached_image_tokens IS NOT NULL AND input_cached_image_token_price IS NOT NULL THEN
    total_cost := total_cost + (input_cached_image_tokens::numeric * input_cached_image_token_price::numeric);
  END IF;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate output costs
CREATE OR REPLACE FUNCTION calculate_output_cost(
  output_tokens text,
  output_token_price text,
  output_reasoning_tokens text DEFAULT NULL,
  output_reasoning_token_price text DEFAULT NULL,
  output_audio_tokens text DEFAULT NULL,
  output_audio_token_price text DEFAULT NULL,
  output_image_tokens text DEFAULT NULL,
  output_image_token_price text DEFAULT NULL
) RETURNS numeric AS $$
DECLARE
  total_cost numeric := 0;
BEGIN
  -- Regular output cost
  IF output_tokens IS NOT NULL AND output_token_price IS NOT NULL THEN
    total_cost := total_cost + (output_tokens::numeric * output_token_price::numeric);
  END IF;
  
  -- Reasoning output cost
  IF output_reasoning_tokens IS NOT NULL AND output_reasoning_token_price IS NOT NULL THEN
    total_cost := total_cost + (output_reasoning_tokens::numeric * output_reasoning_token_price::numeric);
  END IF;
  
  -- Audio output cost
  IF output_audio_tokens IS NOT NULL AND output_audio_token_price IS NOT NULL THEN
    total_cost := total_cost + (output_audio_tokens::numeric * output_audio_token_price::numeric);
  END IF;
  
  -- Image output cost
  IF output_image_tokens IS NOT NULL AND output_image_token_price IS NOT NULL THEN
    total_cost := total_cost + (output_image_tokens::numeric * output_image_token_price::numeric);
  END IF;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- View for thread statistics
CREATE OR REPLACE VIEW thread_stats AS
SELECT 
  t.id,
  t.title,
  t.created_at,
  t.updated_at,
  t.user_id,
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