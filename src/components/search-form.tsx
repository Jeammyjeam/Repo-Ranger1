'use client';

import { useState, useTransition, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/firebase/analytics';

export function SearchForm({ initialQuery = '', onSearch, placeholder }: { initialQuery?: string, onSearch: (query: string) => void, placeholder?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      trackEvent('search_performed', {
        search_term: query.trim(),
        search_type: 'repository'
      });
      startTransition(() => {
        onSearch(query);
      });
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search GitHub repos..."}
          className="pl-10"
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending || !query.trim()}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        Search
      </Button>
    </form>
  );
}
