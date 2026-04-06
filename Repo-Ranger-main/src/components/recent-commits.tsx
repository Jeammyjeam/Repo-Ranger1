
'use server';

import { getRepositoryCommits } from '@/lib/github';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GitCommit } from 'lucide-react';
import { TimeAgo } from './time-ago';

export async function RecentCommits({ owner, repo }: { owner: string; repo: string }) {
  try {
    const commits = await getRepositoryCommits(owner, repo);
    if (!commits || commits.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit />
            Recent Commits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commits.map(commit => (
            <div key={commit.sha} className="flex items-start gap-4">
              {commit.author ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href={commit.author.html_url} target="_blank" rel="noopener noreferrer">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={commit.author.avatar_url} alt={commit.author.login} />
                          <AvatarFallback>{commit.author.login.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>{commit.author.login}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-grow overflow-hidden">
                <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  <p className="text-sm font-medium leading-snug truncate" title={commit.commit.message}>
                    {commit.commit.message.split('\n')[0]}
                  </p>
                </a>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{commit.commit.author.name}</span> committed <TimeAgo dateString={commit.commit.author.date} />
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  } catch (error) {
    return null; // Fail gracefully
  }
}
