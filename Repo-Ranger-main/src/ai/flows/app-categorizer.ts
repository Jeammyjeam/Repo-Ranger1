
'use server';

/**
 * @fileOverview Categorizes apps using AI to improve discoverability.
 *
 * - categorizeApp - A function that categorizes a given app.
 * - CategorizeAppInput - The input type for the categorizeApp function.
 * - CategorizeAppOutput - The return type for the categorizeApp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeAppInputSchema = z.object({
  name: z.string().describe('The name of the app.'),
  description: z.string().describe('A description of the app.'),
});
export type CategorizeAppInput = z.infer<typeof CategorizeAppInputSchema>;

const CategorizeAppOutputSchema = z.object({
  categories: z.array(z.string()).describe('An array of categories for the app. Provide between 2 and 5 relevant, single-word, lowercase categories.'),
});
export type CategorizeAppOutput = z.infer<typeof CategorizeAppOutputSchema>;

export async function categorizeApp(input: CategorizeAppInput): Promise<CategorizeAppOutput> {
  return categorizeAppFlow(input);
}

const categorizeAppPrompt = ai.definePrompt({
  name: 'categorizeAppPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: CategorizeAppInputSchema },
  output: { schema: CategorizeAppOutputSchema },
  prompt: `You are a helpful app categorization assistant. Given the name and description of an app, you will return a list of relevant categories.

App Name: {{{name}}}
App Description: {{{description}}}`,
});

const categorizeAppFlow = ai.defineFlow(
  {
    name: 'categorizeAppFlow',
    inputSchema: CategorizeAppInputSchema,
    outputSchema: CategorizeAppOutputSchema,
  },
  async input => {
    const { output } = await categorizeAppPrompt(input);

    if (!output) {
      console.error("Failed to get structured output for app category.");
      return { categories: [] };
    }
    
    return output;
  }
);
