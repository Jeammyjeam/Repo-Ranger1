'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, Bot, FolderKanban } from 'lucide-react';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { Suspense } from 'react';
import { TrendingContent } from '@/components/trending-content';
import { RepoCardSkeleton } from '@/components/repo-card-skeleton';
import { HomeSearchForm } from '@/components/home-search-form';
import { Skeleton } from '@/components/ui/skeleton';

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Icon className="h-8 w-8 text-primary" />
                </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}

export default function HomePage() {
  const { homeHero } = placeholderImages;
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Redirect logged-in users to the main app
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/search');
    }
  }, [user, isUserLoading, router]);

  // Show a loading skeleton while checking auth status
  if (isUserLoading || user) {
    return (
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container py-24 text-center">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
                <div className="mt-16">
                    <Skeleton className="aspect-video w-full max-w-5xl mx-auto rounded-xl" />
                </div>
            </div>
          </main>
        </div>
    );
  }

  // Render the landing page for logged-out users
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container relative flex flex-col items-center justify-center gap-6 text-center py-24 md:py-32 overflow-hidden">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            Discover GitHub Repos with AI
          </h1>
          <p className="max-w-3xl text-muted-foreground md:text-xl">
            Search 200M+ repositories, get AI-powered recommendations, and save and organize your favorite open-source projects. Your personal App Store for code.
          </p>
          <div className="w-full max-w-2xl mx-auto mt-4">
            <HomeSearchForm />
            <p className="text-xs text-muted-foreground mt-2">
                Sign up to unlock unlimited search, collections, and AI chat.
            </p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto mt-16">
            <div className="aspect-video rounded-xl border-8 border-secondary shadow-2xl">
              <Image
                src={homeHero.src}
                alt={homeHero.alt}
                data-ai-hint={homeHero.hint}
                fill
                className="object-cover rounded-md"
                priority
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10" />
          </div>
        </section>

        <section className="bg-secondary/50 py-24">
            <div className="container">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <FeatureCard icon={Search} title="Advanced Search" description="Find repos by language, stars, topics, and even content within READMEs." />
                    <FeatureCard icon={Bot} title="AI Assistant" description="Ask coding questions, get recommendations, and have code explained." />
                    <FeatureCard icon={FolderKanban} title="Save & Organize" description="Create collections, sync your favorite repos, and never lose track of a great project." />
                </div>
            </div>
        </section>

        <section className="py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                Hot on GitHub Right Now
              </h2>
              <p className="max-w-2xl mx-auto mt-2 text-muted-foreground md:text-lg">
                Check out the projects that are currently capturing the community's attention. A limited preview is shown.
              </p>
            </div>
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><RepoCardSkeleton count={6} /></div>}>
              <TrendingContent period="weekly" sort="stars" direction="desc" limit={6} />
            </Suspense>
             <div className="text-center mt-8">
                <Button asChild>
                    <Link href="/login?redirect=/trending">View More Trending Repos</Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
