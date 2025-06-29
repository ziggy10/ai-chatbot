import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { CalendarHeader } from './calendar-page/components/calendar-header';
import { CalendarGrid } from './calendar-page/components/calendar-grid';
import { CalendarStats } from './calendar-page/components/calendar-stats';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { chats } = useAppStore();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-full p-6">
      <div className="max-w-7xl mx-auto">
        <CalendarHeader 
          currentDate={currentDate}
          onNavigateMonth={navigateMonth}
          onToday={handleToday}
        />

        <CalendarGrid 
          currentDate={currentDate}
          chats={chats}
          onNavigateMonth={navigateMonth}
          onToday={handleToday}
        />

        <CalendarStats chats={chats} />
      </div>
    </div>
  );
}