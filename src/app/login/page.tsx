'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth-card';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
    const { user, isUserLoading } = useUser();
    const searchParams = useSearchParams();
    const router = useRouter();

    // This effect handles redirecting the user after they have logged in
    // or if they visit the page while already being logged in.
    useEffect(() => {
        if (!isUserLoading && user) {
            let redirectUrl = searchParams.get('redirect') || '/search';
            
            // Prevent infinite loops if redirectUrl somehow points back to login
            if (redirectUrl.startsWith('/login') || redirectUrl.startsWith('/signup')) {
                redirectUrl = '/search';
            }
            
            // Refresh the router cache, then perform a client-side redirect
            router.refresh();
            router.replace(redirectUrl);
        }
    }, [user, isUserLoading, searchParams, router]);

    // Show a skeleton while checking the user's auth status.
    if (isUserLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <Skeleton className="h-[550px] w-full max-w-md" />
                </main>
            </div>
        );
    }

    // If a user is found, a redirect is in progress. Render null to prevent a flash of the form.
    if (user) {
        return null;
    }

    // If we're done loading and there's no user, show the login form.
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                <AuthCard />
            </main>
        </div>
    );
}
