import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, MessageSquare, Bot, TextCursorInput, Tags, ScanText } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useAppStore, type Chat } from '@/stores/app-store';

interface ChatHeaderMetadataProps {
  chat: Chat;
  onShowMicrotasks: () => void;
}

export function ChatHeaderMetadata({ chat, onShowMicrotasks }: ChatHeaderMetadataProps) {
  const { messages, models } = useAppStore();
  const chatMessages = messages.filter(m => m.chat_id === chat.id);

  const messageCounts = {
    total: chat.message_count,
    assistant: chatMessages.filter(m => m.role === 'assistant').length,
    user: chatMessages.filter(m => m.role === 'user').length
  };

  const tokenBreakdown = {
    total: chatMessages.reduce((sum, msg) => sum + (msg.tokens || 0), 0),
    input: chatMessages.reduce((sum, msg) => (msg.role === 'user' || msg.role === 'system') ? sum + (msg.tokens || 0) : sum, 0),
    output: chatMessages.reduce((sum, msg) => msg.role === 'assistant' ? sum + (msg.tokens || 0) : sum, 0),
  };

  const costBreakdown = {
    total: chat.total_cost,
    input: chatMessages.reduce((sum, msg) => (msg.role === 'user' || msg.role === 'system') ? sum + (msg.cost || 0) : sum, 0),
    output: chatMessages.reduce((sum, msg) => msg.role === 'assistant' ? sum + (msg.cost || 0) : sum, 0),
  };

  const calculateContextUsage = () => {
    const chatModels = [...new Set(chatMessages.filter(m => m.model).map(m => m.model))];
    if (chatModels.length === 1) {
      const lastAssistantMessage = [...chatMessages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMessage?.model) {
        const model = models.find(m => m.id === lastAssistantMessage.model);
        if (model?.context_length) {
          return ((lastAssistantMessage.tokens || 0) / model.context_length) * 100;
        }
      }
    } else {
      let totalUsage = 0, modelCount = 0;
      chatModels.forEach(modelId => {
        const model = models.find(m => m.id === modelId);
        const lastMessage = [...chatMessages].reverse().find(m => m.model === modelId && m.role === 'assistant');
        if (model?.context_length && lastMessage) {
          totalUsage += ((lastMessage.tokens || 0) / model.context_length) * 100;
          modelCount++;
        }
      });
      return modelCount > 0 ? totalUsage / modelCount : 0;
    }
    return 0;
  };

  const contextUsage = calculateContextUsage();

  const MetadataItem = ({ icon: Icon, value, tooltip }: { icon: any, value: string, tooltip: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 cursor-pointer group transition-colors duration-200">
            <Icon className="h-4 w-4 stroke-1 group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground light:group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
              {value}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white border-gray-700">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <MetadataItem 
        icon={Clock} 
        value={formatRelativeTime(chat.updated_at)}
        tooltip={
          <div className="text-xs space-y-1">
            <div className="flex justify-between min-w-[12rem]">
              <span>Created</span>
              <span className="font-mono">{new Date(chat.created_at).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
              })}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated</span>
              <span className="font-mono">{new Date(chat.updated_at).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
              })}</span>
            </div>
          </div>
        }
      />
      
      <MetadataItem 
        icon={MessageSquare} 
        value={chat.message_count.toLocaleString()}
        tooltip={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between min-w-[10rem]">
              <span>Total Messages</span>
              <span className="font-mono">{messageCounts.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Assistant</span>
              <span className="font-mono">{messageCounts.assistant}</span>
            </div>
            <div className="flex justify-between">
              <span>User</span>
              <span className="font-mono">{messageCounts.user}</span>
            </div>
          </div>
        }
      />
      
      <MetadataItem 
        icon={Bot} 
        value={chat.models.length.toString()}
        tooltip={
          <div className="space-y-1 text-xs">
            <div className="font-medium">Models Used</div>
            {chat.models.map(modelId => {
              const model = models.find(m => m.id === modelId);
              return (
                <div key={modelId} className="space-y-1">
                  <div>{model?.name || modelId}</div>
                  {model && (
                    <div className="text-gray-400 font-mono">
                      Input: ${model.input_cost?.toFixed(6)}/1K | Output: ${model.output_cost?.toFixed(6)}/1K
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        }
      />
      
      <MetadataItem 
        icon={TextCursorInput} 
        value={tokenBreakdown.total.toLocaleString()}
        tooltip={
          <div className="space-y-1 text-xs">
            <div className="font-bold">Token Breakdown</div>
            <div className="flex justify-between min-w-[12rem]">
              <span>Input Tokens</span>
              <span className="font-mono">{tokenBreakdown.input.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Output Tokens</span>
              <span className="font-mono">{tokenBreakdown.output.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-600 pt-1 mt-1">
              <span>Total Tokens</span>
              <span className="font-mono">{tokenBreakdown.total.toLocaleString()}</span>
            </div>
          </div>
        }
      />

      <MetadataItem 
        icon={ScanText} 
        value={`${contextUsage.toFixed(1)}%`}
        tooltip={
          <div className="space-y-1 text-xs">
            <div className="flex justify-between min-w-[10rem]">
              <span>Context Usage</span>
              <span className="font-mono">{contextUsage.toFixed(1)}%</span>
            </div>
          </div>
        }
      />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer group transition-colors duration-200 text-muted-foreground light:group-hover:text-gray-800 dark:group-hover:text-white">
              ${chat.total_cost.toFixed(4)}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            <div className="space-y-1 text-xs">
              <div className="font-medium">Cost Breakdown</div>
              <div className="flex justify-between min-w-[8rem]">
                <span>Input</span>
                <span className="font-mono">${costBreakdown.input.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Output</span>
                <span className="font-mono">${costBreakdown.output.toFixed(4)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-600 pt-1 mt-1">
                <span>Total</span>
                <span className="font-mono">${costBreakdown.total.toFixed(4)}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="flex items-center space-x-1 cursor-pointer group transition-colors duration-200"
              onClick={onShowMicrotasks}
            >
              <Tags className="h-4 w-4 stroke-1 group-hover:text-primary transition-colors" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            <span>See associated data</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}