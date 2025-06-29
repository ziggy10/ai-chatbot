import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Save, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemConfigurationSectionProps {
  formSettings: any;
  models: any[];
  onFormSettingsChange: (updates: any) => void;
  onSave: () => void;
}

export function SystemConfigurationSection({ 
  formSettings, 
  models, 
  onFormSettingsChange, 
  onSave 
}: SystemConfigurationSectionProps) {
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [titleModelSelectorOpen, setTitleModelSelectorOpen] = useState(false);

  const selectedModel = models.find(m => m.id === formSettings.default_model);
  const selectedTitleModel = models.find(m => m.id === formSettings.utility_title_model);

  return (
    <Card className="card p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">System Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              value={formSettings.system_prompt}
              onChange={(e) => {
                console.log('📝 System prompt changed to:', e.target.value.slice(0, 50) + '...');
                onFormSettingsChange({ system_prompt: e.target.value });
              }}
              className="mt-1"
              rows={4}
              placeholder="Enter your system prompt..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default-temperature">Default Temperature</Label>
              <Input
                id="default-temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formSettings.default_temperature}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('🌡️ Temperature changed to:', value);
                  onFormSettingsChange({ default_temperature: value });
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="max-tokens">Max Output Tokens</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="max-tokens"
                      type="number"
                      min="0"
                      value={formSettings.max_output_tokens}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        console.log('🎯 Max tokens changed to:', value);
                        onFormSettingsChange({ max_output_tokens: value });
                      }}
                      className="mt-1"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>0 = no limits!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Default Model</Label>
              <Popover open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={modelSelectorOpen}
                    className="w-full justify-between mt-1"
                  >
                    {selectedModel ? selectedModel.name : formSettings.default_model || "Select model..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 card">
                  <Command>
                    <CommandInput placeholder="Search models..." />
                    <CommandList>
                      <CommandEmpty>No models found.</CommandEmpty>
                      <CommandGroup>
                        {models.map(model => (
                          <CommandItem
                            key={model.id}
                            value={model.id}
                            onSelect={() => {
                              console.log('🎯 Default model selected:', model.id);
                              onFormSettingsChange({ default_model: model.id });
                              setModelSelectorOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formSettings.default_model === model.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {model.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Chat Provider</Label>
              <Select 
                value={formSettings.chat_using} 
                onValueChange={(value: 'openrouter' | 'openai') => 
                  onFormSettingsChange({ chat_using: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Title Generation Model</Label>
            <Popover open={titleModelSelectorOpen} onOpenChange={setTitleModelSelectorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={titleModelSelectorOpen}
                  className="w-full justify-between mt-1"
                >
                  {selectedTitleModel ? selectedTitleModel.name : formSettings.utility_title_model || "Select model..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 card">
                <Command>
                  <CommandInput placeholder="Search models..." />
                  <CommandList>
                    <CommandEmpty>No models found.</CommandEmpty>
                    <CommandGroup>
                      {models.map(model => (
                        <CommandItem
                          key={model.id}
                          value={model.id}
                          onSelect={() => {
                            onFormSettingsChange({ utility_title_model: model.id });
                            setTitleModelSelectorOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formSettings.utility_title_model === model.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {model.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </Card>
  );
}