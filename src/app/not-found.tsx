import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container flex h-full flex-col items-center justify-center text-center py-16">
          <span className="text-6xl font-bold text-primary">404</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Page Not Found</h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or maybe it never existed.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/search">
              <Search className="mr-2 h-5 w-5" />
              Go to Search
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
