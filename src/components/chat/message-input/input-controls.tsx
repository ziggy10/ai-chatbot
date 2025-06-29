import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Paperclip, Mic, Square } from 'lucide-react';
import { SendHorizontalIcon } from '@/components/animate-ui/icons/send-horizontal';
import { cn } from '@/lib/utils';

interface InputControlsProps {
  onAttachFile: () => void;
  canTranscribe: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  isStreaming: boolean;
  isOverLimit: boolean;
  onSubmit: () => void;
}

export function InputControls({
  onAttachFile,
  canTranscribe,
  isRecording,
  onToggleRecording,
  isStreaming,
  isOverLimit,
  onSubmit
}: InputControlsProps) {
  return (
    <div className="flex items-center space-x-2 shrink-0">
      {/* Attachments button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onAttachFile}
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {/* Recording button - always show, disabled if transcription not available */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full',
                isRecording && 'text-red-500 bg-red-500/10',
                !canTranscribe && 'opacity-50 cursor-not-allowed'
              )}
              onClick={canTranscribe ? onToggleRecording : undefined}
              disabled={!canTranscribe}
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            {canTranscribe ? (
              <span>{isRecording ? 'Stop recording' : 'Start voice recording'}</span>
            ) : (
              <div className="text-xs">
                <div className="font-medium mb-1">Voice recording disabled</div>
                <div>Requirements:</div>
                <div>• Enable transcription in settings</div>
                <div>• Set transcription model</div>
                <div>• Add OpenAI API key</div>
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
          "h-8 w-8 rounded-full border-0 hover:shadow-lg transition-all duration-300",
          isOverLimit 
            ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-not-allowed"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
        disabled={isStreaming || isOverLimit}
        onClick={onSubmit}
      >
        <SendHorizontalIcon 
          className={cn(
            "h-4 w-4",
            "dark:stroke-current stroke-black dark:stroke-white"
          )}
          animateOnHover={!isOverLimit}
        />
      </Button>
    </div>
  );
}