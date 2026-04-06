
'use server';
/**
 * @fileOverview This flow is deprecated and should not be called.
 * The primary AI assistant functionality is now handled by a streaming flow.
 * See /src/ai/flows/assistant-stream-flow.ts for the `runAssistantStream` function.
 */
import {z} from 'genkit';

// Exporting empty/stale schemas to avoid breaking any potential lingering imports.
// These imports should be removed from calling code.
export const AssistantInputSchema = z.object({});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export const AssistantOutputSchema = z.object({
  response: z.string(),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

// The function now throws an error to make it clear it should not be called.
export async function runAssistant(input: AssistantInput): Promise<AssistantOutput> {
  throw new Error("The 'runAssistant' flow is deprecated and should not be called. Use 'runAssistantStream' instead.");
}
