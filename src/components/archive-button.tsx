'use client';

import { useState, useEffect } from 'react';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import type { Repository } from '@/lib/types';
import { Button, ButtonProps } from '@/components/ui/button';
import { AuthDialog } from './auth-dialog';
import { archiveRepo, unarchiveRepo, getRepoStatus } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

interface ArchiveButtonProps extends ButtonProps {
  repo: Repository;
  children?: React.ReactNode;
}

export function ArchiveButton({ repo, children, ...props }: ArchiveButtonProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  
  const [isArchived, setIsArchived] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  
  // Get initial status from Firestore
  useEffect(() => {
    if (!user || !db) {
      setIsStatusLoading(false);
      return;
    }
    setIsStatusLoading(true);
    getRepoStatus(db, user.uid, repo.id).then(status => {
      setIsArchived(status.isArchived);
      setIsStatusLoading(false);
    }).catch(() => setIsStatusLoading(false));
  }, [user, db, repo.id]);


  const handleArchiveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
        setIsAuthDialogOpen(true);
        return;
    }
    if (isArchiveLoading) return;
    
    setIsArchiveLoading(true);
    try {
      if (isArchived) {
        await unarchiveRepo(db, user.uid, repo.id);
        setIsArchived(false);
        toast({ title: "Removed from archives" });
      } else {
        await archiveRepo(db, user.uid, repo);
        setIsArchived(true);
        toast({ title: "Repository archived!" });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error archiving', description: error.message });
    } finally {
      setIsArchiveLoading(false);
    }
  };

  const Icon = DownloadCloud;
  const buttonContent = children || (
    <>
      <Icon />
      {isArchived ? 'Archived' : 'Archive'}
    </>
  );

  if (isStatusLoading) {
      return (
          <Button variant="outline" className="w-full" disabled {...props}>
              <Loader2 className="animate-spin" />
          </Button>
      );
  }

  return (
    <>
      <Button 
        variant={isArchived ? "secondary" : "outline"}
        onClick={handleArchiveToggle}
        disabled={isArchiveLoading}
        {...props}
      >
        {isArchiveLoading ? <Loader2 className="animate-spin" /> : buttonContent}
      </Button>

      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}
