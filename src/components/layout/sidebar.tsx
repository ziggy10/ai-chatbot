import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchCommand } from '@/components/search/search-command';
import { CalendarDialog } from '@/components/calendar/calendar-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAppStore } from '@/stores/app-store';
import { 
  Search, 
  Calendar as CalendarIcon, 
  MessageSquare,
  Settings,
  Bookmark,
  Clock,
  Calendar,
  TextCursorInput
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoaderPinwheelIcon } from '@/components/animate-ui/icons/loader-pinwheel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Sidebar() {
  const [showSearch, setShowSearch] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    chats,
    currentChatId,
    setCurrentChatId,
    loadThreads,
  } = useAppStore();

  // Load threads on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadThreads();
      } catch (error) {
        console.error('Error loading threads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadThreads]);

  // Close sidebar when navigating to different pages on mobile/tablet
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, setSidebarCollapsed]);

  const filteredChats = chats.filter(chat => {
    const matchesBookmark = showBookmarkedOnly ? chat.is_bookmarked : true;
    return matchesBookmark;
  });

  // Group chats by time
  const groupChatsByTime = (chats: typeof filteredChats) => {
    const now = new Date();
    const groups: { [key: string]: typeof chats } = {
      Today: [],
      Yesterday: [],
      'Last 7 days': [],
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.updated_at);
      const diffInHours = (now.getTime() - chatDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        groups.Today.push(chat);
      } else if (diffInHours < 48) {
        groups.Yesterday.push(chat);
      } else if (diffInHours < 168) {
        groups['Last 7 days'].push(chat);
      } else {
        const monthYear = chatDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByTime(filteredChats);

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId);
    navigate(`/chat/${chatId}`);
    // Auto-close sidebar on mobile/tablet after navigation
    setSidebarCollapsed(true);
  };

  const handleLogoClick = () => {
    setCurrentChatId(null);
    navigate('/');
    // Auto-close sidebar after navigation
    setSidebarCollapsed(true);
  };

  const handleSettingsClick = () => {
    // Auto-close sidebar after navigation
    setSidebarCollapsed(true);
  };

  const handleBookmarkToggle = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setShowBookmarkedOnly(!showBookmarkedOnly);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 250);
  };

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-80 card border-r border-border/20 z-40">
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="p-4 border-b border-border/20">
            <div className="flex items-center justify-center h-8">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleLogoClick}
                      className="flex items-center space-x-2 transition-all duration-300 group opacity-80 hover:opacity-100"
                    >
                      <LoaderPinwheelIcon 
                        className="h-4 w-4 text-primary transition-all duration-300" 
                        animation="default"
                        animate={true}
                        loop={true}
                        strokeWidth={1}
                      />
                      <span className="text-sm font-bold text-foreground transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                        Mimir
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-gray-700">
                    <div className="text-xs">
                      Created by{' '}
                      <a 
                        href="https://twitter.com/kingsidharth" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        @kingsidharth
                      </a>
                      {' '}for{' '}
                      <a 
                        href="https://outskill.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Outskill
                      </a>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pt-1 pb-2">
            {/* Chat History Header with Actions */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-foreground/80">Chat History</h3>
              
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-primary transition-colors"
                        onClick={() => setShowSearch(true)}
                      >
                        <Search className="h-3 w-3" strokeWidth={1} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-700">
                      Search
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 hover:text-primary transition-colors"
                        onClick={() => setShowCalendarDialog(true)}
                      >
                        <CalendarIcon className="h-3 w-3" strokeWidth={1} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-700">
                      Calendar
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={cn(
                          "h-7 w-7 transition-colors",
                          showBookmarkedOnly 
                            ? "bg-yellow-500/20 text-yellow-600 hover:text-yellow-500" 
                            : "hover:text-yellow-500"
                        )}
                        onClick={handleBookmarkToggle}
                      >
                        <Bookmark className={cn(
                          "h-3 w-3",
                          showBookmarkedOnly && "fill-current"
                        )} strokeWidth={1} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-700">
                      {showBookmarkedOnly ? 'Show All' : 'Show Bookmarked'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="px-4 pt-1 space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((group) => (
                    <div key={group}>
                      <Skeleton className="h-4 w-20 mb-3" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="p-3 rounded-md border">
                            <Skeleton className="h-4 w-full mb-2" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-8" />
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-12" />
                              </div>
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "transition-all duration-500",
                  isTransitioning && "opacity-0 transform translate-y-2"
                )}>
                  {Object.entries(groupedChats).map(([group, groupChats]) => {
                    if (groupChats.length === 0) return null;
                    
                    return (
                      <div key={group} className={cn(
                        "transition-all duration-700 ease-out",
                        !isTransitioning && "animate-in fade-in slide-in-from-bottom-2"
                      )}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                          {group}
                        </h3>
                        <div className="space-y-2">
                          {groupChats.map(chat => (
                            <div
                              key={chat.id}
                              className={cn(
                                'p-3 cursor-pointer transition-all duration-200 hover:shadow-md group relative overflow-hidden rounded-md border',
                                'hover:border-primary/50 transition-colors',
                                chat.id === currentChatId && 'border-primary bg-primary/5'
                              )}
                              onClick={() => handleChatClick(chat.id)}
                            >
                              {/* Shine effect on hover */}
                              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
                              
                              <div className="relative">
                                <h3 className="font-medium text-sm leading-tight mb-2">
                                  {chat.title.length > 50 ? chat.title.slice(0, 50) + '...' : chat.title}
                                </h3>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1 group-hover:text-foreground transition-colors">
                                      <Calendar className="h-2.5 w-2.5" strokeWidth={1} />
                                      <span className="font-medium">{formatRelativeTime(chat.created_at)}</span>
                                    </div>
                                    
                                    <span>&middot;</span>
                                    
                                    <div className="flex items-center space-x-1 group-hover:text-foreground transition-colors">
                                      <MessageSquare className="h-2.5 w-2.5" strokeWidth={1} />
                                      <span className="font-medium">{chat.message_count.toLocaleString()}</span>
                                    </div>
                                    
                                    <span>&middot;</span>
                                    
                                    <div className="flex items-center space-x-1 group-hover:text-foreground transition-colors">
                                      <TextCursorInput className="h-2.5 w-2.5" strokeWidth={1} />
                                      <span className="font-medium">{chat.total_tokens.toLocaleString()}</span>
                                    </div>

                                    {/* Show bookmark icon if bookmarked */}
                                    {chat.is_bookmarked && (
                                      <>
                                        <span>&middot;</span>
                                        <Bookmark className="h-2.5 w-2.5 fill-current text-yellow-500" strokeWidth={1} />
                                      </>
                                    )}
                                  </div>
                                  
                                  <span className="font-medium group-hover:text-foreground transition-colors">
                                    ${chat.total_cost.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLoading && filteredChats.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.25} />
                  <p className="text-muted-foreground">
                    {showBookmarkedOnly ? 'No bookmarked chats' : 'No chats yet'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/20">
            <div className="flex items-center justify-between">
              <Button variant="ghost" className="h-9 flex-1 justify-start mr-2" asChild>
                <Link to="/settings" onClick={handleSettingsClick}>
                  <Settings className="h-4 w-4 mr-2" strokeWidth={1} />
                  Settings
                </Link>
              </Button>
              
              <div className="flex-1 flex justify-end">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Command */}
      <SearchCommand open={showSearch} onOpenChange={setShowSearch} />
      
      {/* Calendar Dialog */}
      <CalendarDialog 
        open={showCalendarDialog} 
        onOpenChange={setShowCalendarDialog}
      />
    </>
  );
}