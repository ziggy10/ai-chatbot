import { supabase } from '../supabase';
import { openRouterService } from './service';
import { ChatMessage, OpenRouterResponse } from './types';

export class ThreadService {
  static async saveMessage(
    threadId: string,
    role: 'system' | 'user' | 'assistant',
    content: string,
    model?: string,
    usage?: OpenRouterResponse['usage'],
    rawOutput?: any,
    columnPosition?: number
  ) {
    console.log('💾 Saving message:', {
      threadId,
      role,
      contentLength: content.length,
      model,
      columnPosition,
      hasUsage: !!usage
    });

    const messageData: any = {
      thread_id: threadId,
      role,
      content,
      model: model || null,
      provider: 'openrouter',
      raw_output: rawOutput || null,
      column_position: columnPosition || 0,
    };

    // Add usage data and pricing if available
    if (usage && model) {
      const pricing = openRouterService.getModelPricing(model);
      
      messageData.input_tokens = usage.prompt_tokens?.toString();
      messageData.output_tokens = usage.completion_tokens?.toString();
      
      // Set token prices
      messageData.input_token_price = pricing.input.toString();
      messageData.output_token_price = pricing.output.toString();
      
      // Add detailed token usage if available
      if (usage.prompt_tokens_details?.cached_tokens) {
        messageData.input_cached_tokens = usage.prompt_tokens_details.cached_tokens.toString();
        messageData.input_cached_token_price = (pricing.input * 0.5).toString(); // Cached tokens typically cost 50% less
      }
      if (usage.prompt_tokens_details?.audio_tokens) {
        messageData.input_audio_tokens = usage.prompt_tokens_details.audio_tokens.toString();
        messageData.input_audio_token_price = pricing.input.toString();
      }
      if (usage.completion_tokens_details?.reasoning_tokens) {
        messageData.output_reasoning_tokens = usage.completion_tokens_details.reasoning_tokens.toString();
        messageData.output_reasoning_token_price = (pricing.output * 3).toString(); // Reasoning tokens typically cost more
      }
      if (usage.completion_tokens_details?.audio_tokens) {
        messageData.output_audio_tokens = usage.completion_tokens_details.audio_tokens.toString();
        messageData.output_audio_token_price = pricing.output.toString();
      }
    }

    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      console.error('❌ Error saving message:', error);
      throw error;
    }

    console.log('✅ Message saved successfully');
  }

  static async createThread(title?: string): Promise<string> {
    console.log('🆕 Creating new thread:', { title });

    const { data, error } = await supabase
      .from('threads')
      .insert({
        title: title || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating thread:', error);
      throw error;
    }

    console.log('✅ Thread created:', data.id);
    return data.id;
  }

  static async getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('role, content, model, column_position')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching thread messages:', error);
      throw error;
    }

    return data.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content || '',
    }));
  }

  static async getThreadMessagesForModel(threadId: string, model: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('role, content, model, column_position')
      .eq('thread_id', threadId)
      .or(`model.is.null,model.eq.${model}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching thread messages for model:', error);
      throw error;
    }

    return data.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content || '',
    }));
  }

  static async generateThreadTitle(threadId: string, userMessage: string) {
    try {
      console.log('🏷️ Creating title generation microtask...');

      // Get model pricing for the title generation model
      const titleModel = 'anthropic/claude-3-haiku';
      const pricing = openRouterService.getModelPricing(titleModel);

      // Create microtask for title generation with pricing populated
      const { data: microtask, error: microtaskError } = await supabase
        .from('microtasks')
        .insert({
          task_type: 'generate_title',
          status: 'pending',
          model: titleModel,
          temperature: 0.3,
          thread_id: threadId,
          input_data: {
            user_message: userMessage,
          },
          // Populate price fields from OpenRouter models
          input_token_price: pricing.input.toString(),
          output_token_price: pricing.output.toString(),
          started_at: new Date().toISOString(), // Set started_at when task begins
        })
        .select()
        .single();

      if (microtaskError) {
        console.error('❌ Error creating title generation microtask:', microtaskError);
        return;
      }

      console.log('✅ Microtask created with pricing:', {
        id: microtask.id,
        model: titleModel,
        inputPrice: pricing.input,
        outputPrice: pricing.output,
        startedAt: microtask.started_at
      });

      // Update microtask status to running
      await supabase
        .from('microtasks')
        .update({
          status: 'running',
        })
        .eq('id', microtask.id);

      // Execute title generation
      const titlePrompt = `Based on this user message, generate a concise, descriptive title (max 50 characters):

User: ${userMessage}

Title:`;

      const response = await openRouterService.chatCompletion(
        [{ role: 'user', content: titlePrompt }],
        titleModel,
        { temperature: 0.3, max_tokens: 50 }
      );

      const title = response.choices[0]?.message?.content?.trim() || 'Untitled Chat';

      console.log('✅ Generated title:', title);

      // Update thread with generated title
      await supabase
        .from('threads')
        .update({ title: title.slice(0, 120) })
        .eq('id', threadId);

      // Update microtask as completed with usage data
      await supabase
        .from('microtasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
          output_data: { title },
          input_tokens: response.usage?.prompt_tokens?.toString(),
          output_tokens: response.usage?.completion_tokens?.toString(),
          // Add detailed token usage if available
          input_cached_tokens: response.usage?.prompt_tokens_details?.cached_tokens?.toString(),
          input_audio_tokens: response.usage?.prompt_tokens_details?.audio_tokens?.toString(),
          output_reasoning_tokens: response.usage?.completion_tokens_details?.reasoning_tokens?.toString(),
          output_audio_tokens: response.usage?.completion_tokens_details?.audio_tokens?.toString(),
        })
        .eq('id', microtask.id);

      console.log('✅ Microtask completed successfully');

    } catch (error) {
      console.error('❌ Error generating thread title:', error);
      
      // Update microtask as failed if it exists
      if (microtask) {
        await supabase
          .from('microtasks')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_code: 'TITLE_GENERATION_ERROR',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', microtask.id);
      }
    }
  }
}