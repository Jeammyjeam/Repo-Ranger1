import { searchRepositories } from '@/lib/github';
import type { Repository } from '@/lib/types';
import { RepoCard } from './repo-card';
import { AlertCircle } from 'lucide-react';

function SearchError({ message = "There was an error communicating with the API. This might be due to rate limits. Please try again later." }: { message?: string}) {
    return (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold text-destructive">Failed to fetch results</h2>
            <p className="mt-2 text-destructive/80">
                {message}
            </p>
        </div>
    )
}

const getISODate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

export async function TrendingContent({ period, language, sort, direction, limit }: { period: 'daily' | 'weekly' | 'monthly', language?: string, sort: string, direction: string, limit?: number }) {
    try {
        let daysAgo;
        switch (period) {
            case 'daily': daysAgo = 1; break;
            case 'monthly': daysAgo = 30; break;
            case 'weekly':
            default:
                daysAgo = 7;
        }
        const date = getISODate(daysAgo);
        
        // Build the query for trending repos
        const query = `created:>${date} stars:>10`;

        // Use the more powerful searchRepositories function to handle sorting directly
        const repos: Repository[] = await searchRepositories(query, sort as any, direction as any, language);
        
        if (repos.length === 0) return <p className="text-center text-muted-foreground pt-8">No trending repositories found for these criteria.</p>;

        const reposToDisplay = limit ? repos.slice(0, limit) : repos;
        
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {reposToDisplay.map((repo, index) => (
                    <RepoCard key={repo.id} repo={repo} rank={index + 1} />
                ))}
            </div>
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return <SearchError message={errorMessage} />;
    }
}
