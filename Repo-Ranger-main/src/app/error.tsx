'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You can log the error to an error reporting service here
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold sm:inline-block">Repo Ranger</span>
            </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container flex h-full flex-col items-center justify-center text-center py-16">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Application Error</h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            We're sorry, something went wrong. This has been logged and we're looking into it.
          </p>
          <div className="mt-8 flex gap-4">
            <Button onClick={() => reset()} size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Link>
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 w-full max-w-3xl rounded-md border bg-muted/30 p-4 text-left">
              <h3 className="font-semibold text-destructive">Error Details (Development Mode)</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm font-code text-foreground/80">
                <code>{error.message}</code>
                {error.stack && `\n\nStack Trace:\n${error.stack}`}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
