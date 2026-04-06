'use client'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export function ReadmeDisplay({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {content}
        </ReactMarkdown>
    </div>
  )
}
