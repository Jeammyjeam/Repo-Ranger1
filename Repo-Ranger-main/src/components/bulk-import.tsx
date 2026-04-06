'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListPlus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { parseGitHubURL } from '@/lib/url-parser';

export function BulkImport() {
  const [open, setOpen] = useState(false);
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleImport = () => {
    if (!urls.trim()) return;
    setIsLoading(true);

    // 1. Split the text area by newlines, commas, or spaces
    const rawInputs = urls.trim().split(/[\n\s,]+/);
    const repoIdentifiers: string[] = [];
    let invalidCount = 0;

    // 2. Extract "owner/repo" from URLs or raw text
    for (const part of rawInputs) {
        if (!part.trim()) continue;
        const parsed = parseGitHubURL(part);
        if (parsed.isValid) {
            repoIdentifiers.push(`${parsed.owner}/${parsed.repo}`);
        } else {
            invalidCount++;
        }
    }
    
    if (repoIdentifiers.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No valid URLs found',
            description: 'Please check your list and try again. Use formats like owner/repo or full GitHub URLs.',
        });
        setIsLoading(false);
        return;
    }

    if (invalidCount > 0) {
        toast({
            title: 'Some entries were invalid',
            description: `${invalidCount} line(s) could not be parsed and were skipped.`,
        });
    }

    // 3. Create a single query and push to the search page
    const bulkQuery = repoIdentifiers.join(' ');
    router.push(`/search?q=${encodeURIComponent(bulkQuery)}`);
    
    // 4. Reset state and close modal
    setIsLoading(false);
    setUrls('');
    setOpen(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        setUrls('');
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0" aria-label="Import List">
          <ListPlus />
          <span className="hidden sm:inline-block sm:ml-2">Import List</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Repositories</DialogTitle>
          <DialogDescription>
            Paste a list of GitHub repository URLs, one per line.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="urls">GitHub URLs</Label>
            <Textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="e.g., https://github.com/owner/repo&#10;owner/repo2"
              className="min-h-[150px] font-code text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isLoading || !urls.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Repositories
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
