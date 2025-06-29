import { useState } from 'react';
import { MessageInput } from './message-input';
import { ModelSelection } from './new-chat-view/model-selection';
import { GreetingSection } from './new-chat-view/greeting-section';
import { useAppStore } from '@/stores/app-store';

export function NewChatView() {
  const { sidebarCollapsed } = useAppStore();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handlePromptClick = (prompt: string) => {
    const messageInput = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
    if (messageInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(messageInput, prompt);
      }
      
      const event = new Event('input', { bubbles: true });
      messageInput.dispatchEvent(event);
      
      messageInput.focus();
      messageInput.setSelectionRange(prompt.length, prompt.length);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Model Selector in top bar */}
      <ModelSelection sidebarCollapsed={sidebarCollapsed} />

      {/* Main content area - moved entire unit down by 2rem */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-8 space-y-2">
          {/* Greeting Section */}
          <GreetingSection 
            isInputFocused={isInputFocused}
            onPromptClick={handlePromptClick}
          />

          {/* Message Input - Reduced spacing from greeting */}
          <div className="relative z-10">
            <MessageInput 
              isNewChat 
              onFocusChange={setIsInputFocused}
            />
          </div>

          {/* Suggested Prompt Cards - Increased spacing from message input */}
          <div className="relative z-10 pt-8">
            <GreetingSection 
              isInputFocused={isInputFocused}
              onPromptClick={handlePromptClick}
              showOnlyPrompts={true}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-background/50 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto p-4 flex justify-center">
          <div className="text-xs space-x-2">
            <span className="text-muted-foreground/50">&copy;</span>
            <a 
              href="https://x.com/kingsidharth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors duration-300"
            >
              @kingsidharth
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a 
              href="https://outskill.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors duration-300"
            >
              Outskill
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}