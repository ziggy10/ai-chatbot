import { Button } from '@/components/ui/button';
import { Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, type Chat } from '@/stores/app-store';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ChatHeaderActionsProps {
  chat: Chat;
}

export function ChatHeaderActions({ chat }: ChatHeaderActionsProps) {
  const { updateChat } = useAppStore();

  const handleBookmarkToggle = async () => {
    try {
      const newBookmarkStatus = !chat.is_bookmarked;
      const { error } = await supabase.from('threads').update({ is_bookmarked: newBookmarkStatus }).eq('id', chat.id);
      if (error) throw error;
      updateChat(chat.id, { is_bookmarked: newBookmarkStatus });
      toast.success(newBookmarkStatus ? 'Chat bookmarked' : 'Bookmark removed');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 transition-all duration-300',
          chat.is_bookmarked && 'text-yellow-500',
          chat.is_bookmarked && 'shadow-[0px_11px_24px_0px_rgba(246,255,47,0.77),0px_15px_30px_0px_rgba(246,255,47,0.5)]',
          'hover:shadow-[0px_15px_30px_0px_rgba(246,255,47,0.85),0px_15px_30px_0px_rgba(246,255,47,0.6)]'
        )}
        onClick={handleBookmarkToggle}
      >
        <Bookmark className={cn('h-4 w-4', chat.is_bookmarked && 'fill-current')} />
      </Button>
      
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}