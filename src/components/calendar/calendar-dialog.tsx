import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/stores/app-store';
import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarDialog({ open, onOpenChange }: CalendarDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { chats, setCurrentChatId } = useAppStore();
  const navigate = useNavigate();

  // Get chat counts by date for calendar dots
  const getChatCountForDate = (date: Date) => {
    return chats.filter(chat => isSameDay(new Date(chat.updated_at), date)).length;
  };

  // Get chats for selected date
  const getChatsForDate = (date: Date) => {
    return chats.filter(chat => isSameDay(new Date(chat.updated_at), date));
  };

  const selectedDateChats = selectedDate ? getChatsForDate(selectedDate) : [];

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId);
    navigate(`/chat/${chatId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[500px] card">
        <DialogHeader>
          <DialogTitle>Chat Calendar</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full gap-6">
          {/* Left Column - Calendar (reduced width to hug content) */}
          <div className="w-fit">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border p-2"
              classNames={{
                day_button: "rounded-full relative w-6 h-6",
                table: "w-full",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md w-6 font-normal text-xs flex-1 text-center",
                row: "flex w-full mt-1",
                cell: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md flex-1 flex justify-center",
              }}
              components={{
                DayContent: ({ date }) => {
                  const chatCount = getChatCountForDate(date);
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative w-full h-full flex items-center justify-center">
                            {date.getDate()}
                            {chatCount > 0 && (
                              <div 
                                className={cn(
                                  "absolute bottom-0 w-1 h-1 rounded-full",
                                  "left-1/2 transform -translate-x-1/2",
                                  chatCount <= 2 ? "bg-primary/40" :
                                  chatCount <= 5 ? "bg-primary/70" : "bg-primary"
                                )}
                              />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-gray-700">
                          <div className="text-xs">
                            {format(date, 'MMM dd')} - Chats: {chatCount}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
              }}
            />
          </div>

          {/* Right Column - Chat List */}
          <div className="flex-1 border-l border-border/20 pl-4">
            {/* Header with date and count on same line */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h3>
              <span className="text-sm text-muted-foreground">
                {selectedDateChats.length} chat{selectedDateChats.length !== 1 ? 's' : ''}
              </span>
            </div>

            <ScrollArea className="h-[350px]">
              {selectedDateChats.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateChats.map(chat => (
                    <div
                      key={chat.id}
                      className={cn(
                        'p-3 cursor-pointer transition-all duration-200 hover:shadow-md group relative overflow-hidden rounded-md border',
                        'hover:border-white/40'
                      )}
                      onClick={() => handleChatClick(chat.id)}
                    >
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
                      
                      <div className="relative">
                        <h4 className="font-medium text-sm leading-tight mb-2">
                          {chat.title.length > 50 ? chat.title.slice(0, 50) + '...' : chat.title}
                        </h4>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-2.5 w-2.5" strokeWidth={1} />
                              <span>{formatRelativeTime(chat.updated_at)}</span>
                            </div>
                            
                            <span>&middot;</span>
                            
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-2.5 w-2.5" strokeWidth={1} />
                              <span>{chat.message_count.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <span className="font-medium">
                            ${chat.total_cost.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.25} />
                  <p className="text-muted-foreground">
                    {selectedDate ? 'No chats on this date' : 'Select a date to view chats'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}