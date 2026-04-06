'use server';

/**
 * @fileOverview This flow handles the main AI assistant chat functionality,
 * supporting streaming responses and tool use for richer interactions.
 *
 * - runAssistantStream - The primary function that powers the AI chat. It takes
 *   conversation history and returns a stream of events (text, tool requests).
 */

import { ai } from '@/ai/genkit';
import type { Message } from '@/components/chat-interface';
import { getRepositoryDetailsTool } from '@/ai/tools/get-repository-details-tool';
import { searchGithubTool } from '@/ai/tools/search-github-tool';

/**
 * Maps the application's Message type to the Genkit Message type.
 * @param messages An array of application-specific messages.
 * @returns An array of Genkit-compatible messages.
 */
function toGenkitMessages(messages: Message[]) {
  // The system prompt is managed in this flow, so filter out any welcome messages from history.
  return messages.filter(m => !m.id.startsWith('welcome-')).map(msg => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));
}

const systemPrompt = customModel 
  ? `You are ${customModel.name}, a specialized AI assistant trained on the following repositories: ${customModel.repositories.join(', ')}.

You have deep knowledge of these codebases. When answering questions:
- Focus on the specific repositories you've been trained on
- Provide detailed, accurate information about their code, architecture, and best practices
- Reference specific files, functions, or patterns from these repos when relevant
- If asked about repositories outside your training, politely explain your specialization

For general questions, answer as a knowledgeable software engineering expert.`
  : `You are Repo Ranger, a helpful and friendly AI coding assistant.
- When a user asks you to find GitHub repositories, use the 'searchGithub' tool.
- When the user asks for more details about a specific repository (e.g., "tell me more about owner/repo" or "what are the stats for that first one?"), use the 'getRepositoryDetails' tool to fetch its information. Use the conversation context to identify the repository.
- After using a tool, summarize the results for the user in a friendly, conversational way.
- For all other questions, answer as a knowledgeable software engineering expert.`;

/**
 * Executes the main AI assistant chat logic and returns a stream of events.
 * @param history The current conversation history.
 * @param customModel Optional custom model configuration.
 * @returns A ReadableStream that emits JSON objects representing chat events.
 */
export async function runAssistantStream(history: Message[], customModel?: { name: string, repositories: string[] } | null) {
  // Use generateStream which returns both a stream and a final response promise.
  const { stream, response } = ai.generateStream({
    model: 'googleai/gemini-1.5-flash',
    messages: toGenkitMessages(history),
    system: customModel 
      ? `You are ${customModel.name}, a specialized AI assistant trained on the following repositories: ${customModel.repositories.join(', ')}.

You have deep knowledge of these codebases. When answering questions:
- Focus on the specific repositories you've been trained on
- Provide detailed, accurate information about their code, architecture, and best practices
- Reference specific files, functions, or patterns from these repos when relevant
- If asked about repositories outside your training, politely explain your specialization

For general questions, answer as a knowledgeable software engineering expert.`
      : `You are Repo Ranger, a helpful and friendly AI coding assistant.
- When a user asks you to find GitHub repositories, use the 'searchGithub' tool.
- When the user asks for more details about a specific repository (e.g., "tell me more about owner/repo" or "what are the stats for that first one?"), use the 'getRepositoryDetails' tool to fetch its information. Use the conversation context to identify the repository.
- After using a tool, summarize the results for the user in a friendly, conversational way.
- For all other questions, answer as a knowledgeable software engineering expert.`,
    tools: [getRepositoryDetailsTool, searchGithubTool],
  });

  // Convert the Genkit stream to a ReadableStream of JSON objects for the Next.js Response.
  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const enqueue = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      };

      try {
        for await (const chunk of stream) {
          if (chunk.content) {
            const text = chunk.content.map(part => part.text).join('');
            if (text) {
              enqueue({ type: 'content', chunk: text });
            }
          } else if (chunk.toolRequests && chunk.toolRequests.length > 0) {
            // Iterate through the array of tool request parts
            chunk.toolRequests.forEach((part) => {
              if (part.toolRequest) {
                enqueue({ 
                  type: 'tool_request', 
                  name: part.toolRequest.name, 
                  args: part.toolRequest.input 
                });
              }
            });
          }
        }
        enqueue({ type: 'done' });
      } catch(e) {
        console.error("Error processing stream:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown stream error occurred.";
        enqueue({ type: 'error', message: errorMessage });
      } finally {
        controller.close();
        // Await the full response promise at the end to finalize the operation and log metrics.
        await response;
      }
    },
  });

  return readableStream;
}
