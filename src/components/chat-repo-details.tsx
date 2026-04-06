'use client';
import type { DetailedRepository } from '@/lib/types';
import { RepoCard } from './repo-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ReadmeDisplay } from './readme-display';

export function ChatRepoDetails({ repo }: { repo: DetailedRepository }) {
    return (
        <div className="space-y-4">
            <RepoCard repo={repo} />
            {repo.readme && (
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View README</AccordionTrigger>
                        <AccordionContent>
                            <ReadmeDisplay content={repo.readme} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    )
}
