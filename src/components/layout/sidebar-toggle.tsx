import { Button } from '@/components/ui/button';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  isCompact?: boolean;
}

export function SidebarToggle({ isCompact = false }: SidebarToggleProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  return (
    <div className={cn(
      "fixed top-4 left-4 z-50 transition-all duration-700 ease-out",
      isCompact ? "top-3" : "top-4"
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8"
            >
              {sidebarCollapsed ? (
                <PanelRightOpen className="h-4 w-4" strokeWidth={1.25} />
              ) : (
                <PanelRightClose className="h-4 w-4" strokeWidth={1.25} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            {sidebarCollapsed ? 'Open Sidebar' : 'Close Sidebar'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}