import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

interface TranscriptionSectionProps {
  formSettings: any;
  onFormSettingsChange: (updates: any) => void;
  onSave: () => void;
}

export function TranscriptionSection({ 
  formSettings, 
  onFormSettingsChange, 
  onSave 
}: TranscriptionSectionProps) {
  return (
    <Card className="card p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Voice Transcription</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="transcription-enabled">Enable Transcription</Label>
              <p className="text-sm text-muted-foreground">
                Allow voice recording and convert speech to text
              </p>
            </div>
            <Switch
              id="transcription-enabled"
              checked={formSettings.utility_transcription_enabled}
              onCheckedChange={(checked) => onFormSettingsChange({ 
                utility_transcription_enabled: checked 
              })}
            />
          </div>

          {formSettings.utility_transcription_enabled && (
            <>
              <div>
                <Label>Transcription Provider</Label>
                <Select 
                  value={formSettings.utility_transcription_provider} 
                  onValueChange={(value: 'openai' | 'huggingface') => 
                    onFormSettingsChange({ utility_transcription_provider: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI Whisper</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transcription-model">Transcription Model</Label>
                <Input
                  id="transcription-model"
                  value={formSettings.utility_transcription_model}
                  onChange={(e) => onFormSettingsChange({ 
                    utility_transcription_model: e.target.value 
                  })}
                  className="mt-1"
                  placeholder="e.g., whisper-1"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Transcription
          </Button>
        </div>
      </div>
    </Card>
  );
}