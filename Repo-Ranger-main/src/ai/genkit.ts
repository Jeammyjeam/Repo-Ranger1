
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Required for some environments, such as Vercel.
      apiVersion: 'v1beta',
    }),
  ],
});
