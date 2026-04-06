
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
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Repositories',
  description: 'Search and discover GitHub repositories with advanced filters. Find the perfect open source projects for your needs.',
  keywords: ['GitHub search', 'repositories', 'open source', 'code search', 'developer tools'],
  openGraph: {
    title: 'Search GitHub Repositories | Repo Ranger',
    description: 'Search and discover GitHub repositories with advanced filters. Find the perfect open source projects for your needs.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Search GitHub Repositories | Repo Ranger',
    description: 'Search and discover GitHub repositories with advanced filters.',
  },
};


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

async function Results({ query, sort, direction, language, starsRange, license, updatedAfter }: { query: string; sort: 'updated' | 'stars' | 'forks'; direction: 'desc' | 'asc'; language?: string; starsRange?: string; license?: string; updatedAfter?: string }) {
  
  const showSearchContent = query.trim().length > 0 || language;

  if (!showSearchContent) {
    return <SearchPlaceholder />;
  }

  try {
    const repos: Repository[] = await searchRepositories(query, sort, direction, language, starsRange, license, updatedAfter);
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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  const sort = (typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'stars') as 'updated' | 'stars' | 'forks';
  const direction = (typeof resolvedSearchParams.direction === 'string' ? resolvedSearchParams.direction : 'desc') as 'desc' | 'asc';
  const language = typeof resolvedSearchParams.language === 'string' ? resolvedSearchParams.language : undefined;
  const starsRange = typeof resolvedSearchParams.stars === 'string' ? resolvedSearchParams.stars : undefined;
  const license = typeof resolvedSearchParams.license === 'string' ? resolvedSearchParams.license : undefined;
  const updatedAfter = typeof resolvedSearchParams.updated === 'string' ? resolvedSearchParams.updated : undefined;
  
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
                  starsRange={starsRange}
                  license={license}
                  updatedAfter={updatedAfter}
                />
              </Suspense>
            </div>
          </div>
      </main>
      </div>
    </AuthGuard>
  );
}
