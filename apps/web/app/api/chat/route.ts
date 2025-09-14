import { openrouter } from '@/lib/openrouter';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import tools from '@/lib/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const metadata = messages[messages.length - 1]?.metadata as { model: string };
  const result = streamText({
    model: openrouter(metadata?.model || 'nvidia/nemotron-nano-9b-v2:free'),
    messages: convertToModelMessages(messages),
    tools: tools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}