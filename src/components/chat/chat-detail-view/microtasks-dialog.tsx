import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { Clock, Brain, Braces } from 'lucide-react';
import { toast } from 'sonner';

interface MicrotasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  microtasks: any[];
}

export function MicrotasksDialog({ open, onOpenChange, chatId, microtasks }: MicrotasksDialogProps) {
  const [showTaskRawData, setShowTaskRawData] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Associated Data</DialogTitle>
            <div className="text-sm text-muted-foreground">
              ID: {chatId}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {microtasks.length > 0 ? (
              microtasks.map(task => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        task.status === 'done' ? 'default' :
                        task.status === 'failed' ? 'destructive' :
                        task.status === 'running' ? 'secondary' : 'outline'
                      }>
                        {task.status}
                      </Badge>
                      <span className="font-medium">{task.task_type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ${((parseFloat(task.input_tokens || '0') * parseFloat(task.input_token_price || '0')) + 
                         (parseFloat(task.output_tokens || '0') * parseFloat(task.output_token_price || '0'))).toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(task.created_at)}</span>
                      </div>
                      <span>&middot;</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.completed_at ? formatRelativeTime(task.completed_at) : 'Running'}</span>
                      </div>
                      <span>&middot;</span>
                      <div className="flex items-center space-x-1">
                        <Brain className="h-3 w-3" />
                        <span>{task.model}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowTaskRawData(task.id)}
                    >
                      <Braces className="h-3 w-3" />
                    </Button>
                  </div>
                  {task.error_message && (
                    <div className="text-destructive mt-2 text-sm">Error: {task.error_message}</div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No associated data found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Raw Data Dialog */}
      <Dialog open={!!showTaskRawData} onOpenChange={() => setShowTaskRawData(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Task: {showTaskRawData} {microtasks.find(t => t.id === showTaskRawData)?.task_type}</DialogTitle>
            <div className="text-sm text-muted-foreground">
              {microtasks.find(t => t.id === showTaskRawData) && (
                <>
                  {new Date(microtasks.find(t => t.id === showTaskRawData)!.created_at).toLocaleString()} &middot;{' '}
                  {microtasks.find(t => t.id === showTaskRawData)!.updated_at && 
                    new Date(microtasks.find(t => t.id === showTaskRawData)!.updated_at).toLocaleString()
                  } &middot; {chatId}
                </>
              )}
            </div>
          </DialogHeader>
          {showTaskRawData && microtasks.find(t => t.id === showTaskRawData) && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Request:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(microtasks.find(t => t.id === showTaskRawData)!.input_data || {}, null, 2))}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  <code>{JSON.stringify(microtasks.find(t => t.id === showTaskRawData)!.input_data || {}, null, 2)}</code>
                </pre>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Response:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(microtasks.find(t => t.id === showTaskRawData)!.output_data || {}, null, 2))}
                  >
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  <code>{JSON.stringify(microtasks.find(t => t.id === showTaskRawData)!.output_data || {}, null, 2)}</code>
                </pre>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setShowTaskRawData(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}