import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic } from 'lucide-react';
import { SendHorizontalIcon } from '@/components/animate-ui/icons/send-horizontal';
import { cn } from '@/lib/utils';

interface InputControlsProps {
  onAttachFile: () => void;
  canTranscribe: boolean;
  onStartRecording: () => void;
  isStreaming: boolean;
  isOverLimit: boolean;
  onSubmit: () => void;
  isFocused: boolean;
  transcriptionConfig: {
    enabled: boolean;
    model: string;
    openAIKey: string;
  };
}

export function InputControls({
  onAttachFile,
  canTranscribe,
  onStartRecording,
  isStreaming,
  isOverLimit,
  onSubmit,
  isFocused,
  transcriptionConfig
}: InputControlsProps) {
  return (
    <div className={cn(
      "flex items-center space-x-2 shrink-0 transition-all duration-300 ease-out",
      isFocused ? "opacity-100 transform translate-x-0" : "opacity-70"
    )}>
      {/* Recording button with enhanced hover states */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                canTranscribe 
                  ? cn(
                      "hover:bg-blue-500/10 hover:text-blue-600",
                      // Dark mode hover
                      "dark:hover:bg-white/15 dark:hover:text-white",
                      // Light mode hover  
                      "light:hover:bg-gray-500/5 light:hover:text-black"
                    )
                  : "opacity-50 cursor-not-allowed"
              )}
              onClick={canTranscribe ? onStartRecording : undefined}
              disabled={!canTranscribe}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            {canTranscribe ? (
              <span>Start voice recording</span>
            ) : (
              <div className="text-xs">
                <div className="font-medium mb-1">Voice recording disabled</div>
                <div>Missing requirements:</div>
                {!transcriptionConfig.enabled && <div>• Enable transcription in settings</div>}
                {!transcriptionConfig.model && <div>• Set transcription model</div>}
                {!transcriptionConfig.openAIKey && <div>• Add OpenAI API key</div>}
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Send button */}
      <Button
        type="submit"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full border-0 transition-all duration-300",
          "hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]",
          isOverLimit 
            ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-not-allowed"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
        disabled={isStreaming || isOverLimit}
        onClick={onSubmit}
      >
        <SendHorizontalIcon 
          className="h-4 w-4 stroke-white dark:stroke-black"
          animateOnHover={!isOverLimit}
        />
      </Button>
    </div>
  );
}