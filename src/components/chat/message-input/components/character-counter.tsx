import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
  showThreshold?: number;
}

export function CharacterCounter({ 
  currentLength, 
  maxLength, 
  showThreshold = 0.8 
}: CharacterCounterProps) {
  const charactersLeft = maxLength - currentLength;
  const isOverLimit = currentLength > maxLength;
  const shouldShow = charactersLeft <= maxLength * showThreshold;

  if (!shouldShow) return null;

  return (
    <div className={cn(
      "absolute top-2 right-2 text-xs px-2 py-1 rounded-full z-10",
      isOverLimit 
        ? "bg-destructive text-destructive-foreground" 
        : charactersLeft <= 100 
          ? "bg-orange-500 text-white" 
          : "bg-muted text-muted-foreground"
    )}>
      {charactersLeft < 0 ? `${Math.abs(charactersLeft)} over` : charactersLeft}
    </div>
  );
}