'use client';

import { useState } from 'react';
import type { Repository } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Download, Share2, GitBranch, Github, Copy, KeyRound, Briefcase, FileText } from 'lucide-react';
import { CloneScriptDialog } from './clone-script-dialog';

export function RepoActions({ repo }: { repo: Repository }) {
  const { toast } = useToast();
  const [isCloneScriptOpen, setIsCloneScriptOpen] = useState(false);
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied to clipboard!' });
  };

  const handleCopyClone = (cloneCommand: string) => {
    navigator.clipboard.writeText(cloneCommand);
    toast({ title: 'Clone command copied!' });
  };

  const zipUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <GitBranch />
              Clone
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleCopyClone(`git clone ${repo.html_url}.git`)}>
              <Copy /> HTTPS
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyClone(`git clone git@github.com:${repo.full_name}.git`)}>
              <KeyRound /> SSH
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyClone(`gh repo clone ${repo.full_name}`)}>
              <Briefcase /> GitHub CLI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsCloneScriptOpen(true)}>
              <FileText /> Generate Clone Script
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild>
          <a href={zipUrl} download>
            <Download />
            Download ZIP
          </a>
        </Button>

        <Button variant="secondary" onClick={handleShare}>
          <Share2 />
          Share
        </Button>

        <Button asChild variant="secondary">
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
            <Github />
            View on GitHub
          </a>
        </Button>
      </div>

      <CloneScriptDialog
        isOpen={isCloneScriptOpen}
        onOpenChange={setIsCloneScriptOpen}
        repos={[repo]}
      />
    </>
  );
}
