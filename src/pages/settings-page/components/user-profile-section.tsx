import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface UserProfileSectionProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  onSave: () => void;
}

export function UserProfileSection({ userName, onUserNameChange, onSave }: UserProfileSectionProps) {
  return (
    <Card className="card p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">User Profile</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="user-name">Your Name (Optional)</Label>
            <Input
              id="user-name"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              placeholder="Enter your name for personalized greetings"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used to generate personalized greetings and conversation starters
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}