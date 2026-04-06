import { searchRepositories } from '@/lib/github';
import type { Repository } from '@/lib/types';
import { RepoCard } from './repo-card';
import { AlertCircle, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

function TrendingStats({ repos, period, fetchTime }: { repos: Repository[], period: string, fetchTime?: string }) {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const avgStars = Math.round(totalStars / repos.length);
  const avgForks = Math.round(totalForks / repos.length);

  // Count languages
  const languageCount = repos.reduce((acc, repo) => {
    const lang = repo.language || 'Unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLanguage = Object.entries(languageCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Trending Statistics</h2>
        {fetchTime && (
          <p className="text-sm text-muted-foreground">Last updated: {fetchTime}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Repos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repos.length}</div>
            <p className="text-xs text-muted-foreground">in {period}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Stars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStars.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">per repository</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Forks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgForks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">per repository</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topLanguage?.[0] || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{topLanguage?.[1] || 0} repositories</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const getDateRange = (period: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case 'daily':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'weekly':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'monthly':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
    }

    return {
        start: startDate.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
    };
}

export async function TrendingContent({ period, language, sort, direction, limit }: { period: 'daily' | 'weekly' | 'monthly', language?: string, sort: string, direction: string, limit?: number }) {
    const fetchTime = new Date().toLocaleString();

    try {
        const dateRange = getDateRange(period);

        // Build a more sophisticated trending query
        // Use pushed (last commit) date for recent activity, combined with star growth
        let query = `pushed:>${dateRange.start}`;

        // Add minimum star threshold based on period
        const minStars = period === 'daily' ? 5 : period === 'weekly' ? 10 : 25;
        query += ` stars:>${minStars}`;

        // Add language filter if specified
        if (language && language !== 'all') {
            query += ` language:${language}`;
        }

        // Use the search function to get results
        const repos: Repository[] = await searchRepositories(query, sort as any, direction as any);

        if (repos.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-muted-foreground mb-4 rounded-full bg-muted flex items-center justify-center">
                        📈
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No trending repositories found</h2>
                    <p className="text-muted-foreground">
                        Try adjusting your filters or check back later for new trending content.
                    </p>
                </div>
            );
        }

        const reposToDisplay = limit ? repos.slice(0, limit) : repos.slice(0, 30); // Limit to 30 for performance

        return (
            <>
                <TrendingStats repos={reposToDisplay} period={period} fetchTime={fetchTime} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reposToDisplay.map((repo, index) => (
                        <RepoCard key={repo.id} repo={repo} rank={index + 1} />
                    ))}
                </div>
            </>
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return <SearchError message={errorMessage} />;
    }
}
