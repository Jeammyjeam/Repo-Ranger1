'use client';

import { useUser, useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { DashboardCard } from '@/components/dashboard-card';
import { Library, Package, Bot, LogOut, Settings, Bookmark } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { AuthGuard } from '@/components/auth-guard';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


export default function ProfilePage() {
    const { user } = useUser();
    const auth = useAuth();
    const db = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    // Saved Repos stat
    const savedReposQuery = useMemoFirebase(() => {
        if (!db || !user) return null;
        return collection(db, 'users', user.uid, 'saved_repos');
    }, [db, user]);
    const { data: savedRepos, isLoading: isSavedLoading } = useCollection(savedReposQuery);

    // Archives stat
    const archivesQuery = useMemoFirebase(() => {
        if (!db || !user) return null;
        return collection(db, 'users', user.uid, 'archived_repos');
    }, [db, user]);
    const { data: archives, isLoading: isArchivesLoading } = useCollection(archivesQuery);

    // Conversations stat
    const conversationsQuery = useMemoFirebase(() => {
        if (!db || !user) return null;
        return query(collection(db, 'users', user.uid, 'conversations'), orderBy('updatedAt', 'desc'));
    }, [db, user]);
    const { data: conversations, isLoading: isConversationsLoading } = useCollection(conversationsQuery);
    
    const handleSignOut = async () => {
        try {
            await auth.signOut();
            router.refresh();
            router.push('/');
            toast({ title: 'Logged out successfully.' });
        } catch (error) {
            console.error("Error signing out:", error);
            toast({ variant: 'destructive', title: 'Logout Failed', description: 'An error occurred while logging out.' });
        }
    };
    
    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container max-w-4xl py-12">
                        <div className="flex items-center gap-6 mb-10">
                            <Avatar className="h-24 w-24 border">
                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                                <AvatarFallback className="text-3xl">{user?.displayName?.slice(0, 2) || user?.email?.slice(0, 2) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                                    {user?.displayName || 'Anonymous User'}
                                </h1>
                                <p className="text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <DashboardCard 
                                href="/collections"
                                icon={<Bookmark />}
                                title="Saved Repos"
                                description="Your list of saved repositories."
                                stat={savedRepos?.length ?? 0}
                                isStatLoading={isSavedLoading}
                            />
                            <DashboardCard 
                                href="/archives"
                                icon={<Package />}
                                title="Archived Repos"
                                description="A read-only copy of repositories."
                                stat={archives?.length ?? 0}
                                isStatLoading={isArchivesLoading}
                            />
                            <DashboardCard 
                                href="/chat"
                                icon={<Bot />}
                                title="AI Chat"
                                description="Ask questions and get help."
                                stat={conversations?.length ?? 0}
                                isStatLoading={isConversationsLoading}
                            />
                            <DashboardCard 
                                href="/settings"
                                icon={<Settings />}
                                title="Settings"
                                description="Manage your account."
                            />
                        </div>

                        <div className="mt-12 border-t pt-6 flex justify-end">
                            <Button variant="outline" onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </div>

                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
