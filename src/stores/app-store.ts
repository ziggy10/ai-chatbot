import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { openRouterService, ThreadExecutor, type OpenRouterModel } from '@/lib/openrouter';
import { toast } from 'sonner';

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  models: string[];
  total_tokens: number;
  total_cost: number;
  is_bookmarked: boolean;
  is_shared: boolean;
  share_url?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokens?: number;
  cost?: number;
  created_at: string;
  attachments?: Attachment[];
  column_position?: number;
  error?: string;
  raw_output?: any;
}

export interface Attachment {
  id: string;
  filename: string;
  type: 'image' | 'pdf';
  url: string;
  size: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  input_cost: number;
  output_cost: number;
  context_length: number;
  is_expensive: boolean;
  is_reasoning: boolean;
}

export interface AppSettings {
  id?: string;
  use_keys_from: 'localstorage' | 'database';
  dangerous_openai_api_key?: string;
  dangerous_openrouter_api_key?: string;
  dangerous_huggingface_api_key?: string;
  system_prompt: string;
  default_temperature: number;
  default_model?: string;
  max_output_tokens: number;
  chat_using: 'openrouter' | 'openai';
  utility_transcription_enabled: boolean;
  utility_transcription_provider?: 'openai' | 'huggingface';
  utility_transcription_model?: string;
  utility_title_model?: string;
  budget_input_token_cost: number;
  budget_output_token_cost: number;
  budget_max_24h: number;
  user_name?: string;
}

interface AppState {
  // Core state
  currentChatId: string | null;
  selectedModels: string[];
  sidebarCollapsed: boolean;
  
  // Data
  chats: Chat[];
  messages: Message[];
  models: Model[];
  openRouterModels: OpenRouterModel[];
  
  // Settings
  openRouterKey: string;
  appSettings: AppSettings | null;
  isLoadingSettings: boolean;
  isLoadingModels: boolean;
  
  // Streaming
  isStreaming: boolean;
  streamingContent: Record<string, string>;
  
