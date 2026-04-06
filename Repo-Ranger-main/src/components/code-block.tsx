'use client';

import { useState } from 'react';
import { Copy, Check, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  code: string;
  onExplain?: (code: string) => void;
}

export function CodeBlock({ language, code, onExplain }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast({ title: "Code copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({ variant: 'destructive', title: 'Failed to copy' });
    });
  };

  return (
    <div className="relative my-4 rounded-lg border bg-secondary/50 font-code text-sm not-prose">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <Badge variant="secondary" className="capitalize">{language || 'code'}</Badge>
        <div className="flex items-center gap-1">
          {onExplain && (
            <Button size="icon" variant="ghost" onClick={() => onExplain(code)} title="Explain this code">
              <Wand2 className="h-4 w-4" />
              <span className="sr-only">Explain code</span>
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={handleCopy} title="Copy code">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>
       <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: '0 0 7px 7px',
            padding: '1rem',
            margin: 0,
            backgroundColor: 'transparent',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit'
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
    </div>
  );
}
