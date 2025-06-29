import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { MessageCard } from '@/components/chat/message-card';
import { useAppStore } from '@/stores/app-store';
import { Bird, MessageSquare } from 'lucide-react';
import { ShareHeader } from './share-page/components/share-header';
import { ShareFooter } from './share-page/components/share-footer';

export function SharePage() {
  const { chatId } = useParams();
  const { chats, messages } = useAppStore();
  
  const chat = chats.find(c => c.id === chatId);
  const chatMessages = chat ? messages.filter(m => m.chat_id === chat.id) : [];

  if (!chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
        <Card className="glass p-8 text-center max-w-md">
          <Bird className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Chat Not Found</h1>
          <p className="text-muted-foreground">
            This shared chat doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ShareHeader chat={chat} />

      {/* Messages */}
      <main className="max-w-4xl mx-auto p-6">
        {chatMessages.length > 0 ? (
          <div className="space-y-6">
            {chatMessages.map(message => (
              <MessageCard 
                key={message.id} 
                message={message} 
                showModel 
              />
            ))}
          </div>
        ) : (
          <Card className="glass p-8 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Messages</h2>
            <p className="text-muted-foreground">
              This chat doesn't have any messages yet.
            </p>
          </Card>
        )}
      </main>

      <ShareFooter />
    </div>
  );
}