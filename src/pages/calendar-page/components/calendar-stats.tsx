import { Card } from '@/components/ui/card';
import { MessageSquare, Clock, Bot } from 'lucide-react';

interface CalendarStatsProps {
  chats: any[];
}

export function CalendarStats({ chats }: CalendarStatsProps) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mt-8">
      <Card className="glass p-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <div className="text-2xl font-bold">{chats.length}</div>
            <div className="text-sm text-muted-foreground">Total Chats</div>
          </div>
        </div>
      </Card>

      <Card className="glass p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-2xl font-bold">
              {chats.reduce((acc, chat) => acc + chat.message_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>
        </div>
      </Card>

      <Card className="glass p-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-green-500" />
          <div>
            <div className="text-2xl font-bold">
              {new Set(chats.flatMap(chat => chat.models)).size}
            </div>
            <div className="text-sm text-muted-foreground">Models Used</div>
          </div>
        </div>
      </Card>

      <Card className="glass p-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <div>
            <div className="text-2xl font-bold">
              ${chats.reduce((acc, chat) => acc + chat.total_cost, 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
        </div>
      </Card>
    </div>
  );
}