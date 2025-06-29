import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { SidebarToggle } from './sidebar-toggle';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

export function Layout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Stars background */}
      <div className="stars">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <SidebarToggle />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main 
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out overflow-hidden',
            sidebarCollapsed ? 'ml-0' : 'ml-80'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}