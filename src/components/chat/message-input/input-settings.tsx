import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Thermometer, TextCursorInput, Infinity } from 'lucide-react';

interface InputSettingsProps {
  temperature: number[];
  maxTokens: number[];
  onTemperatureChange: (value: number[]) => void;
  onMaxTokensChange: (value: number[]) => void;
  showAdvanced: boolean;
  onShowAdvancedChange: (show: boolean) => void;
}

export function InputSettings({
  temperature,
  maxTokens,
  onTemperatureChange,
  onMaxTokensChange,
  showAdvanced,
  onShowAdvancedChange
}: InputSettingsProps) {
  return (
    <div className="flex items-center space-x-1 text-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog open={showAdvanced} onOpenChange={onShowAdvancedChange}>
              <DialogTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted/50 transition-colors flex items-center space-x-1"
                >
                  <Thermometer className="h-3 w-3" />
                  <span>{temperature[0]}</span>
                </Badge>
              </DialogTrigger>
              <DialogContent className="card">
                <DialogHeader>
                  <DialogTitle>Advanced Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Temperature: {temperature[0]}</Label>
                    <Slider
                      value={temperature}
                      onValueChange={onTemperatureChange}
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls randomness. Lower values make responses more focused and deterministic.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Tokens: {maxTokens[0] === 0 ? '∞' : maxTokens[0]}</Label>
                    <Slider
                      value={maxTokens}
                      onValueChange={onMaxTokensChange}
                      max={4096}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of tokens to generate in the response. 0 = no limits.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-black text-white border-gray-700"
            side="top"
            align="end"
            sideOffset={5}
          >
            <p>Temperature: {temperature[0]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-muted/50 transition-colors flex items-center space-x-1"
              onClick={() => onShowAdvancedChange(true)}
            >
              {maxTokens[0] === 0 ? (
                <Infinity className="h-3 w-3" />
              ) : (
                <TextCursorInput className="h-3 w-3" />
              )}
              <span>{maxTokens[0] === 0 ? '∞' : maxTokens[0].toLocaleString()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent 
            className="bg-black text-white border-gray-700"
            side="top"
            align="end"
            sideOffset={5}
          >
            <p>{maxTokens[0] === 0 ? 'Max Output Tokens: No limits' : `Max Output Tokens: ${maxTokens[0].toLocaleString()}`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}