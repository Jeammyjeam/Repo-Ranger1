'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomRepository } from '@/lib/discovery';
import { Button } from './ui/button';
import { Shuffle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RandomRepoButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const repo = await getRandomRepository();
            if (repo) {
                router.push(`/repo/${repo.owner}/${repo.repo}`);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Could not find a repository',
                    description: 'Please try again.',
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: 'Failed to fetch a random repository.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleClick} disabled={isLoading} className="flex items-center gap-1 transition-colors text-foreground/60 hover:text-foreground/80">
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Shuffle className="h-4 w-4" />
            )}
            Random
        </Button>
    )
}
