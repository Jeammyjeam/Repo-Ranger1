
'use server';

/**
 * @fileOverview A flow that answers questions about a GitHub repository.
 *
 * - chatAboutRepo - A function that takes a repository's context and a user question, and returns an AI-generated answer.
 * - ChatAboutRepoInput - The input type for the chatAboutRepo function.
 * - ChatAboutRepoOutput - The return type for the chatAboutRepo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatAboutRepoInputSchema = z.object({
  repoFullName: z.string().describe("The full name of the GitHub repository, e.g., 'facebook/react'."),
  readmeContent: z.string().describe("The full content of the repository's README.md file."),
  question: z.string().describe("The user's question about the repository."),
});
export type ChatAboutRepoInput = z.infer<typeof ChatAboutRepoInputSchema>;

const ChatAboutRepoOutputSchema = z.object({
  answer: z.string().describe("The AI-generated answer to the user's question."),
});
export type ChatAboutRepoOutput = z.infer<typeof ChatAboutRepoOutputSchema>;

export async function chatAboutRepo(input: ChatAboutRepoInput): Promise<ChatAboutRepoOutput> {
  return chatAboutRepoFlow(input);
}

const chatAboutRepoPrompt = ai.definePrompt({
  name: 'chatAboutRepoPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: ChatAboutRepoInputSchema },
  output: { schema: ChatAboutRepoOutputSchema },
  prompt: `You are an expert software engineer and AI assistant.
You will answer the user's question based on the provided context about the GitHub repository.
Be helpful, concise, and accurate. If the answer is not in the README, say so, but you can also make educated inferences based on the repository name and the user's question.

Repository: {{{repoFullName}}}
Question: {{{question}}}

README Content:
----------------
{{{readmeContent}}}
----------------`,
});

const chatAboutRepoFlow = ai.defineFlow(
  {
    name: 'chatAboutRepoFlow',
    inputSchema: ChatAboutRepoInputSchema,
    outputSchema: ChatAboutRepoOutputSchema,
  },
  async input => {
    const { output } = await chatAboutRepoPrompt(input);
    return output || { answer: "Sorry, I couldn't get a response." };
  }
);
