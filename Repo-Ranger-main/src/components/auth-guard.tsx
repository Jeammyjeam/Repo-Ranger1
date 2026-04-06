'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isUserLoading && !user) {
      const fullPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      // Redirect to login and save the attempted URL
      router.push(`/login?redirect=${encodeURIComponent(fullPath)}`);
    }
  }, [user, isUserLoading, router, pathname, searchParams]);

  // Show a loading state while checking auth to prevent flashing protected content
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-4">
            <div className="space-y-4">
                <p className="text-muted-foreground">Verifying authentication...</p>
                <div className="opacity-50 space-y-4">
                    <Skeleton className="h-32 w-full max-w-lg rounded-lg" />
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                </div>
            </div>
        </main>
      </div>
    );
  }

  // If there's no user, the useEffect is handling the redirect.
  // Render null to prevent a flash of protected content while redirecting.
  if (!user) {
    return null;
  }

  // If logged in, render the protected page
  return <>{children}</>;
}
