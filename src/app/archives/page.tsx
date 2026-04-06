'use client';
import { useUser } from '@/firebase';
import { Header } from '@/components/header';
import { ArchivesList } from '@/components/archives-list';
import { AuthGuard } from '@/components/auth-guard';

export default function ArchivesPage() {
    const { user } = useUser();

    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                                My Archived Repositories
                            </h1>
                        </div>
                        {/* AuthGuard ensures user is not null here, so we can safely render the list */}
                        {user && <ArchivesList userId={user.uid} />}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
