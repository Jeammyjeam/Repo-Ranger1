'use server';

import { summarizeInstallationGuide, type SummarizeInstallationGuideInput, type SummarizeInstallationGuideOutput } from "@/ai/flows/installation-guide-summarizer";
import { chatAboutRepo, type ChatAboutRepoInput, type ChatAboutRepoOutput } from "@/ai/flows/chat-about-repo-flow";
import { summarizeChanges, type SummarizeChangesInput, type SummarizeChangesOutput } from "@/ai/flows/summarize-changes-flow";
import { textToSpeech, type TextToSpeechOutput } from "@/ai/flows/text-to-speech-flow";
import { categorizeApp, type CategorizeAppInput, type CategorizeAppOutput } from "@/ai/flows/app-categorizer";

import { searchRepositories, compareCommits } from "./github";
import type { Repository } from "./types";
import { cache } from "react";

// The cache function is used to deduplicate requests across components.
// It ensures that if the same data is requested multiple times in a single render,
// the underlying data-fetching function is only called once.

export const getSummarizedInstallationGuide = cache(async (
  input: SummarizeInstallationGuideInput,
  owner: string,
  repo: string
): Promise<SummarizeInstallationGuideOutput> => {
  if (!process.env.GEMINI_API_KEY) {
    return { summary: "AI features are not configured for this application." };
  }
  return await summarizeInstallationGuide(input);
});


export const getChatAboutRepoResponse = cache(async (
  input: ChatAboutRepoInput,
): Promise<ChatAboutRepoOutput> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI features are not configured for this application.");
  }
  return await chatAboutRepo(input);
});

export const getCategorizedApp = cache(async (
  input: CategorizeAppInput,
): Promise<CategorizeAppOutput> => {
  if (!process.env.GEMINI_API_KEY) {
    return { categories: [] };
  }
  return await categorizeApp(input);
});


export const getUpdateSummary = cache(async (
    repoFullName: string,
    base: string,
    head: string,
): Promise<SummarizeChangesOutput> => {
    if (!process.env.GEMINI_API_KEY) {
        return { summary: "AI features are not configured for this application." };
    }
    const [owner, repo] = repoFullName.split('/');
    const comparison = await compareCommits(owner, repo, base, head);
    const commitMessages = comparison.commits.map(c => c.commit.message);
    
    if (commitMessages.length === 0) {
        return { summary: "No new commits found to summarize." };
    }
    
    return await summarizeChanges({ repoFullName, commits: commitMessages });
});


export const getTextToSpeech = cache(async (
  text: string
): Promise<TextToSpeechOutput> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI features are not configured for this application.");
  }
  try {
    return await textToSpeech(text);
  } catch (error: any) {
    // Intercept the error to add more context for the user.
    console.error("Text-to-speech flow failed:", error);
    let message = "Could not generate audio. The API returned an error.";
    if (error.message && typeof error.message === 'string') {
        if (error.message.includes('403') || error.message.toLowerCase().includes('permission denied')) {
          message = "Your API key may not have permission for the text-to-speech model, as it may be a preview feature."
        } else if (error.message.includes('429')) {
          message = "You have exceeded your API quota. Please check your Google AI Studio account and try again later."
        } else if (error.message.includes('no media returned')) {
          message = "The AI model did not return any audio data for the provided text."
        }
    }
    // Re-throw with a more user-friendly message
    throw new Error(message);
  }
});


export const searchGithubForChat = cache(async (
    query: string
): Promise<Repository[]> => {
    return await searchRepositories(query, 'stars', 'desc');
});
