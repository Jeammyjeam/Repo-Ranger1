
'use server';

/**
 * @fileOverview A flow that summarizes the installation guide from a given README text.
 *
 * - summarizeInstallationGuide - A function that takes README content and returns a summarized installation guide.
 * - SummarizeInstallationGuideInput - The input type for the summarizeInstallationGuide function.
 * - SummarizeInstallationGuideOutput - The return type for the summarizeInstallationGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInstallationGuideInputSchema = z.object({
  readmeContent: z.string().describe('The content of the README file of a repository.'),
});
export type SummarizeInstallationGuideInput = z.infer<typeof SummarizeInstallationGuideInputSchema>;

const SummarizeInstallationGuideOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the installation steps in Markdown format.'),
});
export type SummarizeInstallationGuideOutput = z.infer<typeof SummarizeInstallationGuideOutputSchema>;

export async function summarizeInstallationGuide(input: SummarizeInstallationGuideInput): Promise<SummarizeInstallationGuideOutput> {
  return summarizeInstallationGuideFlow(input);
}

const summarizeInstallationGuidePrompt = ai.definePrompt({
  name: 'summarizeInstallationGuidePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: SummarizeInstallationGuideInputSchema },
  output: { schema: SummarizeInstallationGuideOutputSchema },
  prompt: `You are an AI that summarizes installation guides from README files.

  Given the following README content, extract and summarize the installation steps. Format the output in clean, easy-to-read Markdown. If no clear installation steps are found, state that.

  README Content:
  ----------------
  {{{readmeContent}}}
  ----------------`,
});

const summarizeInstallationGuideFlow = ai.defineFlow(
  {
    name: 'summarizeInstallationGuideFlow',
    inputSchema: SummarizeInstallationGuideInputSchema,
    outputSchema: SummarizeInstallationGuideOutputSchema,
  },
  async input => {
    const { output } = await summarizeInstallationGuidePrompt(input);
    return output || { summary: '' };
  }
);
