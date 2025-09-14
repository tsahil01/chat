import { openrouter } from '@/lib/openrouter';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import tools from '@/lib/tools';
import { ChatMetadata } from '@/lib/types';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  let system = ``;
  const { messages }: { messages: UIMessage[] } = await req.json();
  const metadata: ChatMetadata = messages[messages.length - 1]?.metadata as ChatMetadata;
  if (metadata.toggleWebSearch) {
    system += `- You need to use the exaWebSearch tool for next user message. It does not matter what the user asks, you need to use the exaWebSearch tool.\n`;
  }
  
  messages.push({
    role: 'system',
    parts: [{ type: 'text', text: system }],
    id: 'system',
    createdAt: new Date(),
  } as UIMessage);

  const result = streamText({
    model: openrouter(metadata?.model || 'nvidia/nemotron-nano-9b-v2:free'),
    messages: convertToModelMessages(messages),
    tools: tools,
    stopWhen: stepCountIs(5),
    system,
  });

  return result.toUIMessageStreamResponse();
}