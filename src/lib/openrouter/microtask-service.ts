import { supabase } from '../supabase';
import { openRouterService } from './service';

export class MicrotaskService {
  static async createAppGreetingMicrotask(): Promise<void> {
    try {
      console.log('🎯 Creating app_greeting microtask...');

      // Check if there are more than 5 chats
      const { data: chatCount, error: countError } = await supabase
        .from('threads')
        .select('id', { count: 'exact' });

      if (countError) {
        console.error('❌ Error counting chats:', countError);
        return;
      }

      if (!chatCount || chatCount.length < 5) {
        console.log('⚠️ Not enough chats (< 5) to generate greeting');
        return;
      }

      // Check if there's already a recent app_greeting microtask (within 4 hours)
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const { data: recentTasks, error: recentError } = await supabase
        .from('microtasks')
        .select('id')
        .eq('task_type', 'app_greeting')
        .gte('created_at', fourHoursAgo)
        .limit(1);

      if (recentError) {
        console.error('❌ Error checking recent tasks:', recentError);
        return;
      }

      if (recentTasks && recentTasks.length > 0) {
        console.log('⚠️ Recent app_greeting task already exists, skipping');
        return;
      }

      // Get user name from app_settings
      const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('user_name')
        .limit(1)
        .single();

      if (settingsError) {
        console.error('❌ Error getting user settings:', settingsError);
        return;
      }

      const userName = settings?.user_name || 'there';

      // Get recent user messages for context
      const timeRanges = [
        { hours: 4, label: '4 hours' },
        { hours: 8, label: '8 hours' },
        { hours: 24, label: '24 hours' }
      ];

      let recentMessages: any[] = [];
      let timeRange = '';

      for (const range of timeRanges) {
        const timeAgo = new Date(Date.now() - range.hours * 60 * 60 * 1000).toISOString();
        
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('content')
          .eq('role', 'user')
          .gte('created_at', timeAgo)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!messagesError && messages && messages.length > 0) {
          recentMessages = messages;
          timeRange = range.label;
          break;
        }
      }

      // Prepare input data for the microtask
      const inputData = {
        user_name: userName,
        recent_messages: recentMessages.map(m => m.content),
        time_range: timeRange,
        chat_count: chatCount.length
      };

      // Get model pricing for the greeting generation model
      const greetingModel = 'anthropic/claude-3-haiku';
      const pricing = openRouterService.getModelPricing(greetingModel);

      // Create the microtask
      const { data: microtask, error: microtaskError } = await supabase
        .from('microtasks')
        .insert({
          task_type: 'app_greeting',
          status: 'pending',
          model: greetingModel,
          temperature: 0.7,
          input_data: inputData,
          input_token_price: pricing.input.toString(),
          output_token_price: pricing.output.toString(),
        })
        .select()
        .single();

      if (microtaskError) {
        console.error('❌ Error creating app_greeting microtask:', microtaskError);
        return;
      }

      console.log('✅ App greeting microtask created:', microtask.id);

      // Execute the microtask immediately
      await this.executeAppGreetingMicrotask(microtask.id);

    } catch (error) {
      console.error('❌ Error in createAppGreetingMicrotask:', error);
    }
  }

  static async executeAppGreetingMicrotask(microtaskId: string): Promise<void> {
    try {
      console.log('🚀 Executing app_greeting microtask:', microtaskId);

      // Get the microtask
      const { data: microtask, error: fetchError } = await supabase
        .from('microtasks')
        .select('*')
        .eq('id', microtaskId)
        .single();

      if (fetchError || !microtask) {
        console.error('❌ Error fetching microtask:', fetchError);
        return;
      }

      // Update status to running
      await supabase
        .from('microtasks')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .eq('id', microtaskId);

      const { user_name, recent_messages, time_range, chat_count } = microtask.input_data;

      // Create the prompt for greeting and suggestions
      const prompt = `You are a helpful UI copy assistant. Only respond with valid JSON in the exact format specified.

User Name: ${user_name}
Chat Count: ${chat_count}
Recent Messages Time Range: ${time_range}

Recent conversation snippets from the user:
${recent_messages.slice(0, 10).map((msg: string, i: number) => `${i + 1}. ${msg.slice(0, 200)}...`).join('\n')}

Generate a personalized greeting and conversation starters based on the user's chat history. Look for patterns, topics of interest, and potential follow-up questions.

Respond with JSON in this exact format:
{
  "greeting": "3-4 word greeting with name included, try to include a pun or keyword from recent chats",
  "prompts": [
    "First conversation starter based on chat history",
    "Second conversation starter based on interests",
    "Third conversation starter suggesting something new"
  ]
}

Requirements:
- Greeting must be 3-4 words and include the user's name
- Each prompt must be exactly one sentence
- Base suggestions on actual chat patterns and topics
- Make prompts actionable and engaging`;

      // Execute the AI request
      const response = await openRouterService.chatCompletion(
        [{ role: 'user', content: prompt }],
        microtask.model,
        { temperature: microtask.temperature, max_tokens: 300 }
      );

      const aiResponse = response.choices[0]?.message?.content?.trim() || '';
      
      let outputData;
      try {
        outputData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', aiResponse);
        throw new Error('Invalid JSON response from AI');
      }

      // Validate the response structure
      if (!outputData.greeting || !Array.isArray(outputData.prompts) || outputData.prompts.length !== 3) {
        throw new Error('Invalid response structure from AI');
      }

      // Update microtask as completed
      await supabase
        .from('microtasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
          output_data: outputData,
          input_tokens: response.usage?.prompt_tokens?.toString(),
          output_tokens: response.usage?.completion_tokens?.toString(),
        })
        .eq('id', microtaskId);

      console.log('✅ App greeting microtask completed successfully:', outputData);

    } catch (error) {
      console.error('❌ Error executing app_greeting microtask:', error);
      
      // Update microtask as failed
      await supabase
        .from('microtasks')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_code: 'EXECUTION_ERROR',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', microtaskId);
    }
  }

  static async getLatestAppGreeting(): Promise<{ greeting: string; prompts: string[] } | null> {
    try {
      const { data: microtask, error } = await supabase
        .from('microtasks')
        .select('output_data')
        .eq('task_type', 'app_greeting')
        .eq('status', 'done')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !microtask?.output_data) {
        return null;
      }

      return microtask.output_data;
    } catch (error) {
      console.error('❌ Error getting latest app greeting:', error);
      return null;
    }
  }
}