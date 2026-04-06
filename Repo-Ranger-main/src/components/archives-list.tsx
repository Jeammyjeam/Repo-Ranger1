'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { RepoCard } from './repo-card';
import type { Repository } from '@/lib/types';

export function ArchivesList({ userId }: { userId: string }) {
    const db = useFirestore();

    const archivesQuery = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return query(collection(db, 'users', userId, 'archived_repos'), orderBy('archivedAt', 'desc'));
    }, [db, userId]);

    const { data: archives, isLoading, error } = useCollection(archivesQuery);

    if (isLoading) {
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-destructive flex flex-col items-center justify-center text-center border border-destructive/50 bg-destructive/10 rounded-lg p-8">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <h3 className="font-semibold">Error Loading Archives</h3>
                <p className="text-sm">There was a problem fetching your data.</p>
            </div>
        )
    }

    if (!archives || archives.length === 0) {
        return <p className="text-center text-muted-foreground pt-8">You haven't archived any repositories yet.</p>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archives.map(repo => (
                <RepoCard key={repo.id} repo={repo as Repository} />
            ))}
        </div>
    );
}
