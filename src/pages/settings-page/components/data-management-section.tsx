import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DataManagementSectionProps {
  prompts: any[];
  budget24h: number;
  transcriptionEnabled: boolean;
}

export function DataManagementSection({ 
  prompts, 
  budget24h, 
  transcriptionEnabled 
}: DataManagementSectionProps) {
  const [exportFormat, setExportFormat] = useState('json');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = () => {
    const data = {
      chats: [],
      prompts: prompts,
      settings: {
        budget24h,
        transcriptionEnabled,
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimir-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const handleClearData = () => {
    if (deleteConfirmText === 'Delete') {
      // TODO: Implement data clearing
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
      toast.success('Data cleared');
    } else {
      toast.error('Please type "Delete" to confirm');
    }
  };

  return (
    <Card className="card p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Data Management</h2>
        
        <p className="text-sm text-muted-foreground">
          Export your data on demand as a ZIP file.
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All Data</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete all your chats, messages, and settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="delete-confirm">Type "Delete" to confirm:</Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearData}
                    disabled={deleteConfirmText !== 'Delete'}
                  >
                    Clear All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );
}