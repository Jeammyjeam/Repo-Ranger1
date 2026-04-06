
'use server';

/**
 * @fileOverview A flow that summarizes changes between repository versions based on commit messages.
 *
 * - summarizeChanges - A function that takes a list of commit messages and returns a structured summary.
 * - SummarizeChangesInput - The input type for the summarizeChanges function.
 * - SummarizeChangesOutput - The return type for the summarizeChangesOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChangesInputSchema = z.object({
  repoFullName: z.string().describe('The full name of the repository, e.g., "owner/repo".'),
  commits: z.array(z.string()).describe('A list of commit messages.'),
});
export type SummarizeChangesInput = z.infer<typeof SummarizeChangesInputSchema>;

const SummarizeChangesOutputSchema = z.object({
  summary: z.string().describe('A user-friendly summary of the changes in Markdown format.'),
});
export type SummarizeChangesOutput = z.infer<typeof SummarizeChangesOutputSchema>;

export async function summarizeChanges(input: SummarizeChangesInput): Promise<SummarizeChangesOutput> {
  return summarizeChangesFlow(input);
}

const summarizeChangesPrompt = ai.definePrompt({
  name: 'summarizeChangesPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SummarizeChangesInputSchema },
  output: { schema: SummarizeChangesOutputSchema },
  prompt: `You are an expert software engineer and release note author. Your task is to create a high-level, user-friendly summary of changes based on a list of commit messages from the repository '{{{repoFullName}}}'.

Do not just list the commits. Instead, synthesize the information into a clear and concise summary. Group related changes under headings like "✨ New Features", "🐛 Bug Fixes", "🚀 Performance Improvements", and "⚙️ Maintenance & Refactoring".

Use Markdown for formatting. If there are no commits for a certain category, do not include the heading.

Here are the commit messages:
---
{{#each commits}}
- {{{this}}}
{{/each}}
---`,
});

const summarizeChangesFlow = ai.defineFlow(
  {
    name: 'summarizeChangesFlow',
    inputSchema: SummarizeChangesInputSchema,
    outputSchema: SummarizeChangesOutputSchema,
  },
  async input => {
    // If there are too many commits, truncate them to avoid hitting model limits.
    const MAX_COMMITS = 100;
    if (input.commits.length > MAX_COMMITS) {
        input.commits = input.commits.slice(0, MAX_COMMITS);
        input.commits.push("... (list of commits truncated)");
    }
    
    const { output } = await summarizeChangesPrompt(input);
    return output || { summary: '' };
  }
);
