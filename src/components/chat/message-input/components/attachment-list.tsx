import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ImageIcon, FileText } from 'lucide-react';

interface AttachmentListProps {
  attachments: File[];
  onRemoveAttachment: (index: number) => void;
}

export function AttachmentList({ attachments, onRemoveAttachment }: AttachmentListProps) {
  if (attachments.length === 0) return null;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type === 'application/pdf') return FileText;
    return FileText;
  };

  const truncateFileName = (filename: string) => {
    if (filename.length <= 10) return filename;
    return '...' + filename.slice(-10);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((file, index) => {
        const Icon = getFileIcon(file);
        return (
          <Badge 
            key={index} 
            variant="secondary" 
            className="flex items-center space-x-1 px-2 py-1"
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{truncateFileName(file.name)}</span>
            <button
              type="button"
              onClick={() => onRemoveAttachment(index)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
    </div>
  );
}