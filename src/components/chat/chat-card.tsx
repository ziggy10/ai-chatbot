import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MessageSquare, 
  Bookmark, 
  MoreHorizontal,
  Share2,
  Trash2,
  Edit,
  Bot
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore, type Chat } from '@/stores/app-store';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChatCardProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export function ChatCard({ chat, isActive, onClick }: ChatCardProps) {
  const { updateChat, deleteChat } = useAppStore();

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateChat(chat.id, { is_bookmarked: !chat.is_bookmarked });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chat.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement sharing functionality
  };

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  return (
    <Card 
      className={cn(
        'p-3 cursor-pointer transition-all duration-200 hover:shadow-md group relative overflow-hidden',
        isActive && 'ring-2 ring-primary bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm leading-tight flex-1">
            {truncateTitle(chat.title)}
          </h3>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleBookmark}
            >
              <Bookmark 
                className={cn(
                  'h-3 w-3',
                  chat.is_bookmarked && 'fill-current text-yellow-500'
                )} 
              />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(chat.updated_at)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{chat.message_count.toLocaleString()}</span>
          </div>
          
          {chat.models.length > 0 && (
            <div className="flex items-center space-x-1">
              <Bot className="h-3 w-3" />
              <span>{chat.models.length}</span>
            </div>
          )}
          
          <span className="font-medium text-green-600">
            ${chat.total_cost.toFixed(4)}
          </span>
        </div>

        {chat.models.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {chat.models.slice(0, 2).map(model => (
              <Badge 
                key={model} 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5"
              >
                {model.split('-')[0].toUpperCase()}
              </Badge>
            ))}
            {chat.models.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{chat.models.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}