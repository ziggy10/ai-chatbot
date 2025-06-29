import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { type Message } from '@/stores/app-store';

interface RawResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message;
}

export function RawResponseDialog({ open, onOpenChange, message }: RawResponseDialogProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Thread ID {message.chat_id} | Message {message.id} Raw JSON</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {new Date(message.created_at).toLocaleString()} &middot; {new Date(message.created_at).toLocaleString()} &middot; {message.chat_id}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Request:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify({ message: message.content, model: message.model }, null, 2))}
              >
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
              <code>{JSON.stringify({ message: message.content, model: message.model }, null, 2)}</code>
            </pre>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Response:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(message.raw_output || {}, null, 2))}
              >
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
              <code>{JSON.stringify(message.raw_output || {}, null, 2)}</code>
            </pre>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}