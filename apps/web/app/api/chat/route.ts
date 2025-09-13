import { openrouter } from '@/lib/openrouter';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter('nvidia/nemotron-nano-9b-v2:free'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}