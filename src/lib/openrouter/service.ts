import { OpenRouterModel, OpenRouterResponse, ChatMessage, StreamOptions } from './types';

export class OpenRouterService {
  private baseUrl = 'https://openrouter.ai/api/v1';
  private apiKey: string | null = null;
  private models: OpenRouterModel[] = [];

  setApiKey(key: string) {
    this.apiKey = key;
    console.log('🔑 OpenRouter API key set:', key ? `${key.slice(0, 10)}...` : 'No key');
  }

  private getHeaders() {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not set');
    }

    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Mimir AI Chat',
    };
  }

  async getModels(): Promise<OpenRouterModel[]> {
    try {
      console.log('🔄 Fetching OpenRouter models...');
      
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter models API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.models = data.data || [];
      console.log('✅ Models fetched successfully:', this.models.length);
      return this.models;
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      throw error;
    }
  }

  getModelPricing(modelId: string): { input: number; output: number } {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      return {
        input: parseFloat(model.pricing.prompt),
        output: parseFloat(model.pricing.completion)
      };
    }
    // Default pricing if model not found
    return { input: 0.000002, output: 0.000004 };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  async chatCompletion(
    messages: ChatMessage[],
    model: string,
    options: Omit<StreamOptions, 'stream'> = {}
  ): Promise<OpenRouterResponse> {
    let requestBody: any = null;
    
    try {
      console.log('🚀 Starting OpenRouter chat completion:', {
        model,
        messageCount: messages.length,
        options,
        apiKeySet: !!this.apiKey
      });

      if (!this.apiKey) {
        throw new Error('OpenRouter API key not set. Please configure your API key in settings.');
      }

      requestBody = {
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2048,
        stream: false, // Always use non-streaming
      };

      console.log('📤 Sending request to OpenRouter...');

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `OpenRouter API error (${response.status})`;
        let rawErrorResponse = '';
        
        try {
          rawErrorResponse = await response.text();
          console.error('❌ OpenRouter API error response:', rawErrorResponse);
          
          // Try to parse as JSON for structured error
          try {
            const errorJson = JSON.parse(rawErrorResponse);
            errorMessage = errorJson.error?.message || errorJson.message || rawErrorResponse;
          } catch {
            // Use raw text if not JSON
            errorMessage = rawErrorResponse || errorMessage;
          }
        } catch {
          // Fallback if we can't read the response
          errorMessage = `${errorMessage}: ${response.statusText}`;
          rawErrorResponse = response.statusText;
        }
        
        const error = new Error(errorMessage) as Error & { requestBody?: any; rawErrorResponse?: string };
        error.requestBody = requestBody;
        error.rawErrorResponse = rawErrorResponse;
        throw error;
      }

      // Handle regular JSON response
      const data = await response.json();
      console.log('✅ Response received successfully');
      return data;

    } catch (error) {
      console.error('❌ Error in OpenRouter chat completion:', error);
      
      // Ensure error has request/response data attached
      if (error instanceof Error && !('requestBody' in error)) {
        const enhancedError = error as Error & { requestBody?: any; rawErrorResponse?: string };
        enhancedError.requestBody = requestBody;
        enhancedError.rawErrorResponse = error.message;
      }
      
      // Provide more user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid or missing OpenRouter API key. Please check your API key in settings.');
        }
        if (error.message.includes('401')) {
          throw new Error('Authentication failed. Please verify your OpenRouter API key.');
        }
        if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (error.message.includes('insufficient')) {
          throw new Error('Insufficient credits. Please check your OpenRouter account balance.');
        }
      }
      
      throw error;
    }
  }

  // Legacy method for backward compatibility - now just calls chatCompletion
  async *streamChatCompletion(
    messages: ChatMessage[],
    model: string,
    options: StreamOptions = {}
  ): AsyncGenerator<string, OpenRouterResponse, unknown> {
    // For now, just call the regular API and yield the full response
    const response = await this.chatCompletion(messages, model, options);
    const content = response.choices[0]?.message?.content || '';
    
    // Yield the content in chunks to simulate streaming
    const chunkSize = 10;
    for (let i = 0; i < content.length; i += chunkSize) {
      yield content.slice(i, i + chunkSize);
    }
    
    return response;
  }
}

export const openRouterService = new OpenRouterService();