'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { Header } from '@/components/header';
import { RepoCardSkeleton } from '@/components/repo-card-skeleton';
import { TrendingClientPage } from '@/components/trending-client-page';
import { TrendingContent } from '@/components/trending-content';

export default function TrendingPage() {
  const searchParams = useSearchParams();

  // Read search params here
  const period = searchParams.get('period') || 'weekly';
  const language = searchParams.get('language') || undefined;
  const sort = searchParams.get('sort') || 'stars';
  const direction = searchParams.get('direction') === 'asc' ? 'asc' : 'desc';
  
  return (
    <AuthGuard>
        <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
            <div className="container py-8">
            <TrendingClientPage />
            <div className="mt-8">
                <Suspense fallback={<RepoCardSkeleton count={12} />}>
                    <TrendingContent
                      key={`${period}-${language || 'all'}-${sort}-${direction}`}
                      period={period as any}
                      language={language}
                      sort={sort}
                      direction={direction}
                    />
                </Suspense>
            </div>
            </div>
        </main>
        </div>
    </AuthGuard>
  );
}
