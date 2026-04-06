'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon, Loader2 } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { parseGitHubURL } from '@/lib/url-parser';

export function AddByUrl() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFetch = () => {
    if (!url.trim()) return;

    setIsLoading(true);
    const parseResult = parseGitHubURL(url);

    if (!parseResult.isValid) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid GitHub repository URL.',
      });
      setIsLoading(false);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(url)}&tab=github`);
    
    setIsLoading(false);
    setUrl('');
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        setUrl('');
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0" aria-label="Add by URL">
          <LinkIcon />
          <span className="hidden sm:inline-block sm:ml-2">Add by URL</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Repository by URL</DialogTitle>
          <DialogDescription>
            Paste a GitHub repository URL to fetch it directly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="url">GitHub URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://github.com/owner/repo"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url.trim()) handleFetch();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleFetch} disabled={isLoading || !url.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Fetch Repository
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
