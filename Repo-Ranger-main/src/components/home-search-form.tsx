'use client';

import { useRouter } from 'next/navigation';
import { SearchForm } from './search-form';

export function HomeSearchForm() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    // Redirect to the main search page.
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return <SearchForm onSearch={handleSearch} placeholder="Search for repos, models, and more..." />;
}
