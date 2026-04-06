'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, getDocs, query, Firestore } from 'firebase/firestore';
import { searchRepositories } from '@/lib/github';
import type { Repository } from '@/lib/types';
import { RepoCard } from './repo-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RepoCardSkeleton } from './repo-card-skeleton';

export function Recommendations() {
    const { user } = useUser();
    const db = useFirestore();
    const [recommendations, setRecommendations] = useState<Repository[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) {
            setIsLoading(false);
            return;
        };

        const fetchRecommendations = async () => {
            setIsLoading(true);
            let finalRecommendations: Repository[] = [];
            
            try {
                const savedReposRef = collection(db, 'users', user.uid, 'saved_repos');
                const savedReposSnapshot = await getDocs(savedReposRef);
                const savedRepos = savedReposSnapshot.docs.map(doc => doc.data() as Repository);
                const savedRepoIds = new Set(savedRepos.map(repo => repo.id.toString()));

                if (savedRepos.length > 0) {
                    const langCounts: Record<string, number> = {};
                    savedRepos.forEach(repo => {
                        if (repo.language) {
                            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                        }
                    });

                    const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
                    
                    // Try to get recommendations from top 2 languages
                    for (let i = 0; i < Math.min(2, sortedLangs.length); i++) {
                        const topLang = sortedLangs[i][0];
                        const langQuery = `language:${topLang} stars:>100`;
                        const results = await searchRepositories(langQuery, 'stars', 'desc');
                        const newRecs = results.filter(repo => !savedRepoIds.has(repo.id.toString()));
                        finalRecommendations.push(...newRecs);
                        if (finalRecommendations.length >= 3) break;
                    }
                }
                
                // Fallback: If we still don't have enough recommendations, get some general popular ones.
                if (finalRecommendations.length < 3) {
                    const date = new Date();
                    date.setDate(date.getDate() - 7); // last 7 days
                    const fallbackQuery = `created:>${date.toISOString().split('T')[0]} stars:>50`;
                    const fallbackResults = await searchRepositories(fallbackQuery, 'stars', 'desc');
                    const newFallbackRecs = fallbackResults.filter(repo => !savedRepoIds.has(repo.id.toString()));
                    finalRecommendations.push(...newFallbackRecs);
                }

                // Deduplicate and slice
                const uniqueRecs = Array.from(new Map(finalRecommendations.map(repo => [repo.id, repo])).values());
                setRecommendations(uniqueRecs.slice(0, 3));

            } catch(error) {
                console.error("Failed to fetch recommendations:", error);
                setRecommendations([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRecommendations();
    }, [user, db]);

    if (!user) {
        return null; // Don't show for logged-out users
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recommended for You</CardTitle>
                    <CardDescription>Based on your saved repositories.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <RepoCardSkeleton count={3} />
                   </div>
                </CardContent>
            </Card>
        );
    }
    
    // Only render the card if we actually have recommendations to show.
    if (recommendations.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your saved repositories and trending repos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map(repo => (
                        <RepoCard key={repo.id} repo={repo} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
