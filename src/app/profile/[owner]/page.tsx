
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getUserRepositories, getUserProfile } from '@/lib/github';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, BookUser, Building } from 'lucide-react';
import { ProfileRepoList } from '@/components/profile-repo-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfilePageProps {
  params: Promise<{
    owner: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { owner } = await params;
    try {
        const userProfile = await getUserProfile(owner);
        const displayName = userProfile.name || owner;
        return {
          title: `${displayName}'s Repositories - Repo Ranger`,
          description: userProfile.bio || `Public repositories for ${displayName}.`,
        };
    } catch (error) {
        return {
          title: `Profile for ${owner} - Repo Ranger`,
          description: `Public repositories for the user ${owner}.`,
        }
    }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { owner } = await params;

  try {
    const [userProfile, repos] = await Promise.all([
        getUserProfile(owner),
        getUserRepositories(owner),
    ]);
    
    const ownerAvatarUrl = userProfile.avatar_url;
    const ownerHtmlUrl = userProfile.html_url;
    const displayName = userProfile.name || userProfile.login;


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

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 text-center sm:text-left">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border">
                    <AvatarImage src={ownerAvatarUrl} alt={displayName} />
                    <AvatarFallback>{displayName.slice(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                            {displayName}
                        </h1>
                         {userProfile.type === 'Organization' && (
                            <Badge variant="secondary" className="text-sm">
                                <Building className="mr-1.5 h-4 w-4"/>
                                Organization
                            </Badge>
                        )}
                    </div>
                    
                    <p className="text-muted-foreground mt-1">@{userProfile.login}</p>
                    
                    {userProfile.bio && (
                        <p className="mt-2 max-w-xl text-foreground/80">{userProfile.bio}</p>
                    )}

                    <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <BookUser className="h-4 w-4"/>
                            <span>{userProfile.public_repos.toLocaleString()} repositories</span>
                        </div>
                         <a href={ownerHtmlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground hover:underline">
                           <Github className="h-4 w-4" />
                           <span>View on GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
            
            <ProfileRepoList repos={repos} />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
