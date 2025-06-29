import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-muted/50 rounded-md p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === 'light' ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-6 w-6',
                theme === 'light' && 'bg-background shadow-sm text-foreground'
              )}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4" strokeWidth={1} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            Light
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === 'dark' ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-6 w-6',
                theme === 'dark' && 'bg-background shadow-sm text-white'
              )}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4" strokeWidth={1} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            Dark
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={theme === 'system' ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-6 w-6',
                theme === 'system' && 'bg-background shadow-sm text-foreground'
              )}
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-4 w-4" strokeWidth={1} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            System
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}