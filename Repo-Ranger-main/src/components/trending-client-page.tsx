'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const languages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'C++', 'PHP', 'Go', 'Rust'];


export function TrendingClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize state from URL params for instant UI feedback
  const [period, setPeriod] = useState(() => searchParams.get('period') || 'weekly');
  const [language, setLanguage] = useState(() => searchParams.get('language') || 'all');
  const [sort, setSort] = useState(() => `${searchParams.get('sort') || 'stars'}-${searchParams.get('direction') || 'desc'}`);
  
  // Effect to sync state with URL if it changes (e.g., back/forward buttons)
  useEffect(() => {
    setPeriod(searchParams.get('period') || 'weekly');
    setLanguage(searchParams.get('language') || 'all');
    setSort(`${searchParams.get('sort') || 'stars'}-${searchParams.get('direction') || 'desc'}`);
  }, [searchParams]);

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    startTransition(() => {
        const newParams = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === 'all' || value === '') {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        }
        router.push(`/trending?${newParams.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  const handlePeriodChange = useCallback((value: string) => {
    setPeriod(value);
    updateParams({ period: value });
  }, [updateParams]);

  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value);
    updateParams({ language: value });
  }, [updateParams]);

  const handleSortChange = useCallback((value: string) => {
    const [sortKey, direction] = value.split('-');
    setSort(value);
    updateParams({ sort: sortKey, direction });
  }, [updateParams]);

  const sortOptions = [
    { value: 'stars-desc', label: 'Most Stars' },
    { value: 'forks-desc', label: 'Most Forks' },
  ];
  
  return (
    <div>
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                Trending Repositories
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
                See what the GitHub community is most excited about.
            </p>
        </div>
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
        <Tabs value={period} onValueChange={handlePeriodChange} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily" disabled={isPending}>Today</TabsTrigger>
                <TabsTrigger value="weekly" disabled={isPending}>This Week</TabsTrigger>
                <TabsTrigger value="monthly" disabled={isPending}>This Month</TabsTrigger>
            </TabsList>
        </Tabs>
        <div className="flex-grow" />
        <div className="w-full sm:w-auto">
            <Select onValueChange={handleLanguageChange} value={language} disabled={isPending}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map(lang => (
                    <SelectItem key={lang} value={lang.toLowerCase()}>{lang}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Select onValueChange={handleSortChange} value={sort} disabled={isPending}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>
    </div>
  );
}