  // Core actions
  setCurrentChatId: (id: string | null) => void;
  setSelectedModels: (models: string[]) => void;
  addModel: (model: string) => void;
  removeModel: (model: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setOpenRouterKey: (key: string) => void;
  
  // Data actions
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  
  // Database actions
  loadAppSettings: () => Promise<void>;
  updateAppSettings: (updates: Partial<AppSettings>) => Promise<void>;
  loadOpenRouterModels: () => Promise<void>;
  loadThreads: () => Promise<void>;
  loadMessages: (threadId: string) => Promise<void>;
  sendMessage: (threadId: string | null, content: string, options?: { temperature?: number; max_tokens?: number }) => Promise<void>;
  
  // Streaming actions
  setStreamingContent: (model: string, content: string) => void;
  clearStreamingContent: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChatId: null,
      selectedModels: [],
      sidebarCollapsed: false,
      chats: [],
      messages: [],
      models: [],
      openRouterModels: [],
      openRouterKey: '',
      appSettings: null,
      isLoadingSettings: false,
      isLoadingModels: false,
      isStreaming: false,
      streamingContent: {},
      
      // Core actions
      setCurrentChatId: (id) => set({ currentChatId: id }),
      setSelectedModels: (models) => set({ selectedModels: models }),
      addModel: (model) => {
        const { selectedModels } = get();
        if (selectedModels.length < 3 && !selectedModels.includes(model)) {
          set({ selectedModels: [...selectedModels, model] });
        }
      },
      removeModel: (model) => {
        const { selectedModels } = get();
        set({ selectedModels: selectedModels.filter(m => m !== model) });
      },
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setOpenRouterKey: (key) => {
        set({ openRouterKey: key });
        openRouterService.setApiKey(key);
        if (key) get().loadOpenRouterModels();
        else set({ openRouterModels: [], models: [] });
      },
      
      // Data actions
      updateChat: (id, updates) => {
        const { chats } = get();
        set({ chats: chats.map(chat => chat.id === id ? { ...chat, ...updates } : chat) });
      },
      deleteChat: (id) => {
        const { chats, messages } = get();
        set({
          chats: chats.filter(chat => chat.id !== id),
          messages: messages.filter(message => message.chat_id !== id),
        });
      },
      
      // Database actions
      loadAppSettings: async () => {
        set({ isLoadingSettings: true });
        try {
          console.log('🔄 Loading app settings from database...');
          
          const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .limit(1)
            .single();
          
          if (error) {
            console.error('❌ Error loading app settings:', error);
            
            // If no settings exist, create default ones
            if (error.code === 'PGRST116') {
              console.log('📝 No settings found, creating default settings...');
              
              const defaultSettings = {
                use_keys_from: 'localstorage' as const,
                system_prompt: "You are a helpful assistant who's always eager to help & be proactive. Keep language crisp and to the point. Use bullets & sub-sections whenever helpful. Avoid overusing emojis.",
                default_temperature: 0.5,
                default_model: 'anthropic/claude-3-5-sonnet',
                max_output_tokens: 2048,
                chat_using: 'openrouter' as const,
                utility_transcription_enabled: false,
                utility_transcription_provider: 'openai' as const,
                utility_transcription_model: 'whisper-1',
                utility_title_model: 'anthropic/claude-3-haiku',
                budget_input_token_cost: 0.000002,
                budget_output_token_cost: 0.000004,
                budget_max_24h: 10.0,
                user_name: '',
              };
              
              const { data: newSettings, error: insertError } = await supabase
                .from('app_settings')
                .insert(defaultSettings)
                .select()
                .single();
              
              if (insertError) {
                console.error('❌ Error creating default settings:', insertError);
                throw insertError;
              }
              
              console.log('✅ Default settings created:', newSettings);
              set({ appSettings: newSettings });
            } else {
              throw error;
            }
          } else {
            console.log('✅ App settings loaded from database:', data);
            set({ appSettings: data });
          }
          
          // Set default model if none selected
          const { selectedModels, appSettings } = get();
          if (selectedModels.length === 0 && appSettings?.default_model) {
            console.log('🎯 Setting default model:', appSettings.default_model);
            set({ selectedModels: [appSettings.default_model] });
          }
          
        } catch (error) {
          console.error('❌ Failed to load app settings:', error);
          toast.error('Failed to load settings from database');
        } finally {
          set({ isLoadingSettings: false });
        }
      },
      
      updateAppSettings: async (updates) => {
        try {
          console.log('💾 Updating app settings:', updates);
          
          const { appSettings } = get();
          if (!appSettings?.id) {
            console.log('📝 Creating new app settings...');
            const { data, error } = await supabase.from('app_settings').insert(updates).select().single();
            if (error) throw error;
            console.log('✅ App settings created:', data);
            set({ appSettings: data });
          } else {
            console.log('📝 Updating existing app settings...');
            const { data, error } = await supabase.from('app_settings').update(updates).eq('id', appSettings.id).select().single();
            if (error) throw error;
            console.log('✅ App settings updated:', data);
            set({ appSettings: data });
          }
        } catch (error) {
          console.error('❌ Error updating settings:', error);
          throw error;
        }
      },
      
      loadOpenRouterModels: async () => {
        const { openRouterKey } = get();
        if (!openRouterKey) return;
        
        set({ isLoadingModels: true });
        try {
          openRouterService.setApiKey(openRouterKey);
          const models = await openRouterService.getModels();
          
          const convertedModels: Model[] = models.map(model => ({
            id: model.id,
            name: model.name,
            description: model.description || '',
            input_cost: parseFloat(model.pricing.prompt) * 1000,
            output_cost: parseFloat(model.pricing.completion) * 1000,
            context_length: model.context_length,
            is_expensive: parseFloat(model.pricing.prompt) > 0.01 || parseFloat(model.pricing.completion) > 0.01,
            is_reasoning: model.id.includes('o1') || model.id.includes('reasoning'),
          }));
          
          set({ openRouterModels: models, models: convertedModels });
        } catch (error) {
          console.error('Error loading models:', error);
          toast.error('Failed to load models. Please check your API key.');
        } finally {
          set({ isLoadingModels: false });
        }
      },
      
      loadThreads: async () => {
        try {
          const { data, error } = await supabase.from('thread_stats').select('*').order('updated_at', { ascending: false });
          if (error) throw error;
          
          const chats: Chat[] = (data || []).map(thread => ({
            id: thread.id,
            title: thread.title || 'Untitled Chat',
            created_at: thread.created_at,
            updated_at: thread.updated_at,
            message_count: Number(thread.message_count) || 0,
            models: thread.models || [],
            total_tokens: Number(thread.total_tokens) || 0,
            total_cost: Number(thread.total_cost) || 0,
            is_bookmarked: false,
            is_shared: false,
          }));
          
          const { data: threadsData } = await supabase.from('threads').select('id, is_bookmarked').in('id', chats.map(c => c.id));
          if (threadsData) {
            const bookmarkMap = new Map(threadsData.map(t => [t.id, t.is_bookmarked]));
            chats.forEach(chat => { chat.is_bookmarked = bookmarkMap.get(chat.id) || false; });
          }
          
          set({ chats });
        } catch (error) {
          console.error('Error loading threads:', error);
        }
      },
      
      loadMessages: async (threadId) => {
        try {
          const { data, error } = await supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true });
          if (error) throw error;
          
          const messages: Message[] = (data || []).map(msg => ({
            id: msg.id,
            chat_id: msg.thread_id,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content || '',
            model: msg.model || undefined,
            tokens: msg.input_tokens && msg.output_tokens ? parseInt(msg.input_tokens) + parseInt(msg.output_tokens) : undefined,
            cost: 0,
            created_at: msg.created_at,
            column_position: msg.column_position || 0,
            raw_output: msg.raw_output,
          }));
          
          set({ messages });
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      },
      
