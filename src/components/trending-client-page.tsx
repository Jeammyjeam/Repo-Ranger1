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
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Filter } from "lucide-react"

const languages = [
  'JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'C++', 'PHP', 'Go', 'Rust',
  'HTML', 'CSS', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'Elixir', 'Clojure',
  'Haskell', 'Lua', 'Perl', 'R', 'Julia', 'MATLAB', 'Shell', 'PowerShell', 'Dockerfile'
];


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
    { value: 'updated-desc', label: 'Recently Updated' },
    { value: 'created-desc', label: 'Recently Created' },
  ];
  
  return (
    <div>
        <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <Badge variant="secondary" className="text-sm">
                    Live Data
                </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                Trending Repositories
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mt-2">
                Discover the most active and popular repositories on GitHub right now.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated in real-time</span>
                </div>
                <div className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Advanced filtering</span>
                </div>
            </div>
        </div>
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Time Period</label>
            <Tabs value={period} onValueChange={handlePeriodChange} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily" disabled={isPending} className="text-xs">Today</TabsTrigger>
                    <TabsTrigger value="weekly" disabled={isPending} className="text-xs">This Week</TabsTrigger>
                    <TabsTrigger value="monthly" disabled={isPending} className="text-xs">This Month</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <div className="flex-grow" />
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Language</label>
                <Select onValueChange={handleLanguageChange} value={language} disabled={isPending}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(lang => (
                        <SelectItem key={lang} value={lang.toLowerCase()}>{lang}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Sort by</label>
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
    </div>
  );
}
