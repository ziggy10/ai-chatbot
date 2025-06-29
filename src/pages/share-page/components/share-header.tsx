import { Badge } from '@/components/ui/badge';
import { Bird, Calendar, MessageSquare, Bot, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Chat } from '@/stores/app-store';

interface ShareHeaderProps {
  chat: Chat;
}

export function ShareHeader({ chat }: ShareHeaderProps) {
  return (
    <header className="border-b border-border/20 bg-background/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Bird className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mimir
          </span>
          <Badge variant="secondary">Shared Chat</Badge>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold mb-2">{chat.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{chat.message_count} messages</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Bot className="h-4 w-4" />
              <span>{chat.models.length} models</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}