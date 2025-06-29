import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ListPlus, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Hooks
import { useRecording } from './message-input/hooks/use-recording';
import { useTranscription } from './message-input/hooks/use-transcription';

// Components
import { RecorderControls } from './message-input/recorder-controls';
import { InputSettings } from './message-input/input-settings';
import { AttachmentList } from './message-input/components/attachment-list';
import { InputControls } from './message-input/components/input-controls';
import { CharacterCounter } from './message-input/components/character-counter';

// Types
import { MessageInputProps } from './message-input/types';

const MAX_CHARACTERS = 2000;

export function MessageInput({ chatId, isNewChat, onFocusChange }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    selectedModels, 
    openRouterKey, 
    sendMessage, 
    isStreaming, 
    appSettings, 
    setCurrentChatId,
  } = useAppStore();

  // Custom hooks
  const {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    deleteRecording,
    retryRecording,
    setRecorderState,
  } = useRecording();

  const { canTranscribe, transcribeAudio, getTranscriptionConfig } = useTranscription();

  // Derived state
  const charactersLeft = MAX_CHARACTERS - message.length;
  const isOverLimit = message.length > MAX_CHARACTERS;
  const transcriptionConfig = getTranscriptionConfig();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && recordingState.recorderState === 'idle') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message, recordingState.recorderState]);

  // Update temperature and max tokens from app settings
  useEffect(() => {
    if (appSettings) {
      setTemperature([appSettings.default_temperature]);
      setMaxTokens([appSettings.max_output_tokens]);
    }
  }, [appSettings]);

  // Handle transcription when audio is ready
  useEffect(() => {
    if (recordingState.recorderState === 'processing' && recordingState.audioBlob) {
      handleTranscription();
    }
  }, [recordingState.recorderState, recordingState.audioBlob]);

  const handleTranscription = async () => {
    if (!recordingState.audioBlob) return;
    
    try {
      const transcription = await transcribeAudio(
        recordingState.audioBlob,
        recordingState.recordingTime,
        chatId
      );
      
      // Animate transcription appearing in the input
      const currentMessage = message;
      const newMessage = currentMessage + (currentMessage ? ' ' : '') + transcription;
      
      setMessage(newMessage);
      
      // Reset recorder state with animation
      setTimeout(() => {
        setRecorderState('idle');
        
        // Focus the textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newMessage.length, newMessage.length);
        }
      }, 300);
      
      toast.success('Audio transcribed successfully');
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setRecorderState('paused');
      
      toast.error(error instanceof Error ? error.message : 'Failed to transcribe audio', {
        action: {
          label: 'Copy Error',
          onClick: () => navigator.clipboard.writeText(error instanceof Error ? error.message : 'Unknown error'),
        },
      });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onFocusChange?.(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024;
      
      if (!isImage && !isPdf) {
        toast.error('Only images and PDF files are supported');
        return false;
      }
      if (!isValidSize) {
        toast.error('File size must be less than 10MB');
        return false;
      }
      return true;
    });

    const totalFiles = attachments.length + validFiles.length;
    if (totalFiles > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    if (isOverLimit) {
      toast.error(`Message is too long. Maximum ${MAX_CHARACTERS} characters allowed.`);
      return;
    }

    if (!openRouterKey) {
      toast.error('Please set your OpenRouter API key in settings');
      return;
    }

    if (selectedModels.length === 0) {
      toast.error('Please select at least one model');
      return;
    }

    try {
      let currentChatId = chatId;
      
      if (!currentChatId) {
        await sendMessage(null, message, {
          temperature: temperature[0],
          max_tokens: maxTokens[0],
        });
        
        setTimeout(() => {
          const { currentChatId: newChatId } = useAppStore.getState();
          if (newChatId) {
            navigate(`/chat/${newChatId}`);
          }
        }, 100);
      } else {
        await sendMessage(currentChatId, message, {
          temperature: temperature[0],
          max_tokens: maxTokens[0],
        });
      }
      
      setMessage('');
      setAttachments([]);
      
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  return (
    <div className="space-y-4">
      {/* Attachments */}
      {recordingState.recorderState === 'idle' && (
        <AttachmentList 
          attachments={attachments} 
          onRemoveAttachment={removeAttachment} 
        />
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit}>
        <div className={cn(
          "relative card rounded-lg border border-border/50",
          "transition-all duration-500 ease-out",
          isFocused && recordingState.recorderState === 'idle' && "message-input-focused",
          isOverLimit && "border-destructive",
          recordingState.recorderState !== 'idle' && cn(
            "border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]",
            recordingState.recorderState === 'processing' && "border-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          )
        )}>
          {/* Character count indicator */}
          {recordingState.recorderState === 'idle' && (
            <CharacterCounter 
              currentLength={message.length}
              maxLength={MAX_CHARACTERS}
            />
          )}

          {/* Active Recorder State */}
          {(recordingState.recorderState === 'recording' || 
            recordingState.recorderState === 'paused' || 
            recordingState.recorderState === 'processing') && (
            <RecorderControls
              recorderState={recordingState.recorderState}
              recordingTime={recordingState.recordingTime}
              waveformData={recordingState.waveformData}
              onPause={pauseRecording}
              onResume={resumeRecording}
              onStop={stopRecording}
              onRetry={recordingState.audioBlob ? retryRecording : undefined}
              onDelete={deleteRecording}
              maxRecordingTime={600}
            />
          )}

          {/* Normal Input State */}
          {recordingState.recorderState === 'idle' && (
            <>
              <div className="flex items-start space-x-3 p-4">
                {/* File attachment button - moved to left */}
                <div className={cn(
                  "transition-all duration-300 ease-out",
                  isFocused ? "opacity-100 transform translate-x-0" : "opacity-70"
                )}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>

                {/* Message textarea - no borders/outlines */}
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Type your message..."
                  className={cn(
                    "min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus:outline-none shadow-none p-0 flex-1",
                    "transition-all duration-300 ease-out",
                    isOverLimit && "text-destructive"
                  )}
                  disabled={isStreaming}
                />

                {/* Input controls - mic and send */}
                <InputControls
                  onAttachFile={() => fileInputRef.current?.click()}
                  canTranscribe={canTranscribe()}
                  onStartRecording={startRecording}
                  isStreaming={isStreaming}
                  isOverLimit={isOverLimit}
                  onSubmit={handleSubmit}
                  isFocused={isFocused}
                  transcriptionConfig={transcriptionConfig}
                />
              </div>

              {/* Horizontal divider - only show for new chat */}
              {isNewChat && (
                <div className="border-t dark:border-white/10 border-gray-200" />
              )}
            </>
          )}

          {/* Settings on second line for new chat */}
          {isNewChat && recordingState.recorderState === 'idle' && (
            <div className={cn(
              "px-4 py-2 transition-all duration-300 ease-out",
              isFocused ? "opacity-100" : "opacity-70"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <ListPlus className="h-3 w-3 mr-1" />
                    Prompt Library
                  </Button>
                </div>

                <InputSettings
                  temperature={temperature}
                  maxTokens={maxTokens}
                  onTemperatureChange={setTemperature}
                  onMaxTokensChange={setMaxTokens}
                  showAdvanced={showAdvanced}
                  onShowAdvancedChange={setShowAdvanced}
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}