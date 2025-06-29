import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CirclePause, CircleStop, CirclePlay, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecorderControlsProps {
  recorderState: 'idle' | 'recording' | 'paused' | 'processing';
  recordingTime: number;
  waveformData: number[];
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
  maxRecordingTime: number;
}

export function RecorderControls({
  recorderState,
  recordingTime,
  waveformData,
  onPause,
  onResume,
  onStop,
  onRetry,
  onDelete,
  maxRecordingTime
}: RecorderControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Animate in when component mounts with staggered animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimatingIn(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced waveform bars with proper height and alignment - reduced width
  const generateWaveformBars = () => {
    const bars = [];
    const barCount = 100; // Reduced from 150 to 100 for smaller width
    
    for (let i = 0; i < barCount; i++) {
      let value;
      if (waveformData.length > 0) {
        const dataIndex = Math.floor((i / barCount) * waveformData.length);
        value = waveformData[dataIndex] || 0;
      } else {
        // Generate realistic waveform pattern when no data
        value = Math.sin(i * 0.15) * 0.4 + 0.6 + Math.random() * 0.4;
        value = Math.max(0.1, Math.min(1, value));
      }
      
      const height = Math.max(8, value * 60); // Min 8px, max 60px for better visibility
      const isActive = recorderState === 'recording';
      
      bars.push(
        <div
          key={i}
          className={cn(
            "bg-primary transition-all duration-150 ease-out flex-shrink-0",
            isActive && "animate-pulse",
            recorderState === 'processing' && "opacity-30"
          )}
          style={{
            width: '3px', // Slightly wider bars
            height: `${height}px`,
            borderRadius: '2px',
            marginRight: '1px',
            animationDelay: `${i * 8}ms`,
            opacity: isActive ? Math.random() * 0.3 + 0.7 : 0.8,
          }}
        />
      );
    }
    
    return bars;
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className={cn(
        "transition-all duration-500 ease-out overflow-hidden",
        isVisible ? "opacity-100 max-h-24" : "opacity-0 max-h-0"
      )}>
        <div className={cn(
          "flex items-center space-x-4 p-4 relative min-h-[80px]",
          recorderState === 'processing' && "pointer-events-none"
        )}>
          {/* Processing overlay with shimmer animation - no pulsating dot */}
          {recorderState === 'processing' && (
            <div className={cn(
              "absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10",
              "transition-all duration-700 ease-out",
              isVisible ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex items-center space-x-2 text-primary">
                <TextShimmer className="text-sm font-medium" duration={1.5}>
                  Transcribing...
                </TextShimmer>
              </div>
            </div>
          )}

          {/* Left controls with staggered animation */}
          <div className={cn(
            "flex items-center space-x-1 transition-all duration-500 ease-out",
            isAnimatingIn ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-2"
          )} style={{ transitionDelay: '700ms' }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full transition-all duration-200 hover:bg-muted/50"
                    )}
                    onClick={recorderState === 'recording' ? onPause : onResume}
                    disabled={recorderState === 'processing'}
                  >
                    {recorderState === 'recording' ? (
                      <CirclePause className="h-4 w-4 text-white" strokeWidth={1} />
                    ) : (
                      <CirclePlay className="h-4 w-4 text-white" strokeWidth={1} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-700">
                  <span>{recorderState === 'recording' ? 'Pause Recording' : 'Resume Recording'}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200"
                    onClick={onStop}
                    disabled={recorderState === 'processing'}
                  >
                    <CircleStop className="h-4 w-4" strokeWidth={1} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-700">
                  <span>Stop & Process Recording</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Timer and status with staggered animation */}
          <div className={cn(
            "flex items-center space-x-2 transition-all duration-500 ease-out",
            isAnimatingIn ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-2"
          )} style={{ transitionDelay: '700ms' }}>
            <span className="text-sm font-mono font-normal">
              {formatTime(recordingTime)}
            </span>
            <span className="text-sm text-muted-foreground">
              {recorderState === 'recording' ? 'Recording...' : 'Paused'}
            </span>
          </div>

          {/* Enhanced waveform visualization - reduced width */}
          <div className={cn(
            "flex-1 flex items-center justify-center px-8 transition-all duration-700 ease-out max-w-[500px]",
            isAnimatingIn ? "opacity-100" : "opacity-0"
          )} style={{ transitionDelay: '400ms' }}>
            <div 
              ref={waveformRef}
              className="flex items-center justify-center h-16 w-full min-w-[300px] max-w-[500px] overflow-hidden"
            >
              <div className="flex items-center justify-center h-full w-full">
                {generateWaveformBars()}
              </div>
            </div>
          </div>

          {/* Right side - delete button with staggered animation */}
          <div className={cn(
            "flex items-center transition-all duration-500 ease-out",
            isAnimatingIn ? "opacity-100 transform translate-x-0" : "opacity-0 transform translate-x-2"
          )} style={{ transitionDelay: '700ms' }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteClick}
                    className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-700">
                  <span>Delete / Cancel</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recording</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recording? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}