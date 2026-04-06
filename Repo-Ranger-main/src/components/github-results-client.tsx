'use client';

import type { Repository } from '@/lib/types';
import { useUser } from '@/firebase';
import { RepoCard } from './repo-card';
import Link from 'next/link';

export function GithubResultsClient({ repos }: { repos: Repository[] }) {
  const { user, isUserLoading } = useUser();

  const reposToShow = !isUserLoading && user ? repos : repos.slice(0, 20);
  const isTruncated = repos.length > 20 && (!user && !isUserLoading);


  return (
    <>
      <div className="mt-8">
        {isTruncated && (
            <div className="text-center p-4 mb-4 border rounded-lg bg-secondary/50">
                <p>Showing the top 20 results. <Link href="/login" className="font-bold underline hover:text-primary">Sign in</Link> to view all results.</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reposToShow.map((repo) => (
            <RepoCard 
              key={repo.id} 
              repo={repo}
            />
          ))}
        </div>
      </div>
    </>
  );
}
