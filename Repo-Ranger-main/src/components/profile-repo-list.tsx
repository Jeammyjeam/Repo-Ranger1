
'use client';

import type { Repository } from '@/lib/types';
import { RepoCard } from './repo-card';

export function ProfileRepoList({ repos }: { repos: Repository[] }) {

  if (repos.length === 0) {
      return <p className="text-center text-muted-foreground py-16">This user has no public repositories.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map((repo) => (
        <RepoCard 
            key={repo.id} 
            repo={repo}
        />
        ))}
    </div>
  );
}
