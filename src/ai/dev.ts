
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/installation-guide-summarizer.ts';
import '@/ai/flows/app-categorizer.ts';
import '@/ai/flows/summarize-changes-flow.ts';
import '@/ai/flows/chat-about-repo-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/assistant-stream-flow.ts';
import '@/ai/tools/get-repository-details-tool.ts';
import '@/ai/tools/search-github-tool.ts';
