import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { TranscriptionConfig } from '../types';

export function useTranscription() {
  const { appSettings } = useAppStore();

  const getTranscriptionConfig = useCallback((): TranscriptionConfig => {
    const openAIKey = localStorage.getItem('openai_api_key') || appSettings?.dangerous_openai_api_key || '';
    
    return {
      enabled: !!appSettings?.utility_transcription_enabled,
      provider: appSettings?.utility_transcription_provider || 'openai',
      model: appSettings?.utility_transcription_model || 'whisper-1',
      openAIKey,
    };
  }, [appSettings]);

  const canTranscribe = useCallback((): boolean => {
    const config = getTranscriptionConfig();
    return !!(config.enabled && config.model && config.openAIKey);
  }, [getTranscriptionConfig]);

  const transcribeAudio = useCallback(async (
    audioBlob: Blob,
    recordingTime: number,
    chatId?: string
  ): Promise<string> => {
    const config = getTranscriptionConfig();
    
    if (!config.openAIKey) {
      throw new Error('OpenAI API key not found. Please set it in settings.');
    }

    let microtask: any = null;
    
    try {
      // Create microtask for tracking
      const { data: microtaskData, error: microtaskError } = await supabase
        .from('microtasks')
        .insert({
          task_type: 'transcribe',
          status: 'pending',
          model: config.model,
          thread_id: chatId || null,
          input_data: {
            audio_duration: recordingTime,
            audio_size: audioBlob.size,
          },
        })
        .select()
        .single();

      if (microtaskError) {
        throw new Error('Failed to create transcription task');
      }

      microtask = microtaskData;

      await supabase
        .from('microtasks')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .eq('id', microtask.id);

      // Convert webm to wav for better compatibility
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', config.model);
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openAIKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const transcription = result.text.trim();

      if (!transcription) {
        throw new Error('No speech detected in the recording');
      }

      await supabase
        .from('microtasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
          output_data: { transcription },
        })
        .eq('id', microtask.id);

      return transcription;
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      if (microtask) {
        await supabase
          .from('microtasks')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_code: 'TRANSCRIPTION_ERROR',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', microtask.id);
      }
      
      throw error;
    }
  }, [getTranscriptionConfig]);

  return {
    canTranscribe,
    transcribeAudio,
    getTranscriptionConfig,
  };
}