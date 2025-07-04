import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string;
          use_keys_from: 'localstorage' | 'database';
          dangerous_openai_api_key: string | null;
          dangerous_openrouter_api_key: string | null;
          dangerous_huggingface_api_key: string | null;
          system_prompt: string;
          default_temperature: number;
          default_model: string | null;
          max_output_tokens: number;
          chat_using: 'openrouter' | 'openai';
          utility_transcription_enabled: boolean;
          utility_transcription_provider: 'openai' | 'huggingface' | null;
          utility_transcription_model: string | null;
          utility_title_model: string | null;
          budget_input_token_cost: number;
          budget_output_token_cost: number;
          budget_max_24h: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          use_keys_from?: 'localstorage' | 'database';
          dangerous_openai_api_key?: string | null;
          dangerous_openrouter_api_key?: string | null;
          dangerous_huggingface_api_key?: string | null;
          system_prompt?: string;
          default_temperature?: number;
          default_model?: string | null;
          max_output_tokens?: number;
          chat_using?: 'openrouter' | 'openai';
          utility_transcription_enabled?: boolean;
          utility_transcription_provider?: 'openai' | 'huggingface' | null;
          utility_transcription_model?: string | null;
          utility_title_model?: string | null;
          budget_input_token_cost?: number;
          budget_output_token_cost?: number;
          budget_max_24h?: number;
        };
        Update: {
          id?: string;
          use_keys_from?: 'localstorage' | 'database';
          dangerous_openai_api_key?: string | null;
          dangerous_openrouter_api_key?: string | null;
          dangerous_huggingface_api_key?: string | null;
          system_prompt?: string;
          default_temperature?: number;
          default_model?: string | null;
          max_output_tokens?: number;
          chat_using?: 'openrouter' | 'openai';
          utility_transcription_enabled?: boolean;
          utility_transcription_provider?: 'openai' | 'huggingface' | null;
          utility_transcription_model?: string | null;
          utility_title_model?: string | null;
          budget_input_token_cost?: number;
          budget_output_token_cost?: number;
          budget_max_24h?: number;
        };
      };
      threads: {
        Row: {
          id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          thread_id: string;
          column_position: number;
          role: 'system' | 'user' | 'assistant' | 'tool';
          content: string | null;
          tool_call: any | null;
          model: string | null;
          provider: 'openrouter' | 'openai' | null;
          external_id: string | null;
          raw_output: any | null;
          input_token_price: string | null;
          input_cached_token_price: string | null;
          input_audio_token_price: string | null;
          input_cached_audio_token_price: string | null;
          input_image_token_price: string | null;
          input_cached_image_token_price: string | null;
          output_token_price: string | null;
          output_audio_token_price: string | null;
          output_image_token_price: string | null;
          output_reasoning_token_price: string | null;
          input_tokens: string | null;
          input_cached_tokens: string | null;
          input_audio_tokens: string | null;
          input_cached_audio_tokens: string | null;
          input_image_tokens: string | null;
          input_cached_image_tokens: string | null;
          output_tokens: string | null;
          output_audio_tokens: string | null;
          output_image_tokens: string | null;
          output_reasoning_tokens: string | null;
        };
        Insert: {
          id?: string;
          thread_id: string;
          column_position?: number;
          role: 'system' | 'user' | 'assistant' | 'tool';
          content?: string | null;
          tool_call?: any | null;
          model?: string | null;
          provider?: 'openrouter' | 'openai' | null;
          external_id?: string | null;
          raw_output?: any | null;
          input_token_price?: string | null;
          input_cached_token_price?: string | null;
          input_audio_token_price?: string | null;
          input_cached_audio_token_price?: string | null;
          input_image_token_price?: string | null;
          input_cached_image_token_price?: string | null;
          output_token_price?: string | null;
          output_audio_token_price?: string | null;
          output_image_token_price?: string | null;
          output_reasoning_token_price?: string | null;
          input_tokens?: string | null;
          input_cached_tokens?: string | null;
          input_audio_tokens?: string | null;
          input_cached_audio_tokens?: string | null;
          input_image_tokens?: string | null;
          input_cached_image_tokens?: string | null;
          output_tokens?: string | null;
          output_audio_tokens?: string | null;
          output_image_tokens?: string | null;
          output_reasoning_tokens?: string | null;
        };
        Update: {
          id?: string;
          thread_id?: string;
          column_position?: number;
          role?: 'system' | 'user' | 'assistant' | 'tool';
          content?: string | null;
          tool_call?: any | null;
          model?: string | null;
          provider?: 'openrouter' | 'openai' | null;
          external_id?: string | null;
          raw_output?: any | null;
          input_token_price?: string | null;
          input_cached_token_price?: string | null;
          input_audio_token_price?: string | null;
          input_cached_audio_token_price?: string | null;
          input_image_token_price?: string | null;
          input_cached_image_token_price?: string | null;
          output_token_price?: string | null;
          output_audio_token_price?: string | null;
          output_image_token_price?: string | null;
          output_reasoning_token_price?: string | null;
          input_tokens?: string | null;
          input_cached_tokens?: string | null;
          input_audio_tokens?: string | null;
          input_cached_audio_tokens?: string | null;
          input_image_tokens?: string | null;
          input_cached_image_tokens?: string | null;
          output_tokens?: string | null;
          output_audio_tokens?: string | null;
          output_image_tokens?: string | null;
          output_reasoning_tokens?: string | null;
        };
      };
      thread_errors: {
        Row: {
          id: string;
          thread_id: string | null;
          error_code: string | null;
          error_message: string | null;
          raised_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          raised_by?: string | null;
        };
        Update: {
          id?: string;
          thread_id?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          raised_by?: string | null;
        };
      };
      microtasks: {
        Row: {
          id: string;
          task_type: 'transcribe' | 'generate_title';
          status: 'pending' | 'running' | 'failed' | 'done';
          model: string | null;
          temperature: number | null;
          created_at: string;
          updated_at: string;
          started_at: string | null;
          completed_at: string | null;
          input_data: any | null;
          output_data: any | null;
          thread_id: string | null;
          retry_count: number;
          error_code: string | null;
          error_message: string | null;
          input_token_price: string | null;
          input_cached_token_price: string | null;
          input_audio_token_price: string | null;
          input_cached_audio_token_price: string | null;
          input_image_token_price: string | null;
          input_cached_image_token_price: string | null;
          output_token_price: string | null;
          output_audio_token_price: string | null;
          output_image_token_price: string | null;
          output_reasoning_token_price: string | null;
          input_tokens: string | null;
          input_cached_tokens: string | null;
          input_audio_tokens: string | null;
          input_cached_audio_tokens: string | null;
          input_image_tokens: string | null;
          input_cached_image_tokens: string | null;
          output_tokens: string | null;
          output_audio_tokens: string | null;
          output_image_tokens: string | null;
          output_reasoning_tokens: string | null;
        };
        Insert: {
          id?: string;
          task_type: 'transcribe' | 'generate_title';
          status?: 'pending' | 'running' | 'failed' | 'done';
          model?: string | null;
          temperature?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          input_data?: any | null;
          output_data?: any | null;
          thread_id?: string | null;
          retry_count?: number;
          error_code?: string | null;
          error_message?: string | null;
          input_token_price?: string | null;
          input_cached_token_price?: string | null;
          input_audio_token_price?: string | null;
          input_cached_audio_token_price?: string | null;
          input_image_token_price?: string | null;
          input_cached_image_token_price?: string | null;
          output_token_price?: string | null;
          output_audio_token_price?: string | null;
          output_image_token_price?: string | null;
          output_reasoning_token_price?: string | null;
          input_tokens?: string | null;
          input_cached_tokens?: string | null;
          input_audio_tokens?: string | null;
          input_cached_audio_tokens?: string | null;
          input_image_tokens?: string | null;
          input_cached_image_tokens?: string | null;
          output_tokens?: string | null;
          output_audio_tokens?: string | null;
          output_image_tokens?: string | null;
          output_reasoning_tokens?: string | null;
        };
        Update: {
          id?: string;
          task_type?: 'transcribe' | 'generate_title';
          status?: 'pending' | 'running' | 'failed' | 'done';
          model?: string | null;
          temperature?: number | null;
          updated_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
          input_data?: any | null;
          output_data?: any | null;
          thread_id?: string | null;
          retry_count?: number;
          error_code?: string | null;
          error_message?: string | null;
          input_token_price?: string | null;
          input_cached_token_price?: string | null;
          input_audio_token_price?: string | null;
          input_cached_audio_token_price?: string | null;
          input_image_token_price?: string | null;
          input_cached_image_token_price?: string | null;
          output_token_price?: string | null;
          output_audio_token_price?: string | null;
          output_image_token_price?: string | null;
          output_reasoning_token_price?: string | null;
          input_tokens?: string | null;
          input_cached_tokens?: string | null;
          input_audio_tokens?: string | null;
          input_cached_audio_tokens?: string | null;
          input_image_tokens?: string | null;
          input_cached_image_tokens?: string | null;
          output_tokens?: string | null;
          output_audio_tokens?: string | null;
          output_image_tokens?: string | null;
          output_reasoning_tokens?: string | null;
        };
      };
    };
    Views: {
      thread_stats: {
        Row: {
          id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
          message_count: number;
          total_input_tokens: number;
          total_cached_tokens: number;
          cached_tokens_percentage: number;
          total_output_tokens: number;
          total_tokens: number;
          total_input_cost: number;
          total_output_cost: number;
          total_cost: number;
          other_costs: number;
          models: string[];
        };
      };
    };
  };
}