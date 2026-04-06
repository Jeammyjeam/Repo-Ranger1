'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchForm } from './search-form';
import { AddByUrl } from './add-by-url';
import { BulkImport } from './bulk-import';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from './ui/label';

const githubLanguages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'C++', 'PHP', 'Go', 'Rust', 'HTML', 'CSS', 'Ruby', 'Swift', 'Kotlin'];

export function SearchClientPage({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize state from URL params
  const [sort, setSort] = useState(() => `${searchParams.get('sort') || 'stars'}-${searchParams.get('direction') || 'desc'}`);
  const [language, setLanguage] = useState(() => searchParams.get('language') || 'all');

  // Effect to sync state with URL if it changes (e.g., back/forward buttons)
  useEffect(() => {
    setSort(`${searchParams.get('sort') || 'stars'}-${searchParams.get('direction') || 'desc'}`);
    setLanguage(searchParams.get('language') || 'all');
  }, [searchParams]);

  const handleSearch = useCallback((query: string) => {
    const newParams = new URLSearchParams();
    newParams.set('q', query);
    // Reset filters for new search
    setSort('stars-desc');
    setLanguage('all');
    startTransition(() => {
      router.push(`/search?${newParams.toString()}`);
    });
  }, [router]);
  
  const handleFilterChange = useCallback((key: 'sort' | 'language', value: string) => {
    // Update local state for immediate UI feedback
    if (key === 'sort') {
      setSort(value);
    } else {
      setLanguage(value);
    }

    startTransition(() => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (key === 'sort') {
          const [sortKey, direction] = value.split('-');
          newParams.set('sort', sortKey);
          newParams.set('direction', direction);
        } else { // key === 'language'
          if (value === 'all') {
            newParams.delete('language');
          } else {
            newParams.set('language', value);
          }
        }
        router.push(`/search?${newParams.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  const githubSortOptions = [
    { value: 'stars-desc', label: 'Most Stars' },
    { value: 'forks-desc', label: 'Most Forks' },
    { value: 'updated-desc', label: 'Newest' },
    { value: 'stars-asc', label: 'Fewest Stars' },
    { value: 'updated-asc', label: 'Oldest' },
  ];
  
  const searchPlaceholder = "Search repos or paste GitHub URL...";

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <div className="flex w-full items-start space-x-2">
          <div className="flex-grow">
            <SearchForm 
                initialQuery={initialQuery} 
                onSearch={handleSearch} 
                placeholder={searchPlaceholder}
            />
          </div>
            <>
              <AddByUrl />
              <BulkImport />
            </>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-4 border-t pt-4">
        
        <div className="flex w-full flex-wrap justify-center items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <Label>Sort by:</Label>
                <Select onValueChange={(value) => handleFilterChange('sort', value)} value={sort} disabled={isPending}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {githubSortOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

                 <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Label>Language:</Label>
                    <Select onValueChange={(value) => handleFilterChange('language', value)} value={language} disabled={isPending}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Languages</SelectItem>
                            {githubLanguages.map(opt => (
                                <SelectItem key={opt} value={opt.toLowerCase()}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
        </div>
      </div>
    </div>
  );
}
