'use client';

import { useState, useMemo } from 'react';
import type { Repository } from '@/lib/types';
import { Copy, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface CloneScriptDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    repos: Repository[];
}

type CloneType = 'https' | 'mirror' | 'shallow';

function generateScript(repos: Repository[], cloneType: CloneType): string {
    const date = new Date().toISOString().split('T')[0];
    const repoCount = repos.length;

    const cloneCommands = repos.map(repo => {
        const cloneUrl = repo.html_url + '.git';
        switch(cloneType) {
            case 'mirror':
                return `git clone --mirror ${cloneUrl}`;
            case 'shallow':
                return `git clone --depth=1 ${cloneUrl}`;
            case 'https':
            default:
                return `git clone ${cloneUrl}`;
        }
    }).join('\n');

    return `#!/bin/bash
# Repo Ranger - Generated Clone Script
# Date: ${date}
# Repositories: ${repoCount}

# Create archive directory
mkdir -p ~/github-repos
cd ~/github-repos

# Clone repositories
echo "Cloning ${repoCount} repositories..."

${cloneCommands}

echo "✅ Done! All repositories cloned to ~/github-repos"
`;
}

export function CloneScriptDialog({ isOpen, onOpenChange, repos }: CloneScriptDialogProps) {
  const { toast } = useToast();
  const [cloneType, setCloneType] = useState<CloneType>('https');
  
  const scriptContent = useMemo(() => generateScript(repos, cloneType), [repos, cloneType]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(scriptContent).then(() => {
        toast({ title: 'Copied to clipboard!' });
    }).catch(err => {
        toast({ variant: 'destructive', title: 'Failed to copy', description: 'Could not copy script to clipboard.' });
        console.error('Failed to copy text: ', err);
    });
  };

  const handleDownloadScript = () => {
    const blob = new Blob([scriptContent], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `repo-ranger-clone-${date}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Download started!' });
  };
  
  if (!repos.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Clone Script</DialogTitle>
          <DialogDescription>
            A shell script has been generated to clone the {repos.length} selected repositories.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-4">
                <Label className="text-base">Clone Type</Label>
                <RadioGroup defaultValue="https" onValueChange={(value) => setCloneType(value as CloneType)} className="space-y-3">
                    <div className="flex items-start space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="https" id="r-https" className="mt-1" />
                        <div className="flex-1">
                            <Label htmlFor="r-https" className="font-semibold cursor-pointer">Standard (HTTPS)</Label>
                            <p className="text-xs text-muted-foreground">Full clone with complete history. Best for normal use.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="shallow" id="r-shallow" className="mt-1" />
                        <div className="flex-1">
                            <Label htmlFor="r-shallow" className="font-semibold cursor-pointer">Shallow Clone</Label>
                            <p className="text-xs text-muted-foreground">Only recent history (depth=1). Faster for large repos.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="mirror" id="r-mirror" className="mt-1" />
                        <div className="flex-1">
                            <Label htmlFor="r-mirror" className="font-semibold cursor-pointer">Mirror Clone</Label>
                            <p className="text-xs text-muted-foreground">Bare repository backup. For archiving all branches and tags.</p>
                        </div>
                    </div>
                </RadioGroup>
            </div>
            <ScrollArea className="h-[300px] w-full rounded-md border bg-muted/50 p-4">
                <pre className="font-code text-sm whitespace-pre-wrap">{scriptContent}</pre>
            </ScrollArea>
        </div>
        <DialogFooter>
            <Button onClick={handleCopyToClipboard} variant="outline">
                <Copy />
                Copy to Clipboard
            </Button>
          <Button onClick={handleDownloadScript}>
            <Download />
            Download Script
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
