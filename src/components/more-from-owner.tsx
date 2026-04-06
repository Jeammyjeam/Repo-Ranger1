
'use server';

import Link from 'next/link';
import { getUserRepositories } from '@/lib/github';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Star, GitFork } from 'lucide-react';
import type { Repository } from '@/lib/types';
import { Button } from './ui/button';

export async function MoreFromOwner({ owner, currentRepoName }: { owner: string; currentRepoName: string }) {
  try {
    const allRepos = await getUserRepositories(owner);
    const otherRepos = allRepos.filter(repo => repo.name !== currentRepoName).slice(0, 5);

    if (otherRepos.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>More from {owner}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {otherRepos.map((repo: Repository) => (
              <li key={repo.id}>
                <Link href={`/repo/${repo.full_name}`} className="group">
                  <p className="font-semibold group-hover:underline">{repo.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{repo.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                     <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{repo.stargazers_count.toLocaleString()}</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        <span>{repo.forks_count.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
            <Button asChild variant="secondary" className="w-full">
                <Link href={`/profile/${owner}`}>
                    View all repositories from {owner}
                </Link>
            </Button>
        </CardFooter>
      </Card>
    );
  } catch (error) {
    return null; // Fail gracefully
  }
}
