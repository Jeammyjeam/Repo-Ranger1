
'use server';

import { ai } from '@/ai/genkit';
import { getRepositoryDetails } from '@/lib/github';
import { z } from 'genkit';

const GetRepositoryDetailsInputSchema = z.object({
  owner: z.string().describe('The owner of the GitHub repository.'),
  repo: z.string().describe('The name of the GitHub repository.'),
});

export const getRepositoryDetailsTool = ai.defineTool(
  {
    name: 'getRepositoryDetails',
    description: 'Get detailed information about a specific GitHub repository, including stars, forks, and description.',
    inputSchema: GetRepositoryDetailsInputSchema,
    outputSchema: z.any(), // Let the client handle the output
  },
  async ({ owner, repo }) => {
    // This tool's execution is handled by the client-side logic in chat-interface.tsx
    // The model uses this tool to signal its intent to get details.
    return { success: true, owner, repo };
  }
);
