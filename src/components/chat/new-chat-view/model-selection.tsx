import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModelSelector } from '../model-selector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/stores/app-store';
import { X, ArrowUp, ArrowDown, LetterText, Eye, Headphones, CircleDollarSign, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSelectionProps {
  sidebarCollapsed: boolean;
}

export function ModelSelection({ sidebarCollapsed }: ModelSelectionProps) {
  const { selectedModels, addModel, removeModel, setSelectedModels, models, openRouterModels, appSettings } = useAppStore();

  const formatCost = (cost: number) => {
    const mCost = cost * 1000;
    if (mCost < 0.01) return `$${mCost.toFixed(4)}/Mtok`;
    if (mCost < 1) return `$${mCost.toFixed(3)}/Mtok`;
    return `$${mCost.toFixed(2)}/Mtok`;
  };

  const getModalityIcons = (model: any) => {
    const icons = [<LetterText key="text-input" className="h-3 w-3" />];
    
    if (model.id && (model.id.includes('vision') || model.id.includes('gpt-4o') || model.id.includes('claude-3'))) {
      icons.push(<Eye key="image-input" className="h-3 w-3" />);
    }
    
    if (model.id && (model.id.includes('whisper') || model.id.includes('audio'))) {
      icons.push(<Headphones key="audio-input" className="h-3 w-3" />);
    }
    
    return icons;
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

  const getModelData = (modelId: string) => {
    const localModel = models.find(m => m.id === modelId);
    const openRouterModel = openRouterModels.find(m => m.id === modelId);
    
    return {
      id: modelId,
      ...localModel,
      ...openRouterModel,
      name: openRouterModel?.name || localModel?.name || modelId,
      description: openRouterModel?.description || localModel?.description || '',
      context_length: openRouterModel?.context_length || localModel?.context_length || 0,
      input_cost: localModel?.input_cost || (openRouterModel ? parseFloat(openRouterModel.pricing.prompt) * 1000 : 0),
      output_cost: localModel?.output_cost || (openRouterModel ? parseFloat(openRouterModel.pricing.completion) * 1000 : 0),
      is_expensive: localModel?.is_expensive || (openRouterModel ? (parseFloat(openRouterModel.pricing.prompt) > 0.01 || parseFloat(openRouterModel.pricing.completion) > 0.01) : false),
    };
  };

  const handleRemoveModel = (modelId: string) => {
    if (selectedModels.length > 1) {
      removeModel(modelId);
    }
  };

  const handleReplaceModel = (index: number, newModelId: string) => {
    const newModels = [...selectedModels];
    newModels[index] = newModelId;
    setSelectedModels(newModels);
  };

  return (
    <div className="flex items-center justify-start p-4 border-b border-border/20 bg-background/50 backdrop-blur-sm">
      <div className={cn(
        "flex items-center space-x-4",
        sidebarCollapsed ? "ml-16" : "ml-4"
      )}>
        <span className="text-sm font-medium">Chat with:</span>
        
        {/* Selected Model Badges */}
        <div className="flex items-center space-x-2">
          {selectedModels.map((modelId, index) => {
            const model = getModelData(modelId);
            const budgetStatus = getBudgetStatus(model);
            const isOverBudget = budgetStatus === 'red';
            
            return (
              <div key={`${modelId}-${index}`} className="model-button-enter" style={{ animationDelay: `${index * 100}ms` }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center border rounded-md overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                        <ModelSelector
                          selectedModels={selectedModels}
                          onAddModel={addModel}
                          onRemoveModel={removeModel}
                          onSetModels={(models) => handleReplaceModel(index, models[0])}
                          triggerAsButton={true}
                          buttonText={
                            <div className="flex items-center space-x-1">
                              <span>{model?.name || modelId}</span>
                              {model?.is_expensive && (
                                <CircleDollarSign className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          }
                          modelIndex={index}
                        />
                        {selectedModels.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-6 rounded-none border-l hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemoveModel(modelId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-700 py-4 px-3" side="bottom" align="start">
                      <div className="space-y-3 text-xs max-w-xs">
                        <div className="grid gap-1">
                          <span className="text-gray-400">Model</span>
                          <span className="font-medium text-white">{model?.name || modelId}</span>
                        </div>
                        
                        <div className="grid gap-1">
                          <span className="text-gray-400">Modalities</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {getModalityIcons(model)}
                            </div>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            <div className="flex space-x-1">
                              <LetterText className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid gap-1">
                          <span className="text-gray-400">Cost</span>
                          <div className="flex items-center space-x-0.5">
                            <ArrowUp className={cn("h-3 w-3", isOverBudget ? 'text-red-400' : 'text-green-400')} />
                            <span className="font-medium text-white">{formatCost(model?.input_cost || 0)}</span>
                            <span className="text-gray-400">/</span>
                            <ArrowDown className={cn("h-3 w-3", isOverBudget ? 'text-red-400' : 'text-green-400')} />
                            <span className="font-medium text-white">{formatCost(model?.output_cost || 0)}</span>
                          </div>
                        </div>
                        
                        {model?.is_expensive && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-red-400 font-medium">Expensive</span>
                          </div>
                        )}
                        
                        <div className="grid gap-1">
                          <span className="text-gray-400">Context Length</span>
                          <span className="font-medium text-white">{model?.context_length ? (model.context_length / 1000).toFixed(0) + 'K' : 'N/A'}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}

          {/* Add Model Button - only show if less than 3 models */}
          {selectedModels.length < 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ModelSelector
                    selectedModels={selectedModels}
                    onAddModel={addModel}
                    onRemoveModel={removeModel}
                    onSetModels={setSelectedModels}
                    triggerAsButton={false}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-700">
                  <span>Add Model (up to 3)</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}