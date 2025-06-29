import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
}

export function CalendarHeader({ currentDate, onNavigateMonth, onToday }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Chat Calendar</h1>
        <p className="text-muted-foreground">
          View your conversations organized by date
        </p>
      </div>
    </div>
  );
}