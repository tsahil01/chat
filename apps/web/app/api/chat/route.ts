import { openrouter } from '@/lib/providers/openrouter';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import tools from '@/lib/tools';
import { auth } from '@/lib/auth';
import { getUserUsageAction, incrementMessageUsageAction } from '@/lib/usage/server';
import { addMessage, createChat, getChat } from './action';
import { generateTitleFromUserMessage } from '@/lib/chat';
import { Visibility } from '@workspace/db';
import { generateUUID } from '@/lib/utils';
import { moonshot } from '@/lib/providers/moonshot';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  let system = ``;

  const { chatId,
    messages,
    selectedChatModel,
    toggleWebSearch }:
    {
      chatId: string,
      messages: UIMessage[],
      selectedChatModel: string,
      toggleWebSearch: boolean
    } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userUsage = await getUserUsageAction();
  if (userUsage?.remaining! <= 0) {
    return Response.json({ error: "Monthly message limit exceeded" }, { status: 429 });
  }

  const chat = await getChat(chatId);

  if (!chat) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      const title = await generateTitleFromUserMessage({ message: lastMessage });
      await createChat({ chatId, title, visibility: Visibility.PRIVATE });
    }
  } else {
    if (chat.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await addMessage({chatId, message: messages[messages.length - 1]!}); 

  system += `- you are a helpful assistant that can answer questions and help with tasks and your model is ${selectedChatModel}`;

  if (toggleWebSearch) {
    system += `- You need to use the exaWebSearch tool for next user message. It does not matter what the user asks, you need to use the exaWebSearch tool.\n`;
  }

  if (system.trim() !== '') {
    messages.push({
      role: 'system',
      parts: [{ type: 'text', text: system }],
      id: 'system',
      createdAt: new Date(),
    } as UIMessage);
  }

  const result = streamText({
    model: moonshot('kimi-k2-0905-preview'),
    messages: convertToModelMessages(messages),
    tools: tools,
    stopWhen: stepCountIs(5),
    system: system.trim() !== '' ? system : undefined,
    onFinish: async (result) => {
      await addMessage({chatId, message: {
        role: 'assistant',
        parts: result.text ? [{ type: 'text', text: result.text }] : [],
        id: generateUUID(),
        createdAt: new Date(),
      } as UIMessage});
    },
  });

  await incrementMessageUsageAction();

  return result.toUIMessageStreamResponse();
}