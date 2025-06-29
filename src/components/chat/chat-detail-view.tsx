import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MessageInput } from './message-input';
import { MessageCard } from './message-card';
import { ChatHeader } from './chat-detail-view/chat-header';
import { SystemPromptSection } from './chat-detail-view/system-prompt-section';
import { MicrotasksDialog } from './chat-detail-view/microtasks-dialog';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useAppStore, type Chat } from '@/stores/app-store';
import { AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ChatDetailViewProps {
  chat: Chat;
}

export function ChatDetailView({ chat }: ChatDetailViewProps) {
  const { 
    messages, selectedModels, models, loadMessages, isStreaming, streamingContent, sendMessage,
  } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMicrotasksDialog, setShowMicrotasksDialog] = useState(false);
  const [microtasks, setMicrotasks] = useState<any[]>([]);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  
  const chatMessages = messages.filter(m => m.chat_id === chat.id);
  const chatModels = [...new Set(chatMessages.filter(m => m.model).map(m => m.model))];
  const hasMultipleModels = chatModels.length > 1;

  useEffect(() => {
    loadMessages(chat.id);
  }, [chat.id, loadMessages]);

  // Header animation based on scroll position only
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      
      // Header animation
      const shouldBeCompact = scrollTop > 50;
      if (shouldBeCompact !== isHeaderCompact) {
        setIsHeaderCompact(shouldBeCompact);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isHeaderCompact]);

  // Reset header state when chat changes
  useEffect(() => {
    setIsHeaderCompact(false);
  }, [chat.id]);

  const handleRetryMessage = async (messageId: string) => {
    const message = chatMessages.find(m => m.id === messageId);
    if (!message || message.role !== 'user') return;
    try {
      await sendMessage(chat.id, message.content);
      toast.success('Message retried successfully');
    } catch (error) {
      toast.error('Failed to retry message');
    }
  };

  const copyError = (error: string) => {
    navigator.clipboard.writeText(error);
    toast.success('Error copied to clipboard');
  };

  const loadMicrotasks = async () => {
    try {
      const { data, error } = await supabase.from('microtasks').select('*').eq('thread_id', chat.id).order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading microtasks:', error);
        return;
      }
      setMicrotasks(data || []);
    } catch (error) {
      console.error('Error loading microtasks:', error);
    }
  };

  const handleShowMicrotasks = async () => {
    await loadMicrotasks();
    setShowMicrotasksDialog(true);
  };

  const getModelName = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  const systemMessage = chatMessages.find(m => m.role === 'system');

  const ModelColumn = ({ model, index }: { model: string, index: number }) => (
    <div className="flex-1 border-r border-border/20 last:border-r-0 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border/20 bg-muted/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{getModelName(model)}</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {chatMessages.filter(m => 
            m.model === model || (m.role === 'user' && !m.model) || (m.role === 'system' && !m.model)
          ).map(message => (
            <MessageCard key={`${message.id}-${model}`} message={message} compact />
          ))}
          
          {isStreaming && streamingContent[model] && (
            <Card className="p-4 bg-muted/50">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {streamingContent[model].startsWith('Error:') ? (
                  <div className="text-destructive">
                    <p className="whitespace-pre-wrap">{streamingContent[model]}</p>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{streamingContent[model]}</p>
                )}
                {!streamingContent[model].startsWith('Error:') && (
                  <div className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const MobileModelColumn = ({ model, index }: { model: string, index: number }) => (
    <div className="w-full flex-shrink-0 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border/20 bg-muted/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{getModelName(model)}</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex space-x-1">
            {chatModels.map((_, i) => (
              <button
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentColumnIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
                onClick={() => setCurrentColumnIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {chatMessages.filter(m => 
            m.model === model || (m.role === 'user' && !m.model) || (m.role === 'system' && !m.model)
          ).map(message => (
            <MessageCard key={`${message.id}-${model}`} message={message} compact />
          ))}
          
          {isStreaming && streamingContent[model] && (
            <Card className="p-4 bg-muted/50">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {streamingContent[model].startsWith('Error:') ? (
                  <div className="text-destructive">
                    <p className="whitespace-pre-wrap">{streamingContent[model]}</p>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{streamingContent[model]}</p>
                )}
                {!streamingContent[model].startsWith('Error:') && (
                  <div className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SidebarToggle isCompact={isHeaderCompact} />
      <ChatHeader chat={chat} onShowMicrotasks={handleShowMicrotasks} isCompact={isHeaderCompact} />

      <div 
        ref={containerRef}
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-700 ease-out",
          isHeaderCompact ? "pt-20" : "pt-32"
        )}
      >
        {hasMultipleModels ? (
          <div className="flex h-full">
            {/* Desktop: Show all columns */}
            <div className="hidden md:flex w-full">
              {chatModels.map((model, index) => (
                <ModelColumn key={model} model={model} index={index} />
              ))}
            </div>

            {/* Mobile: Show one column at a time with swipe navigation */}
            <div className="md:hidden w-full relative overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-out h-full"
                style={{ transform: `translateX(-${currentColumnIndex * 100}%)` }}
              >
                {chatModels.map((model, index) => (
                  <MobileModelColumn key={model} model={model} index={index} />
                ))}
              </div>

              {/* Next column preview */}
              {currentColumnIndex < chatModels.length - 1 && (
                <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
        ) : (
          // Single model view
          <div className="h-full">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              <SystemPromptSection systemMessage={systemMessage} />

              {chatMessages.filter(m => m.role !== 'system').map(message => (
                <div key={message.id}>
                  <MessageCard message={message} showModel />
                  
                  {message.error && (
                    <Alert className="mt-2 border-destructive/20 bg-destructive/10">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-destructive">Message failed</p>
                          <p className="text-xs text-muted-foreground mt-1">{message.error}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => copyError(message.error!)} className="h-7 text-xs">
                            Copy Error
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRetryMessage(message.id)} className="h-7 text-xs">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
              
              {/* Streaming messages */}
              {isStreaming && Object.keys(streamingContent).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(streamingContent).map(([model, content]) => (
                    <div key={model} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-muted-foreground text-muted-foreground group hover:border-pink-500 transition-colors">
                        <span className="text-xs font-mono group-hover:text-pink-500 group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] transition-all">
                          {model.split('/')[1]?.charAt(0) || 'M'}
                        </span>
                      </div>
                      <div className="flex-1 max-w-[80%]">
                        <Card className="p-4 bg-muted/50">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {content.startsWith('Error:') ? (
                              <div className="text-destructive">
                                <p className="whitespace-pre-wrap">{content}</p>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{content}</p>
                            )}
                            {!content.startsWith('Error:') && (
                              <div className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Messages end marker - no auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-border/20 bg-background/50 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto p-6">
          <MessageInput chatId={chat.id} />
        </div>
      </div>

      <MicrotasksDialog 
        open={showMicrotasksDialog}
        onOpenChange={setShowMicrotasksDialog}
        chatId={chat.id}
        microtasks={microtasks}
      />
    </div>
  );
}