      sendMessage: async (threadId, content, options = {}) => {
        const { appSettings, openRouterKey, selectedModels } = get();
        
        if (!openRouterKey || !appSettings || selectedModels.length === 0) {
          throw new Error('Missing required configuration');
        }

        try {
          let currentThreadId = threadId;
          if (!currentThreadId) {
            currentThreadId = await ThreadExecutor.createThread();
            set({ currentChatId: currentThreadId });
          }
          
          set({ isStreaming: true });
          get().clearStreamingContent();
          
          const generator = ThreadExecutor.executeThread(
            currentThreadId,
            content,
            selectedModels,
            appSettings.system_prompt,
            {
              temperature: options.temperature ?? appSettings.default_temperature,
              max_tokens: options.max_tokens ?? appSettings.max_output_tokens,
            }
          );
          
          for await (const chunk of generator) {
            get().setStreamingContent(chunk.model, chunk.content);
          }
          
          await Promise.all([
            get().loadMessages(currentThreadId),
            get().loadThreads(),
          ]);
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        } finally {
          set({ isStreaming: false });
          get().clearStreamingContent();
        }
      },
      
      // Streaming actions
      setStreamingContent: (model, content) => {
        const { streamingContent } = get();
        set({ streamingContent: { ...streamingContent, [model]: content } });
      },
      clearStreamingContent: () => set({ streamingContent: {} }),
    }),
    {
      name: 'mimir-app-store',
      partialize: (state) => ({
        selectedModels: state.selectedModels,
        sidebarCollapsed: state.sidebarCollapsed,
        openRouterKey: state.openRouterKey,
      }),
    }
  )
);

// Initialize on app start
const store = useAppStore.getState();
if (store.openRouterKey) {
  openRouterService.setApiKey(store.openRouterKey);
  store.loadOpenRouterModels();
}

// Load app settings and threads on startup
store.loadAppSettings();
store.loadThreads();