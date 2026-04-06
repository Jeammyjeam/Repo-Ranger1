'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Repository } from '@/lib/types';
import { Star, Calendar, GitFork, Code, Bookmark, DownloadCloud, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { saveRepo, unsaveRepo, archiveRepo, unarchiveRepo, getRepoStatus } from '@/lib/firestore';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { TimeAgo } from './time-ago';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface RepoCardProps {
  repo: Repository;
  rank?: number;
}

export function RepoCard({ repo, rank }: RepoCardProps) {
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

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !db || isArchiveLoading) return toast({ variant: 'destructive', title: "Please log in to save repositories." });
    if (isSaveLoading) return;

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
      toast({ variant: 'destructive', title: 'Error', description: error.message });
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
            <CardTitle className="text-xl font-headline tracking-tight">
              <Link href={`/repo/${repo.owner.login}/${repo.name}`} className="hover:underline">{repo.name}</Link>
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
          {isStatusLoading ? (
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
      </CardFooter>
    </Card>
  );
}
