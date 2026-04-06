
import { Suspense } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Header } from '@/components/header';
import { RepoCardSkeleton } from '@/components/repo-card-skeleton';
import { SearchClientPage } from '@/components/search-client-page';
import { SearchPlaceholder } from '@/components/search-placeholder';
import { searchRepositories } from '@/lib/github';
import type { Repository } from '@/lib/types';
import { GithubResultsClient } from '@/components/github-results-client';
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

async function Results({ query, sort, direction, language }: { query: string; sort: 'updated' | 'stars' | 'forks'; direction: 'desc' | 'asc'; language?: string }) {
  
  const showSearchContent = query.trim().length > 0 || language;

  if (!showSearchContent) {
    return <SearchPlaceholder />;
  }

  try {
    const repos: Repository[] = await searchRepositories(query, sort, direction, language);
    if (repos.length === 0) {
      return <p className="text-center text-muted-foreground pt-8">No repositories found for your query.</p>;
    }
    return <GithubResultsClient repos={repos} />;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return <SearchError message={errorMessage} />;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const sort = (typeof searchParams.sort === 'string' ? searchParams.sort : 'stars') as 'updated' | 'stars' | 'forks';
  const direction = (typeof searchParams.direction === 'string' ? searchParams.direction : 'desc') as 'desc' | 'asc';
  const language = typeof searchParams.language === 'string' ? searchParams.language : undefined;
  
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
          <div className="container py-8">
            <SearchClientPage 
                initialQuery={query}
            />
            <div className="mt-8">
              <Suspense fallback={<RepoCardSkeleton count={12} />}>
                <Results
                  query={query}
                  sort={sort}
                  direction={direction}
                  language={language}
                />
              </Suspense>
            </div>
          </div>
      </main>
      </div>
    </AuthGuard>
  );
}
