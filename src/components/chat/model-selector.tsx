import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useAppStore } from '@/stores/app-store';
import { CirclePlus, Type, Image, Headphones, AlertTriangle, Check, Loader2, ArrowUp, ArrowDown, LetterText, Eye, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModels: string[];
  onAddModel: (model: string) => void;
  onRemoveModel: (model: string) => void;
  onSetModels: (models: string[]) => void;
  triggerAsButton?: boolean;
  buttonText?: React.ReactNode;
  modelIndex?: number; // For replacing specific model
}

export function ModelSelector({ 
  selectedModels, 
  onAddModel, 
  onRemoveModel, 
  onSetModels,
  triggerAsButton = false,
  buttonText,
  modelIndex
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const { 
    models, 
    appSettings, 
    openRouterModels, 
    openRouterKey,
    isLoadingModels,
    loadOpenRouterModels 
  } = useAppStore();

  // Load models when the popover opens and we have an API key
  useEffect(() => {
    if (open && openRouterKey && openRouterModels.length === 0 && !isLoadingModels) {
      console.log('🔄 Loading OpenRouter models on popover open...');
      loadOpenRouterModels();
    }
  }, [open, openRouterKey, openRouterModels.length, isLoadingModels, loadOpenRouterModels]);

  const handleModelSelect = (newModelId: string) => {
    if (triggerAsButton && typeof modelIndex === 'number') {
      // Replace specific model at index
      const newModels = [...selectedModels];
      newModels[modelIndex] = newModelId;
      onSetModels(newModels);
    } else if (selectedModels.length === 0) {
      // If no models selected, set as primary
      onSetModels([newModelId]);
    } else if (selectedModels.length < 3 && !selectedModels.includes(newModelId)) {
      // Add as additional model (up to 3)
      onAddModel(newModelId);
    }
    setOpen(false);
  };

  const getModalityIcons = (model: any) => {
    const icons = [];
    
    // Input modalities based on model capabilities
    icons.push(<LetterText key="text-input" className="h-3 w-3" />);
    
    // Check if model supports images (vision models)
    if (model.id.includes('vision') || model.id.includes('gpt-4o') || model.id.includes('claude-3')) {
      icons.push(<Eye key="image-input" className="h-3 w-3" />);
    }
    
    // Check if model supports audio
    if (model.id.includes('whisper') || model.id.includes('audio')) {
      icons.push(<Headphones key="audio-input" className="h-3 w-3" />);
    }
    
    return icons;
  };

  const formatCost = (cost: number) => {
    // Convert to per 1M tokens (multiply by 1000)
    const mCost = cost * 1000;
    if (mCost === 0) return "Free";
    if (mCost < 0.01) return `$${mCost.toFixed(4)}/Mtok`;
    if (mCost < 1) return `$${mCost.toFixed(3)}/Mtok`;
    return `$${mCost.toFixed(2)}/Mtok`;
  };

  const getBudgetStatus = (model: any) => {
    if (!model || !appSettings) return 'green';
    const inputCost = model.input_cost;
    const outputCost = model.output_cost;
    const budgetThreshold = appSettings.budget_max_24h / 1000;
    
    if (inputCost > budgetThreshold || outputCost > budgetThreshold) {
      return 'red';
    }
    return 'green';
  };

  // Get model data from OpenRouter if available, otherwise use local models
  const getModelData = (modelOption: any) => {
    // If this is already an OpenRouter model, use it directly
    if (modelOption.pricing) {
      return {
        id: modelOption.id,
        name: modelOption.name,
        description: modelOption.description || '',
        context_length: modelOption.context_length || 0,
        input_cost: parseFloat(modelOption.pricing.prompt) * 1000, // Convert to per 1K tokens
        output_cost: parseFloat(modelOption.pricing.completion) * 1000,
        is_expensive: parseFloat(modelOption.pricing.prompt) > 0.01 || parseFloat(modelOption.pricing.completion) > 0.01,
        created_at: modelOption.created || new Date().toISOString(),
      };
    }
    
    // Otherwise, it's a local model
    return {
      ...modelOption,
      created_at: modelOption.created_at || new Date().toISOString(),
    };
  };

  // Use OpenRouter models if available and we have an API key, otherwise fallback to local models
  const availableModels = openRouterKey && openRouterModels.length > 0 ? openRouterModels : models;

  const TriggerButton = triggerAsButton ? (
    <Button
      variant="ghost"
      className="h-8 px-3 rounded-r-none border-r-0 text-xs hover:bg-muted/50 flex items-center justify-center"
    >
      {buttonText}
    </Button>
  ) : (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 rounded-full flex items-center justify-center"
    >
      <CirclePlus className="h-4 w-4" />
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 card" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            {isLoadingModels ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading models...</span>
              </div>
            ) : availableModels.length === 0 ? (
              <CommandEmpty>
                {openRouterKey ? 'No models found. Check your API key.' : 'Please set your OpenRouter API key to load models.'}
              </CommandEmpty>
            ) : (
              <>
                <CommandEmpty>No models found.</CommandEmpty>
                <CommandGroup>
                  {availableModels.map(modelOption => {
                    const modelData = getModelData(modelOption);
                    const isSelected = selectedModels.includes(modelData.id);
                    const budgetStatus = getBudgetStatus(modelData);
                    const cachedCost = modelData.input_cost * 0.5 * 1000;
                    
                    return (
                      <CommandItem
                        key={modelData.id}
                        value={modelData.id}
                        onSelect={() => handleModelSelect(modelData.id)}
                        className={cn(
                          "flex flex-col items-start p-3 space-y-1 cursor-pointer",
                          isSelected && !triggerAsButton && "bg-primary/10 opacity-50 cursor-not-allowed"
                        )}
                        disabled={isSelected && !triggerAsButton}
                      >
                        {/* Header: Model Name (primary) + Context */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{modelData.name}</span>
                            <span>&middot;</span>
                            <span className="text-xs text-muted-foreground">
                              Context: {((modelData.context_length || 0) / 1000).toFixed(0)}K
                            </span>
                            {modelData.is_expensive && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black text-white border-gray-700">
                                    <span>Expensive Model - High cost per token</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {isSelected && !triggerAsButton && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        
                        {/* All metadata in one line with reduced spacing */}
                        <div className="flex items-center space-x-1 text-xs w-full">
                          {/* Modalities */}
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              {getModalityIcons(modelData)}
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <div className="flex space-x-1">
                              <LetterText className="h-3 w-3" />
                            </div>
                          </div>
                          
                          <span>&middot;</span>
                          
                          {/* Input Cost */}
                          <div className="flex items-center space-x-1">
                            <ArrowUp className={cn("h-3 w-3", budgetStatus === 'red' ? 'text-red-500' : 'text-green-500')} />
                            <span>{formatCost(modelData.input_cost || 0)}</span>
                          </div>
                          
                          <span>&middot;</span>
                          
                          {/* Output Cost */}
                          <div className="flex items-center space-x-1">
                            <ArrowDown className={cn("h-3 w-3", budgetStatus === 'red' ? 'text-red-500' : 'text-green-500')} />
                            <span>{formatCost(modelData.output_cost || 0)}</span>
                          </div>
                          
                          {/* Cached pricing - only show if not 0 */}
                          {cachedCost > 0 && (
                            <>
                              <span>&middot;</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-muted-foreground">Cached:</span>
                                <LetterText className="h-3 w-3" />
                                <span>${cachedCost.toFixed(2)}/Mtok</span>
                              </div>
                            </>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}