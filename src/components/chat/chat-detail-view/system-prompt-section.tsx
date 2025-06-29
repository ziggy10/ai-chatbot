import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { LaptopMinimal, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SystemPromptSectionProps {
  systemMessage: any;
}

export function SystemPromptSection({ systemMessage }: SystemPromptSectionProps) {
  const [isSystemExpanded, setIsSystemExpanded] = useState(false);

  if (!systemMessage) return null;

  return (
    <div className="space-y-4">
      <Card 
        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors border border-solid"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsSystemExpanded(!isSystemExpanded);
          return false;
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LaptopMinimal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">System Prompt</span>
          </div>
          {isSystemExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </Card>
      
      {isSystemExpanded && (
        <Card className="p-4 bg-muted/30 border border-solid animate-in fade-in duration-300">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown className="whitespace-pre-wrap text-sm">
              {systemMessage.content}
            </ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  );
}