import { ChatHeaderMetadata } from './chat-header-metadata';
import { ChatHeaderActions } from './chat-header-actions';
import { type Chat } from '@/stores/app-store';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  chat: Chat;
  onShowMicrotasks: () => void;
  isCompact: boolean;
}

export function ChatHeader({ chat, onShowMicrotasks, isCompact }: ChatHeaderProps) {
  const getDefaultTitle = () => {
    const date = new Date(chat.created_at);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const displayTitle = chat.title === 'Untitled Chat' ? getDefaultTitle() : chat.title;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-30 border-b border-border/20 flex-shrink-0",
      "backdrop-blur-xl transition-all duration-700 ease-out",
      isCompact 
        ? "bg-white/20 dark:bg-black/20 py-3 shadow-lg" 
        : "bg-transparent py-6"
    )}>
      <div className="max-w-4xl mx-auto px-6">
        <div className={cn(
          "flex justify-between transition-all duration-700 ease-out",
          isCompact ? "items-center" : "items-start"
        )}>
          <div className="flex-1">
            <h1 className={cn(
              "font-bold transition-all duration-700 ease-out",
              isCompact ? "text-base mb-0" : "text-2xl mb-1"
            )}>
              {displayTitle}
            </h1>
            
            <div className={cn(
              "transition-all duration-700 ease-out overflow-hidden",
              isCompact 
                ? "opacity-0 max-h-0 transform translate-y-[-10px]" 
                : "opacity-100 max-h-32 transform translate-y-0"
            )}>
              <ChatHeaderMetadata chat={chat} onShowMicrotasks={onShowMicrotasks} />
            </div>
          </div>
          
          <div className={cn(
            "transition-all duration-700 ease-out flex-shrink-0",
            isCompact ? "transform scale-90" : "transform scale-100"
          )}>
            <ChatHeaderActions chat={chat} />
          </div>
        </div>
      </div>
    </header>
  );
}