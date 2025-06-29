import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, RefreshCw, Braces } from 'lucide-react';
import { toast } from 'sonner';

interface MessageActionsProps {
  content: string;
  isUser: boolean;
  model?: string;
  onShowRawResponse: () => void;
  onRegenerate: () => void;
}

export function MessageActions({ 
  content, 
  isUser, 
  model, 
  onShowRawResponse, 
  onRegenerate 
}: MessageActionsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex items-center space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-white/70 hover:text-white transition-colors" 
              onClick={() => copyToClipboard(content)}
            >
              <Copy className="h-[14px] w-[14px] stroke-1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-gray-700">
            <span>Copy Message Content</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {!isUser && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white transition-colors">
                <RefreshCw className="h-[14px] w-[14px] stroke-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="glass">
              <DropdownMenuItem onClick={onRegenerate}>
                {model || 'Unknown Model'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                More...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {model && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-white/70 hover:text-white transition-colors" 
                    onClick={onShowRawResponse}
                  >
                    <Braces className="h-[14px] w-[14px] stroke-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-700">
                  <span>See Raw JSON response</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      )}
    </div>
  );
}