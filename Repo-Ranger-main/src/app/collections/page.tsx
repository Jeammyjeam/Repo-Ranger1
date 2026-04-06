'use client';
import { useUser } from '@/firebase';
import { Header } from '@/components/header';
import { SavedReposList } from '@/components/collections-list';
import { AuthGuard } from '@/components/auth-guard';

export default function SavedReposPage() {
    const { user } = useUser();

    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                                My Saved Repositories
                            </h1>
                        </div>
                        {/* AuthGuard ensures user is not null here, so we can safely render the list */}
                        {user && <SavedReposList userId={user.uid} />}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
