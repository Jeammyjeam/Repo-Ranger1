'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Repository } from '@/lib/types';
import { Star, Calendar, GitFork, Code, Bookmark, DownloadCloud, Loader2, X, TrendingUp, Trophy, Medal, Award } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { saveRepo, unsaveRepo, archiveRepo, unarchiveRepo, getRepoStatus } from '@/lib/firestore';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { TimeAgo } from './time-ago';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { saveRepoToCollection, migrateSavedReposToDefaultCollection } from '@/lib/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useAnalytics } from '@/firebase/analytics';

interface RepoCardProps {
  repo: Repository;
  rank?: number;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export function RepoCard({ repo, rank, onRemove, showRemoveButton }: RepoCardProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const [isSaved, setIsSaved] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [collectionCount, setCollectionCount] = useState(0);

  // Fetch user's collections
  const collectionsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'collections'), orderBy('createdAt', 'desc'));
  }, [user, db]);

  const { data: userCollections } = useCollection(collectionsQuery);

  useEffect(() => {
    if (!user || !db) {
      setIsStatusLoading(false);
      return;
    }
    setIsStatusLoading(true);
    getRepoStatus(db, user.uid, repo.id).then(status => {
      setIsSaved(status.isSaved);
      setIsArchived(status.isArchived);
      setCollectionCount(status.collectionCount ?? 0);
      setIsStatusLoading(false);
    }).catch(() => setIsStatusLoading(false));
  }, [user, db, repo.id]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !db || isArchiveLoading) return toast({ variant: 'destructive', title: "Please log in to save repositories." });
    if (isSaveLoading) return;

    if (isSaved) {
      setIsSaveLoading(true);
      try {
        await unsaveRepo(db, user.uid, repo.id);
        setIsSaved(false);
        toast({ title: "Removed from saved" });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsSaveLoading(false);
      }
    } else {
      // Show collection selection dialog
      setShowCollectionDialog(true);
    }
  };

  const handleSaveToCollection = async () => {
    if (!user || !db || !selectedCollectionId) return;

    setIsSaveLoading(true);
    try {
      // Migrate old saved repos to collections if needed
      await migrateSavedReposToDefaultCollection(db, user.uid);

      await saveRepoToCollection(db, user.uid, selectedCollectionId, repo);
      setIsSaved(true);
      setShowCollectionDialog(false);
      setSelectedCollectionId('');

      trackEvent('repository_saved', {
        repository_name: repo.name,
        repository_owner: repo.owner.login,
        collection_id: selectedCollectionId,
        save_method: 'collection'
      });

      toast({ title: "Repository saved to collection!" });
    } catch (error) {
      console.error('Error saving repository to collection:', error);
      toast({ variant: 'destructive', title: "Failed to save repository to collection." });
    } finally {
      setIsSaveLoading(false);
    }
  };

   const handleArchiveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !db) return toast({ variant: 'destructive', title: "Please log in to archive repositories." });
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


  return (
    <Card className="relative flex h-full flex-col transition-all duration-200 hover:shadow-md hover:border-primary">
      <CardHeader className="pt-4 pl-6 pr-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-grow pr-8">
            <div className="flex items-center gap-2 mb-2">
              {rank && rank <= 3 && (
                <Badge variant={rank === 1 ? "default" : rank === 2 ? "secondary" : "outline"} className="flex items-center gap-1">
                  {rank === 1 ? <Trophy className="h-3 w-3" /> : rank === 2 ? <Medal className="h-3 w-3" /> : <Award className="h-3 w-3" />}
                  #{rank}
                </Badge>
              )}
              {rank && rank > 3 && (
                <Badge variant="outline" className="text-xs">
                  #{rank}
                </Badge>
              )}
              {rank && <TrendingUp className="h-4 w-4 text-green-500" />}
            </div>
            <CardTitle className="text-xl font-headline tracking-tight">
              <Link
                href={`/repo/${repo.owner.login}/${repo.name}`}
                className="hover:underline"
                onClick={() => trackEvent('repository_view', {
                  repository_name: repo.name,
                  repository_owner: repo.owner.login,
                  repository_stars: repo.stargazers_count,
                  repository_language: repo.language,
                  view_source: 'repo_card'
                })}
              >
                {repo.name}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2 h-[40px] pt-1">{repo.description || 'No description'}</CardDescription>
          </div>
          <Link href={`/profile/${repo.owner.login}`} onClick={(e) => e.stopPropagation()} aria-label={`View profile of ${repo.owner.login}`}>
            <Avatar>
              <AvatarImage src={repo.owner.avatar_url} alt={`${repo.owner.login}'s avatar`} />
              <AvatarFallback>{repo.owner.login.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 pl-12 pr-6">
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {repo.topics.slice(0, 4).map((topic) => (
              <Link key={topic} href={`/search?q=${encodeURIComponent(`topic:${topic}`)}`} aria-label={`Search for topic: ${topic}`} onClick={e => e.stopPropagation()}>
                <Badge variant="secondary" className="font-normal cursor-pointer hover:bg-primary/10">{topic}</Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 pt-4 pl-12 pr-6 pb-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{repo.stargazers_count.toLocaleString()} stars</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            <span>{repo.forks_count.toLocaleString()} forks</span>
          </div>
          {repo.language && (
            <div className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              <span>{repo.language}</span>
            </div>
          )}
          <div className="flex items-center gap-1 col-span-2">
            <Calendar className="h-3 w-3" />
            <span>Updated <TimeAgo dateString={repo.updated_at} /></span>
          </div>
        </div>
        <div className="flex gap-2 w-full pt-3 border-t">
          {showRemoveButton ? (
            <Button variant="destructive" size="sm" className="flex-1" onClick={onRemove}>
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          ) : isStatusLoading ? (
            <Skeleton className="h-9 w-full" />
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
        {isSaved && collectionCount > 0 && (
          <div className="pt-2 text-xs text-muted-foreground">
            Saved in {collectionCount} collection{collectionCount > 1 ? 's' : ''}
          </div>
        )}
      </CardFooter>

      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to Collection</DialogTitle>
            <DialogDescription>
              Choose a collection to save "{repo.name}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Collection</label>
              <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {userCollections?.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveToCollection} disabled={!selectedCollectionId || isSaveLoading}>
              {isSaveLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              Save to Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
