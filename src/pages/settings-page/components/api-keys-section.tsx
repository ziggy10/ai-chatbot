import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  Database,
  HardDrive
} from 'lucide-react';

interface ApiKeysSectionProps {
  formSettings: any;
  tempOpenRouterKey: string;
  onFormSettingsChange: (updates: any) => void;
  onTempOpenRouterKeyChange: (key: string) => void;
  onSave: () => void;
  hasOpenRouterKey: boolean;
}

export function ApiKeysSection({ 
  formSettings, 
  tempOpenRouterKey, 
  onFormSettingsChange, 
  onTempOpenRouterKeyChange, 
  onSave,
  hasOpenRouterKey 
}: ApiKeysSectionProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showHuggingFaceKey, setShowHuggingFaceKey] = useState(false);
  const [localOpenAIKey, setLocalOpenAIKey] = useState('');

  // Load OpenAI key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key') || '';
    setLocalOpenAIKey(savedKey);
    // Also update form settings if using database storage
    if (formSettings.use_keys_from === 'database' && savedKey && !formSettings.dangerous_openai_api_key) {
      onFormSettingsChange({ dangerous_openai_api_key: savedKey });
    }
  }, []);

  const handleOpenAIKeyChange = (value: string) => {
    console.log('🔑 OpenAI key changed:', value ? 'Key provided' : 'Key cleared');
    
    // Update local state
    setLocalOpenAIKey(value);
    
    // Always save to localStorage immediately for transcription access
    if (value.trim()) {
      localStorage.setItem('openai_api_key', value.trim());
      console.log('✅ OpenAI key saved to localStorage');
    } else {
      localStorage.removeItem('openai_api_key');
      console.log('🗑️ OpenAI key removed from localStorage');
    }
    
    // Update form settings for database storage
    onFormSettingsChange({ dangerous_openai_api_key: value });
  };

  return (
    <Card className="card p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">API Keys</h2>
        
        <div className="space-y-4">
          {/* Storage Location */}
          <div className="pt-4 border-t border-border/20">
            <Label className="text-base font-medium">Storage Location</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose where to store your API keys and sensitive settings.
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="localstorage"
                  name="storage"
                  checked={formSettings.use_keys_from === 'localstorage'}
                  onChange={() => onFormSettingsChange({ use_keys_from: 'localstorage' })}
                />
                <Label htmlFor="localstorage" className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Local Storage (Browser)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="database"
                  name="storage"
                  checked={formSettings.use_keys_from === 'database'}
                  onChange={() => onFormSettingsChange({ use_keys_from: 'database' })}
                />
                <Label htmlFor="database" className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Database (Encrypted)</span>
                </Label>
              </div>
            </div>
          </div>

          {/* OpenRouter API Key */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="openrouter-key">
                OpenRouter API Key {formSettings.use_keys_from === 'database' ? '(Database)' : '(Local Storage)'}
              </Label>
              <div className="flex space-x-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="openrouter-key"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-or-v1-..."
                    value={formSettings.use_keys_from === 'database' ? 
                      formSettings.dangerous_openrouter_api_key : tempOpenRouterKey}
                    onChange={(e) => {
                      if (formSettings.use_keys_from === 'database') {
                        onFormSettingsChange({ dangerous_openrouter_api_key: e.target.value });
                      } else {
                        onTempOpenRouterKeyChange(e.target.value);
                      }
                    }}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              We'll use OpenRouter to get access to AI Models.{' '}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center"
              >
                Get API key
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          {/* OpenAI API Key */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="openai-key">
                OpenAI API Key (Required for Voice Transcription)
              </Label>
              <div className="flex space-x-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="openai-key"
                    type={showOpenAIKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={localOpenAIKey}
                    onChange={(e) => handleOpenAIKeyChange(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Saved to localStorage for transcription access
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Required for voice to text transcription
            </div>
          </div>

          {/* Hugging Face API Key */}
          <div>
            <Label htmlFor="huggingface-key">
              Hugging Face API Key (Optional)
            </Label>
            <div className="flex space-x-2 mt-1">
              <div className="relative flex-1 max-w-md">
                <Input
                  id="huggingface-key"
                  type={showHuggingFaceKey ? 'text' : 'password'}
                  placeholder="hf_..."
                  value={formSettings.dangerous_huggingface_api_key || ''}
                  onChange={(e) => onFormSettingsChange({ dangerous_huggingface_api_key: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowHuggingFaceKey(!showHuggingFaceKey)}
                >
                  {showHuggingFaceKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {hasOpenRouterKey && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">API Key Connected</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save API Keys
          </Button>
        </div>
      </div>
    </Card>
  );
}