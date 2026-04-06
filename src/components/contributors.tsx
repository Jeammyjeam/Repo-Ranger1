
'use server';

import Link from 'next/link';
import { getRepositoryContributors } from '@/lib/github';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

export async function Contributors({ owner, repo }: { owner: string; repo: string }) {
  try {
    const contributors = await getRepositoryContributors(owner, repo);
    if (!contributors || contributors.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {contributors.map(c => (
            <TooltipProvider key={c.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                    <Avatar>
                      <AvatarImage src={c.avatar_url} alt={c.login} />
                      <AvatarFallback>{c.login.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{c.login}</p>
                  <p className="text-muted-foreground">{c.contributions.toLocaleString()} contributions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </CardContent>
        <CardFooter>
            <Button asChild variant="link" className="w-full">
                <a href={`https://github.com/${owner}/${repo}/graphs/contributors`} target="_blank" rel="noopener noreferrer">
                    View all contributors <ExternalLink className="ml-2" />
                </a>
            </Button>
        </CardFooter>
      </Card>
    );
  } catch (error) {
    return null; // Fail gracefully
  }
}
