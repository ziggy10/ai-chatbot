import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, TextCursorInput, Tags, CaseUpper, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useAppStore, type Message } from '@/stores/app-store';

interface MessageMetadataProps {
  message: Message;
  isUser: boolean;
  showModel?: boolean;
}

export function MessageMetadata({ message, isUser, showModel }: MessageMetadataProps) {
  const { models } = useAppStore();
  const model = message.model ? models.find(m => m.id === message.model) : null;
  const isAssistant = message.role === 'assistant';

  return (
    <div className="flex items-center space-x-2 text-xs text-white/70 font-normal">
      {/* Additional metadata for assistant messages */}
      {isAssistant && (
        <>
          {!isUser && showModel && model && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 cursor-pointer group transition-colors duration-200">
                    <Brain className="h-[14px] w-[14px] stroke-1 group-hover:text-white transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-700">
                  <span>{model.name}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <span>&middot;</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 cursor-pointer group transition-colors duration-200">
                  <Tags className="h-[14px] w-[14px] stroke-1 group-hover:text-white transition-colors" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-700">
                <div className="text-xs">
                  Temperature
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span>&middot;</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 cursor-pointer group transition-colors duration-200">
                  <CaseUpper className="h-[14px] w-[14px] stroke-1 group-hover:text-white transition-colors" />
                  <span className="text-[14px] group-hover:text-white transition-colors">
                    {message.content.length.toLocaleString()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-700">
                <div className="text-xs">
                  <span className="font-mono">{message.content.length.toLocaleString()}</span> characters
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span>&middot;</span>

          {message.tokens && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 cursor-pointer group transition-colors duration-200">
                      <TextCursorInput className="h-[14px] w-[14px] stroke-1 group-hover:text-white transition-colors" />
                      <span className="text-[14px] group-hover:text-white transition-colors">
                        {message.tokens.toLocaleString()}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-gray-700">
                    <div className="space-y-1 text-xs">
                      <div className="font-bold">Token Breakdown</div>
                      <div className="flex justify-between min-w-[10rem]">
                        <span>Input Tokens</span>
                        <span className="font-mono">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Output Tokens</span>
                        <span className="font-mono">{message.tokens.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-gray-600 pt-1 mt-1">
                        <span>Total Tokens</span>
                        <span className="font-mono">{message.tokens.toLocaleString()}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span>&middot;</span>
            </>
          )}
        </>
      )}
      
      {/* Clock always last */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1 cursor-pointer group transition-colors duration-200">
              <Clock className="h-[14px] w-[14px] stroke-1 group-hover:text-white transition-colors" />
              <span className="text-[14px] group-hover:text-white transition-colors">
                {formatRelativeTime(message.created_at)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            <div className="text-xs">
              <span className="font-mono">{new Date(message.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}