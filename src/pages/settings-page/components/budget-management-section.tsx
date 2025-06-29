import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface BudgetManagementSectionProps {
  formSettings: any;
  onFormSettingsChange: (updates: any) => void;
  onSave: () => void;
}

export function BudgetManagementSection({ 
  formSettings, 
  onFormSettingsChange, 
  onSave 
}: BudgetManagementSectionProps) {
  return (
    <Card className="card p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Budget Management</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="budget-24h">24h Budget</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="budget-24h"
                type="number"
                step="0.01"
                min="0"
                value={formSettings.budget_max_24h}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('💰 Budget changed to:', value);
                  onFormSettingsChange({ budget_max_24h: value });
                }}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum spend per 24 hours
            </p>
          </div>

          <div>
            <Label htmlFor="input-token-cost">Input Cost/Token</Label>
            <Input
              id="input-token-cost"
              type="number"
              step="0.000001"
              min="0"
              value={formSettings.budget_input_token_cost}
              onChange={(e) => onFormSettingsChange({ 
                budget_input_token_cost: parseFloat(e.target.value) || 0 
              })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="output-token-cost">Output Cost/Token</Label>
            <Input
              id="output-token-cost"
              type="number"
              step="0.000001"
              min="0"
              value={formSettings.budget_output_token_cost}
              onChange={(e) => onFormSettingsChange({ 
                budget_output_token_cost: parseFloat(e.target.value) || 0 
              })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Budget
          </Button>
        </div>
      </div>
    </Card>
  );
}