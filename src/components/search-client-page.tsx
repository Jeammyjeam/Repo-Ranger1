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

const starsRangeOptions = [
  { value: 'all', label: 'Any Stars' },
  { value: '>10', label: '>10 stars' },
  { value: '>100', label: '>100 stars' },
  { value: '>1000', label: '>1K stars' },
  { value: '>10000', label: '>10K stars' },
  { value: '100..1000', label: '100-1K stars' },
  { value: '1000..10000', label: '1K-10K stars' },
];

const licenseOptions = [
  { value: 'all', label: 'Any License' },
  { value: 'mit', label: 'MIT' },
  { value: 'apache-2.0', label: 'Apache 2.0' },
  { value: 'gpl-3.0', label: 'GPL 3.0' },
  { value: 'bsd-3-clause', label: 'BSD 3-Clause' },
  { value: 'isc', label: 'ISC' },
  { value: 'unlicense', label: 'Unlicense' },
];

const updatedAfterOptions = [
  { value: 'all', label: 'Any Time' },
  { value: '2024-01-01', label: 'This Year' },
  { value: '2023-01-01', label: 'Last Year' },
  { value: '2022-01-01', label: '2 Years Ago' },
  { value: '2020-01-01', label: '4 Years Ago' },
  { value: '2019-01-01', label: '5+ Years Ago' },
];

export function SearchClientPage({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize state from URL params
  const [sort, setSort] = useState(() => `${searchParams.get('sort') || 'stars'}-${searchParams.get('direction') || 'desc'}`);
  const [language, setLanguage] = useState(() => searchParams.get('language') || 'all');
  const [starsRange, setStarsRange] = useState(() => searchParams.get('stars') || 'all');
  const [license, setLicense] = useState(() => searchParams.get('license') || 'all');
  const [updatedAfter, setUpdatedAfter] = useState(() => searchParams.get('updated') || 'all');

  // Effect to sync state with URL if it changes (e.g., back/forward buttons)
  useEffect(() => {
    setSort(`${searchParams.get('sort') || 'stars'}-${searchParams.get('direction') || 'desc'}`);
    setLanguage(searchParams.get('language') || 'all');
    setStarsRange(searchParams.get('stars') || 'all');
    setLicense(searchParams.get('license') || 'all');
    setUpdatedAfter(searchParams.get('updated') || 'all');
  }, [searchParams]);

  const handleSearch = useCallback((query: string) => {
    const newParams = new URLSearchParams();
    newParams.set('q', query);
    // Reset filters for new search
    setSort('stars-desc');
    setLanguage('all');
    setStarsRange('all');
    setLicense('all');
    setUpdatedAfter('all');
    startTransition(() => {
      router.push(`/search?${newParams.toString()}`);
    });
  }, [router]);
  
  const handleFilterChange = useCallback((key: 'sort' | 'language' | 'stars' | 'license' | 'updated', value: string) => {
    // Update local state for immediate UI feedback
    if (key === 'sort') {
      setSort(value);
    } else if (key === 'language') {
      setLanguage(value);
    } else if (key === 'stars') {
      setStarsRange(value);
    } else if (key === 'license') {
      setLicense(value);
    } else if (key === 'updated') {
      setUpdatedAfter(value);
    }

    startTransition(() => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (key === 'sort') {
          const [sortKey, direction] = value.split('-');
          newParams.set('sort', sortKey);
          newParams.set('direction', direction);
        } else if (key === 'language') {
          if (value === 'all') {
            newParams.delete('language');
          } else {
            newParams.set('language', value);
          }
        } else if (key === 'stars') {
          if (value === 'all') {
            newParams.delete('stars');
          } else {
            newParams.set('stars', value);
          }
        } else if (key === 'license') {
          if (value === 'all') {
            newParams.delete('license');
          } else {
            newParams.set('license', value);
          }
        } else if (key === 'updated') {
          if (value === 'all') {
            newParams.delete('updated');
          } else {
            newParams.set('updated', value);
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

                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Label>Stars:</Label>
                    <Select onValueChange={(value) => handleFilterChange('stars', value)} value={starsRange} disabled={isPending}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by stars" />
                        </SelectTrigger>
                        <SelectContent>
                            {starsRangeOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Label>License:</Label>
                    <Select onValueChange={(value) => handleFilterChange('license', value)} value={license} disabled={isPending}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by license" />
                        </SelectTrigger>
                        <SelectContent>
                            {licenseOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Label>Updated:</Label>
                    <Select onValueChange={(value) => handleFilterChange('updated', value)} value={updatedAfter} disabled={isPending}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by update date" />
                        </SelectTrigger>
                        <SelectContent>
                            {updatedAfterOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
        </div>
      </div>
    </div>
  );
}
