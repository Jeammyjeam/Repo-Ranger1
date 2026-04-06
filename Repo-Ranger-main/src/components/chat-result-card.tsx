'use client';

import { useState, useEffect } from 'react';
import type { Repository } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Eye, Bookmark, Star, DownloadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { saveRepo, unsaveRepo, archiveRepo, unarchiveRepo, getRepoStatus } from '@/lib/firestore';

export function ChatResultCard({ repo, rank }: { repo: Repository, rank: number }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isSaved, setIsSaved] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setIsStatusLoading(false);
      return;
    }
    setIsStatusLoading(true);
    getRepoStatus(db, user.uid, repo.id).then(status => {
      setIsSaved(status.isSaved);
      setIsArchived(status.isArchived);
      setIsStatusLoading(false);
    }).catch(() => setIsStatusLoading(false));
  }, [user, db, repo.id]);

  const handleSaveToggle = async () => {
    if (!user || !db) {
      toast({ variant: 'destructive', title: "Please log in to save repositories." });
      return;
    }
    if (isSaveLoading || isArchived) return;

    setIsSaveLoading(true);
    try {
      if (isSaved) {
        await unsaveRepo(db, user.uid, repo.id);
        setIsSaved(false);
        toast({ title: "Removed from saved" });
      } else {
        await saveRepo(db, user.uid, repo);
        setIsSaved(true);
        toast({ title: "Repository saved!" });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update saved status.' });
    } finally {
      setIsSaveLoading(false);
    }
  };

   const handleArchiveToggle = async () => {
    if (!user || !db) {
      toast({ variant: 'destructive', title: "Please log in to archive repositories." });
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
      toast({ variant: 'destructive', title: 'Error archiving', description: 'Failed to update archive status.' });
    } finally {
      setIsArchiveLoading(false);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
            <Badge variant="secondary">{rank}</Badge>
        </div>
        <CardTitle className="pt-2">
            <Link href={`/repo/${repo.full_name}`} className="hover:underline" target="_blank">{repo.full_name}</Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{repo.stargazers_count.toLocaleString()} stars</span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch space-y-2">
            <Button asChild variant="default" size="sm" className="w-full">
                <Link href={`/repo/${repo.full_name}`} target="_blank">
                    <Eye /> View Repo
                </Link>
            </Button>
            <div className="flex gap-2">
              {isStatusLoading ? (
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Loader2 className="animate-spin" />
                  </Button>
              ) : user ? (
                <>
                  <Button variant={isSaved ? "default" : "outline"} size="sm" className="flex-1" onClick={handleSaveToggle} disabled={isSaveLoading || isArchived}>
                    {isSaveLoading ? <Loader2 className="animate-spin" /> : <Bookmark />} {isSaved ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant={isArchived ? "secondary" : "outline"} size="sm" className="flex-1" onClick={handleArchiveToggle} disabled={isArchiveLoading}>
                    {isArchiveLoading ? <Loader2 className="animate-spin" /> : <DownloadCloud />} {isArchived ? 'Archived' : 'Archive'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/login">
                      <Bookmark /> Save
                    </Link>
                  </Button>
              )}
            </div>
      </CardFooter>
    </Card>
  );
}
