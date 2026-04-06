'use client';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { AuthCard } from './auth-card';


export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  
  const handleSuccess = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-0">
        <AuthCard showTitle={false} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
