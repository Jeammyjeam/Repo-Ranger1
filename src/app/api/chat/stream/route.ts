
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { runAssistantStream } from '@/ai/flows/assistant-stream-flow';
import type { Message } from '@/components/chat-interface';

export async function POST(req: NextRequest) {
  try {
    const { messages, customModel }: { messages: Message[], customModel?: { name: string, repositories: string[] } | null } = await req.json();

    if (!messages) {
      return NextResponse.json({ error: 'Missing messages in request body' }, { status: 400 });
    }

    const stream = await runAssistantStream(messages, customModel);
    
    // The stream from runAssistantStream is already encoded as text/plain
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('[Chat Stream API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
