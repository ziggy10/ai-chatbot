import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageActions } from './message-card/message-actions';
import { MessageMetadata } from './message-card/message-metadata';
import { RawResponseDialog } from './message-card/raw-response-dialog';
import { Brain, FileText, Image as ImageIcon } from 'lucide-react';
import { useAppStore, type Message } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessageCardProps {
  message: Message;
  showModel?: boolean;
  compact?: boolean;
}

export function MessageCard({ message, showModel = false, compact = false }: MessageCardProps) {
  const [showRawResponse, setShowRawResponse] = useState(false);
  
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const regenerateMessage = () => {
    console.log('Regenerating message:', message.id);
  };

  // Don't render system messages here
  if (isSystem) {
    return null;
  }

  const getAttachmentIcon = (attachment: any) => {
    if (attachment.type === 'image') return ImageIcon;
    if (attachment.type === 'pdf') return FileText;
    return FileText;
  };

  return (
    <div className="space-y-2">
      <div className={cn('flex gap-4', isUser && 'flex-row-reverse')}>
        {/* Avatar - only show for assistant messages */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-muted-foreground text-muted-foreground group hover:border-pink-500 transition-colors">
            <Brain className="w-4 h-4 group-hover:text-pink-500 group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] transition-all" strokeWidth={1} />
          </div>
        )}

        {/* Message content */}
        <div className={cn('flex-1', isUser ? 'max-w-[80%]' : 'max-w-[80%]', compact && 'max-w-full')}>
          <Card className={cn(
            'p-4 relative group',
            isUser ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
          )}>
            {/* Attachments - before message content */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {message.attachments.map((attachment, index) => {
                  const Icon = getAttachmentIcon(attachment);
                  return (
                    <Badge key={index} variant="outline" className="text-xs flex items-center space-x-1">
                      <Icon className="h-3 w-3" />
                      <span>{attachment.filename}</span>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Message text with markdown parsing */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown className="whitespace-pre-wrap">
                {message.content}
              </ReactMarkdown>
            </div>
          </Card>
        </div>
      </div>

      {/* Actions and metadata alignment */}
      <div className={cn(
        'flex items-center justify-between',
        isUser ? 'pl-[20%] pr-4' : 'pl-12 pr-[20%]'
      )}>
        <MessageActions
          content={message.content}
          isUser={isUser}
          model={message.model}
          onShowRawResponse={() => setShowRawResponse(true)}
          onRegenerate={regenerateMessage}
        />

        <MessageMetadata
          message={message}
          isUser={isUser}
          showModel={showModel}
        />
      </div>

      <RawResponseDialog
        open={showRawResponse}
        onOpenChange={setShowRawResponse}
        message={message}
      />
    </div>
  );
}