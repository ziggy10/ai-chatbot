import { supabase } from '../supabase';
import { openRouterService } from './service';
import { ThreadService } from './thread-service';
import { ChatMessage } from './types';

export class ThreadExecutor {
  static async createThread(title?: string): Promise<string> {
    return ThreadService.createThread(title);
  }

  // Models that don't support system prompts
  private static readonly MODELS_WITHOUT_SYSTEM_SUPPORT = [
    'google/gemma-3n-e4b-it',
    'google/gemma-2-9b-it',
    'google/gemma-2-27b-it',
    'google/gemma-7b-it',
    'google/gemma-2b-it',
    // Add other Google models that might have similar issues
  ];

  private static modelSupportsSystemPrompt(modelId: string): boolean {
    return !this.MODELS_WITHOUT_SYSTEM_SUPPORT.some(unsupportedModel => 
      modelId.includes(unsupportedModel) || modelId.startsWith('google/gemma')
    );
  }

  static async *executeThread(
    threadId: string,
    userMessage: string,
    models: string[],
    systemPrompt: string,
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): AsyncGenerator<{ model: string; content: string; requestBody?: any; rawErrorResponse?: string }, void, unknown> {
    try {
      console.log('🎯 Executing thread:', {
        threadId,
        userMessageLength: userMessage.length,
        models,
        options
      });

      // Check if this is the first message in the thread
      const existingMessages = await ThreadService.getThreadMessages(threadId);
      const isFirstMessage = existingMessages.length === 0;

      console.log('📊 Thread status:', {
        isFirstMessage,
        existingMessageCount: existingMessages.length
      });

      // STEP 1: Save system message first (only for first message in thread)
      if (isFirstMessage) {
        console.log('💬 Step 1: Saving system message...');
        await ThreadService.saveMessage(threadId, 'system', systemPrompt);
      }

      // STEP 2: Save user message (always)
      console.log('💬 Step 2: Saving user message...');
      await ThreadService.saveMessage(threadId, 'user', userMessage);

      // STEP 3: Generate LLM responses for each model
      console.log('🤖 Step 3: Generating LLM responses...');
      
      // Process each model
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        
        try {
          console.log(`🤖 Processing model ${i + 1}/${models.length}: ${model}`);

          // Get messages for this specific model (including the newly saved ones)
          const modelMessages = await ThreadService.getThreadMessagesForModel(threadId, model);
          
          // Build conversation history for this model
          const messages: ChatMessage[] = [];
          
          // Check if this model supports system prompts
          const supportsSystemPrompt = this.modelSupportsSystemPrompt(model);
          console.log(`🔍 Model ${model} supports system prompts: ${supportsSystemPrompt}`);
          
          if (supportsSystemPrompt) {
            // Standard approach: use system message
            if (modelMessages.length === 0 || modelMessages[0].role !== 'system') {
              messages.push({ role: 'system', content: systemPrompt });
            }
            // Add all existing messages
            messages.push(...modelMessages);
          } else {
            // Alternative approach: convert system prompt to user context or skip it
            console.log(`⚠️ Model ${model} doesn't support system prompts, adapting conversation...`);
            
            // Filter out system messages and add user messages only
            const nonSystemMessages = modelMessages.filter(msg => msg.role !== 'system');
            
            // If this is the first exchange, prepend system context to the user message
            if (isFirstMessage && nonSystemMessages.length > 0) {
              const lastUserMessage = nonSystemMessages[nonSystemMessages.length - 1];
              if (lastUserMessage.role === 'user') {
                // Modify the user message to include context from system prompt
                const contextualUserMessage = {
                  ...lastUserMessage,
                  content: `Context: ${systemPrompt}\n\nUser: ${lastUserMessage.content}`
                };
                messages.push(...nonSystemMessages.slice(0, -1), contextualUserMessage);
              } else {
                messages.push(...nonSystemMessages);
              }
            } else {
              messages.push(...nonSystemMessages);
            }
          }

          console.log('📝 Messages for model:', {
            model,
            messageCount: messages.length,
            roles: messages.map(m => m.role),
            supportsSystemPrompt,
            lastMessage: messages[messages.length - 1]?.content?.slice(0, 50) + '...'
          });

          // Get response from OpenRouter using regular API call (no streaming)
          const response = await openRouterService.chatCompletion(messages, model, options);
          const assistantResponse = response.choices[0]?.message?.content || '';
          
          console.log('✅ Model response complete:', {
            model,
            responseLength: assistantResponse.length,
            usage: response.usage
          });

          // Yield the complete response
          yield { model, content: assistantResponse };

          // Save the response to database
          await ThreadService.saveMessage(
            threadId,
            'assistant',
            assistantResponse,
            model,
            response.usage,
            response,
            i // Column position for multi-model support
          );

        } catch (error) {
          console.error(`❌ Error processing model ${model}:`, error);
          
          // Extract request/response data from error if available
          const requestBody = (error as any)?.requestBody;
          const rawErrorResponse = (error as any)?.rawErrorResponse;
          
          // Provide more specific error messages for common issues
          let errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (errorMessage.includes('Developer instruction is not enabled')) {
            errorMessage = `Model ${model} doesn't support system prompts. Try using a different model or simplify your system prompt.`;
          } else if (errorMessage.includes('INVALID_ARGUMENT')) {
            errorMessage = `Model ${model} rejected the request format. This model may have specific requirements.`;
          }
          
          // Save error to thread_errors table with proper details
          await supabase
            .from('thread_errors')
            .insert({
              thread_id: threadId,
              error_code: 'MODEL_EXECUTION_ERROR',
              error_message: errorMessage,
              raised_by: `ThreadExecutor.executeThread.${model}`,
            });

          // Yield error message for this model with request/response data
          yield { 
            model, 
            content: `Error: ${errorMessage}`,
            requestBody,
            rawErrorResponse
          };
        }
      }

      // Update thread title if it's the first exchange
      if (isFirstMessage) {
        console.log('🏷️ Generating thread title...');
        await ThreadService.generateThreadTitle(threadId, userMessage);
      }

    } catch (error) {
      console.error('❌ Error executing thread:', error);
      
      // Save error to thread_errors table
      await supabase
        .from('thread_errors')
        .insert({
          thread_id: threadId,
          error_code: 'EXECUTION_ERROR',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          raised_by: 'ThreadExecutor.executeThread',
        });

      throw error;
    }
  }
}