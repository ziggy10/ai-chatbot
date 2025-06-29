import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  chats: any[];
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
}

export function CalendarGrid({ currentDate, chats, onNavigateMonth, onToday }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group chats by date
  const chatsByDate = chats.reduce((acc, chat) => {
    const date = format(new Date(chat.updated_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(chat);
    return acc;
  }, {} as Record<string, typeof chats>);

  const getDayChats = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return chatsByDate[dateKey] || [];
  };

  return (
    <Card className="glass p-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth('prev')}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth('next')}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {days.map(day => {
          const dayChats = getDayChats(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'bg-background p-3 min-h-[120px] relative',
                !isCurrentMonth && 'text-muted-foreground bg-muted/30',
                isToday && 'bg-primary/5 border-2 border-primary/20'
              )}
            >
              {/* Day number */}
              <div className={cn(
                'text-sm font-medium mb-2',
                isToday && 'text-primary font-bold'
              )}>
                {format(day, 'd')}
              </div>

              {/* Chat indicators */}
              {dayChats.length > 0 && (
                <div className="space-y-1">
                  {dayChats.slice(0, 3).map(chat => (
                    <div
                      key={chat.id}
                      className="text-xs p-1 rounded bg-primary/10 border border-primary/20 truncate"
                    >
                      {chat.title}
                    </div>
                  ))}
                  
                  {dayChats.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayChats.length - 3} more
                    </div>
                  )}
                </div>
              )}

              {/* Chat count badge */}
              {dayChats.length > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute top-1 right-1 text-xs h-5 w-5 p-0 flex items-center justify-center"
                >
                  {dayChats.length}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}