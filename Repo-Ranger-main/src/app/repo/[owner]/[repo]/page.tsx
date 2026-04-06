
'use server';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

import { getRepositoryDetails, getRepositoryReadme, getUserProfile } from '@/lib/github';
import { getCategorizedApp } from '@/lib/ai';
import { Header } from '@/components/header';
import { InstallationGuide } from '@/components/installation-guide';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertTriangle, Code, ExternalLink, BookUser } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { RepoActions } from '@/components/repo-actions';
import { RepoStats } from '@/components/repo-stats';
import { Contributors } from '@/components/contributors';
import { RecentCommits } from '@/components/recent-commits';
import { MoreFromOwner } from '@/components/more-from-owner';
import { ChatAboutRepo } from '@/components/chat-about-repo';

const ReadmeDisplay = dynamic(() => import('@/components/readme-display').then(mod => mod.ReadmeDisplay), {
    loading: () => <Skeleton className="h-[400px] w-full rounded-md" />,
});

interface RepoPageProps {
  params: {
    owner: string;
    repo: string;
  };
}

export async function generateMetadata({ params }: RepoPageProps): Promise<Metadata> {
    const { owner, repo } = params;
    try {
        const repoDetails = await getRepositoryDetails(owner, repo);
        return {
          title: `${repoDetails.full_name} - Repo Ranger`,
          description: repoDetails.description || 'A repository on Repo Ranger.',
        };
    } catch (error) {
        return {
            title: 'Repository Not Found - Repo Ranger'
        }
    }
}

function InstallationGuideSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
}

export default async function RepoPage({ params }: RepoPageProps) {
  const { owner, repo: repoName } = params;

  try {
    const [repoDetails, ownerProfile] = await Promise.all([
        getRepositoryDetails(owner, repoName),
        getUserProfile(owner)
    ]);
    const readmeData = await getRepositoryReadme(owner, repoName).catch(() => null);
    const readmeContent = readmeData ? Buffer.from(readmeData.content, 'base64').toString('utf8') : 'No README found.';

    let categories: string[] = [];
    if (process.env.GEMINI_API_KEY && repoDetails.description) {
        try {
            const categoryData = await getCategorizedApp({ name: repoDetails.name, description: repoDetails.description });
            categories = categoryData.categories;
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    }
    
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/search">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Search
                </Link>
            </Button>
            
            {repoDetails.archived && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Archived Repository</AlertTitle>
                    <AlertDescription>This repository is archived and is no longer actively maintained.</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center gap-3 flex-wrap">
                    <Link href={`/profile/${ownerProfile.login}`} className="flex items-center gap-3 hover:underline">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={ownerProfile.avatar_url} alt={ownerProfile.login} />
                            <AvatarFallback>{ownerProfile.login.slice(0,2)}</AvatarFallback>
                        </Avatar>
                        <span>{ownerProfile.login}</span>
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="break-all">{repoDetails.name}</span>
                </h1>

                <div className="space-y-2 md:pl-14">
                    <p className="text-muted-foreground md:text-xl">{repoDetails.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground">
                        {repoDetails.language && (
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                <span>{repoDetails.language}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <BookUser className="h-4 w-4" />
                            <span>{ownerProfile.public_repos.toLocaleString()} repositories</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        {categories.length > 0 && (
                            categories.slice(0, 3).map((category) => (
                                <Badge key={category} variant="secondary" className="font-normal">{category}</Badge>
                            ))
                        )}
                        {repoDetails.topics && repoDetails.topics.map(topic => (
                            <Link key={topic} href={`/search?tab=github&q=${encodeURIComponent(`topic:${topic}`)}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">{topic}</Badge>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>


            <div className="mt-6">
                <RepoActions repo={repoDetails} />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="readme" className="border-b-0">
                            <AccordionTrigger className="px-6">
                               <CardTitle>README.md</CardTitle>
                            </AccordionTrigger>
                            <AccordionContent className="px-6">
                                <ReadmeDisplay content={readmeContent} />
                                <div className="text-right mt-2">
                                    <Button asChild variant="link">
                                        <a href={repoDetails.html_url + '/blob/master/README.md'} target="_blank" rel="noopener noreferrer">
                                            View on GitHub <ExternalLink className="ml-2" />
                                        </a>
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>

                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                    <RecentCommits owner={owner} repo={repoName} />
                </Suspense>

                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                    <Contributors owner={owner} repo={repoName} />
                </Suspense>
              </div>
              <div className="space-y-8 lg:col-span-1">
                 <RepoStats repo={repoDetails} />
                 <Suspense fallback={<InstallationGuideSkeleton/>}>
                    <InstallationGuide owner={owner} repo={repoName} readmeContent={readmeContent} />
                 </Suspense>
                 {process.env.GEMINI_API_KEY && (
                    <ChatAboutRepo repoFullName={repoDetails.full_name} readmeContent={readmeContent} />
                 )}
                 <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                    <MoreFromOwner owner={owner} currentRepoName={repoName} />
                 </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    // If the repo is not found, trigger the global not-found page.
    if (error instanceof Error && error.message.includes('404')) {
        notFound();
    }
    
    // For other errors, we can re-throw to be caught by an error boundary.
    // For now, we'll show a generic error message within the page layout.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred. Please try again later.';
    
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <div className="container flex h-full flex-col items-center justify-center text-center py-16">
                    <AlertTriangle className="h-16 w-16 text-destructive" />
                    <h1 className="mt-4 text-3xl font-bold">Error Loading Repository</h1>
                    <p className="mt-2 text-muted-foreground max-w-xl">{errorMessage}</p>
                    <Button asChild className="mt-6">
                        <Link href="/search">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Search
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
  }
}
