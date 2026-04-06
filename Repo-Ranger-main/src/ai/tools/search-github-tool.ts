
'use server';

import { ai } from '@/ai/genkit';
import { searchRepositories } from '@/lib/github';
import { z } from 'genkit';

const SearchGithubInputSchema = z.object({
  query: z.string().describe('The search query for finding GitHub repositories.'),
});

export const searchGithubTool = ai.defineTool(
  {
    name: 'searchGithub',
    description: 'Search for GitHub repositories by a query string. Returns the top 5 results sorted by stars.',
    inputSchema: SearchGithubInputSchema,
    outputSchema: z.any(), // Output will be handled by the client
  },
  async ({ query }) => {
    // This tool's execution is handled by the client-side logic in chat-interface.tsx
    // The model uses this tool to signal its intent to search.
    return { success: true, query };
  }
);
