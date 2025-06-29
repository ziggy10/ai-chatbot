import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { UserProfileSection } from './settings-page/components/user-profile-section';
import { ApiKeysSection } from './settings-page/components/api-keys-section';
import { SystemConfigurationSection } from './settings-page/components/system-configuration-section';
import { BudgetManagementSection } from './settings-page/components/budget-management-section';
import { TranscriptionSection } from './settings-page/components/transcription-section';
import { DataManagementSection } from './settings-page/components/data-management-section';

export function SettingsPage() {
  const [tempOpenRouterKey, setTempOpenRouterKey] = useState('');
  
  const {
    openRouterKey,
    setOpenRouterKey,
    budget24h,
    transcriptionEnabled,
    models,
    prompts,
    appSettings,
    isLoadingSettings,
    loadAppSettings,
    updateAppSettings,
    loadOpenRouterModels,
  } = useAppStore();

  // Local form state for database settings - initialize with proper defaults
  const [formSettings, setFormSettings] = useState({
    use_keys_from: 'localstorage' as 'localstorage' | 'database',
    dangerous_openai_api_key: '',
    dangerous_openrouter_api_key: '',
    dangerous_huggingface_api_key: '',
    system_prompt: "You are a helpful assistant who's always eager to help & be proactive. Keep language crisp and to the point. Use bullets & sub-sections whenever helpful. Avoid overusing emojis.",
    default_temperature: 0.5,
    default_model: '',
    max_output_tokens: 2048,
    chat_using: 'openrouter' as 'openrouter' | 'openai',
    utility_transcription_enabled: false,
    utility_transcription_provider: 'openai' as 'openai' | 'huggingface',
    utility_transcription_model: '',
    utility_title_model: 'anthropic/claude-3-haiku',
    budget_input_token_cost: 0.000002,
    budget_output_token_cost: 0.000004,
    budget_max_24h: 10.0,
    user_name: '',
  });

  // Load settings on mount
  useEffect(() => {
    console.log('🚀 Settings page mounted, loading app settings...');
    loadAppSettings().catch(error => {
      console.error('❌ Failed to load app settings on mount:', error);
      toast.error(`Failed to load settings: ${error.message}`);
    });
  }, [loadAppSettings]);

  // Load models when API key is set
  useEffect(() => {
    if (openRouterKey) {
      loadOpenRouterModels();
    }
  }, [openRouterKey, loadOpenRouterModels]);

  // Update form when settings load from database
  useEffect(() => {
    if (appSettings) {
      console.log('📋 Updating form with app settings from DB:', appSettings);
      const newFormSettings = {
        use_keys_from: appSettings.use_keys_from,
        dangerous_openai_api_key: appSettings.dangerous_openai_api_key || '',
        dangerous_openrouter_api_key: appSettings.dangerous_openrouter_api_key || '',
        dangerous_huggingface_api_key: appSettings.dangerous_huggingface_api_key || '',
        system_prompt: appSettings.system_prompt,
        default_temperature: appSettings.default_temperature,
        default_model: appSettings.default_model || '',
        max_output_tokens: appSettings.max_output_tokens,
        chat_using: appSettings.chat_using,
        utility_transcription_enabled: appSettings.utility_transcription_enabled,
        utility_transcription_provider: appSettings.utility_transcription_provider || 'openai',
        utility_transcription_model: appSettings.utility_transcription_model || '',
        utility_title_model: appSettings.utility_title_model || 'anthropic/claude-3-haiku',
        budget_input_token_cost: appSettings.budget_input_token_cost,
        budget_output_token_cost: appSettings.budget_output_token_cost,
        budget_max_24h: appSettings.budget_max_24h,
        user_name: appSettings.user_name || '',
      };
      
      setFormSettings(newFormSettings);
      setTempOpenRouterKey(openRouterKey);
      
      console.log('✅ Form updated with values:', {
        system_prompt: newFormSettings.system_prompt.slice(0, 50) + '...',
        default_model: newFormSettings.default_model,
        max_output_tokens: newFormSettings.max_output_tokens,
        budget_max_24h: newFormSettings.budget_max_24h,
        user_name: newFormSettings.user_name,
      });
    }
  }, [appSettings, openRouterKey]);

  const handleSaveApiKeys = async () => {
    try {
      if (formSettings.use_keys_from === 'localstorage') {
        setOpenRouterKey(tempOpenRouterKey);
        toast.success('API keys saved locally');
      } else {
        // Save to database via form settings
        await handleSaveSettings();
      }
    } catch (error) {
      console.error('❌ Failed to save API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  const handleSaveSettings = async () => {
    try {
      console.log('💾 Attempting to save settings:', formSettings);
      await updateAppSettings(formSettings);
      toast.success('Settings saved to database');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      toast.error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFormSettingsChange = (updates: any) => {
    setFormSettings(prev => ({ ...prev, ...updates }));
  };

  if (isLoadingSettings) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your Mimir experience
          </p>
        </div>

        <div className="space-y-6">
          <UserProfileSection
            userName={formSettings.user_name}
            onUserNameChange={(name) => handleFormSettingsChange({ user_name: name })}
            onSave={handleSaveSettings}
          />

          <ApiKeysSection
            formSettings={formSettings}
            tempOpenRouterKey={tempOpenRouterKey}
            onFormSettingsChange={handleFormSettingsChange}
            onTempOpenRouterKeyChange={setTempOpenRouterKey}
            onSave={handleSaveApiKeys}
            hasOpenRouterKey={!!(openRouterKey || formSettings.dangerous_openrouter_api_key)}
          />

          <SystemConfigurationSection
            formSettings={formSettings}
            models={models}
            onFormSettingsChange={handleFormSettingsChange}
            onSave={handleSaveSettings}
          />

          <BudgetManagementSection
            formSettings={formSettings}
            onFormSettingsChange={handleFormSettingsChange}
            onSave={handleSaveSettings}
          />

          <TranscriptionSection
            formSettings={formSettings}
            onFormSettingsChange={handleFormSettingsChange}
            onSave={handleSaveSettings}
          />

          <DataManagementSection
            prompts={prompts}
            budget24h={budget24h}
            transcriptionEnabled={transcriptionEnabled}
          />
        </div>
      </div>
    </div>
  );
}