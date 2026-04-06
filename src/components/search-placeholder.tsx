
import { TopicBrowser } from './topic-browser';
import { TrendingContent } from './trending-content';
import { RepoCardSkeleton } from './repo-card-skeleton';
import { Suspense } from 'react';
import { Recommendations } from './recommendations';

function GithubDiscovery() {
    return (
        <div className="space-y-12">
            <Recommendations />
             <div>
                <h2 className="text-3xl font-bold text-center mb-2 font-headline">Trending This Week</h2>
                <p className="text-muted-foreground text-center mb-8">See what the community is most excited about right now.</p>
                <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><RepoCardSkeleton count={6} /></div>}>
                    <TrendingContent period="weekly" sort="stars" direction="desc" limit={6} />
                </Suspense>
            </div>
            <TopicBrowser />
        </div>
    )
}


export function SearchPlaceholder() {
  return <GithubDiscovery />;
}
