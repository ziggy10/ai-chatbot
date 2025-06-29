import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { SparklesCore } from '@/components/ui/sparkles-core';
import { LoaderPinwheelIcon } from '@/components/animate-ui/icons/loader-pinwheel';
import { useAppStore } from '@/stores/app-store';
import { useNavigate } from 'react-router-dom';
import { MicrotaskService } from '@/lib/openrouter';
import { cn } from '@/lib/utils';

const GREETING_TEMPLATES = [
  "Howdy, {name}?",
  "Namaste, {name}!",
  "How's the day, {name}?",
  "Let's chat, {name}?",
  "{name}, sup?",
  "Hello there! Let's chat?"
];

interface GreetingSectionProps {
  isInputFocused: boolean;
  onPromptClick: (prompt: string) => void;
  showOnlyPrompts?: boolean;
}

export function GreetingSection({ isInputFocused, onPromptClick, showOnlyPrompts = false }: GreetingSectionProps) {
  const { openRouterKey, appSettings, chats } = useAppStore();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello there! Let's chat?");
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  // Generate greeting based on user name and templates, or load from microtasks
  useEffect(() => {
    const loadGreetingAndPrompts = async () => {
      const aiGreeting = await MicrotaskService.getLatestAppGreeting();
      
      if (aiGreeting) {
        setGreeting(aiGreeting.greeting);
        setSuggestedPrompts(aiGreeting.prompts);
      } else {
        if (appSettings?.user_name) {
          const randomTemplate = GREETING_TEMPLATES[Math.floor(Math.random() * (GREETING_TEMPLATES.length - 1))];
          setGreeting(randomTemplate.replace('{name}', appSettings.user_name));
        } else {
          setGreeting(GREETING_TEMPLATES[GREETING_TEMPLATES.length - 1]);
        }
        
        setSuggestedPrompts([
          "Help me brainstorm ideas for a new project",
          "Explain a complex topic in simple terms",
          "Review and improve my writing"
        ]);
      }
    };

    if (appSettings) {
      loadGreetingAndPrompts();
    }
  }, [appSettings, chats.length]);

  // Trigger app_greeting microtask creation periodically
  useEffect(() => {
    if (chats.length >= 5 && openRouterKey) {
      MicrotaskService.createAppGreetingMicrotask();
    }
  }, [chats.length, openRouterKey]);

  const handleFinishSetup = () => {
    navigate('/settings');
    setTimeout(() => {
      const apiKeyInput = document.getElementById('openrouter-key');
      if (apiKeyInput) {
        apiKeyInput.focus();
      }
    }, 100);
  };

  // If showing only prompts, return just the prompt cards with glass effect
  if (showOnlyPrompts) {
    return (
      <div className="w-full">
        {suggestedPrompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {suggestedPrompts.map((prompt, index) => (
              <Card 
                key={index}
                className="glass p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30 group text-foreground/80 hover:text-foreground border-0"
                onClick={() => onPromptClick(prompt)}
              >
                <div className="text-sm text-left transition-colors">
                  {prompt}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Particles background - enhanced with radial opacity and smooth transitions */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[120vw] h-[120vh]">
          <SparklesCore
            id="tsparticles"
            background="transparent"
            minSize={isInputFocused ? 0.5 : 0.4}
            maxSize={isInputFocused ? 1.4 : 0.6}
            particleDensity={isInputFocused ? 450 : 80}
            className={`w-full h-full transition-all duration-1500 ease-out ${
              isInputFocused ? 'opacity-100' : 'opacity-30'
            }`}
            particleColor={isInputFocused ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 0.4)"}
            speed={isInputFocused ? 1.0 : 0.3}
            particleSize={isInputFocused ? 1.4 : 0.6}
          />
          
          {/* Radial gradient overlay for opacity falloff */}
          <div 
            className={cn(
              "absolute inset-0 transition-all duration-1500 ease-out",
              "bg-gradient-radial from-transparent via-transparent to-background/80"
            )}
            style={{
              background: `radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(var(--background), 0.3) 60%, rgba(var(--background), 0.8) 100%)`
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center mb-8">
        {/* OpenRouter Key Warning */}
        {!openRouterKey && (
          <div className="max-w-2xl mb-8">
            <RainbowButton onClick={handleFinishSetup} className="mb-4">
              Finish Setup, Experience Magic
            </RainbowButton>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-3 mb-4">
          <LoaderPinwheelIcon 
            className="h-6 w-6 text-primary" 
            animation="default"
            animateOnHover={true}
            strokeWidth={1}
          />
          <h1 className="text-3xl font-medium text-foreground">
            {greeting}
          </h1>
        </div>
      </div>
    </div>
  );
}