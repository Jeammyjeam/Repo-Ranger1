'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { RepoCard } from './repo-card';
import { RepoCardSkeleton } from './repo-card-skeleton';
import { AlertTriangle } from 'lucide-react';
import type { Repository } from '@/lib/types';

export function SavedReposList({ userId }: { userId: string }) {
    const db = useFirestore();

    const savedReposQuery = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return query(collection(db, 'users', userId, 'saved_repos'), orderBy('savedAt', 'desc'));
    }, [db, userId]);

    const { data: savedRepos, isLoading, error } = useCollection(savedReposQuery);

    if (isLoading) {
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <RepoCardSkeleton count={6} />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-destructive flex flex-col items-center justify-center text-center border border-destructive/50 bg-destructive/10 rounded-lg p-8">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <h3 className="font-semibold">Error Loading Saved Repositories</h3>
                <p className="text-sm">There was a problem fetching your data.</p>
            </div>
        )
    }

    if (!savedRepos || savedRepos.length === 0) {
        return <p className="text-center text-muted-foreground pt-8">You haven't saved any repositories yet.</p>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRepos.map(repo => (
                <RepoCard key={repo.id} repo={repo as Repository} />
            ))}
        </div>
    );
}
