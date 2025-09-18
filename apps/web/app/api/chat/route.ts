import { streamText, UIMessage, convertToModelMessages, stepCountIs, StepResult, ToolSet } from 'ai';
import tools from '@/lib/tools';
import { auth } from '@/lib/auth';
import { getUserUsageAction, incrementMessageUsageAction } from '@/lib/usage/server';
import { addMessage, createChat, getChat, deleteAllMessagesAfter } from './action';
import { generateTitleFromUserMessage } from '@/lib/chat';
import { Visibility } from '@workspace/db';
import { generateUUID } from '@/lib/utils';
import { getSelectedModel } from '@/lib/models';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  let system = ``;

  const { chatId,
    messages,
    selectedChatModel,
    selectedChatProvider,
    toggleWebSearch }:
    {
      chatId: string,
      messages: UIMessage[],
      selectedChatModel: string,
      selectedChatProvider: string,
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
  // Detect regenerate: if the last user message already exists in DB, remove all messages after it
  const lastIncoming = messages[messages.length - 1]!;
  if (chat && lastIncoming?.role === 'user') {
    const isDuplicateUser = chat.messages.some((m) => m.id === lastIncoming.id);
    if (isDuplicateUser) {
      await deleteAllMessagesAfter(chatId, lastIncoming.id);
    }
  }
  if (lastIncoming?.role === 'user') {
    await addMessage({chatId, message: lastIncoming});
  }

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
    model: getSelectedModel({model: selectedChatModel, provider: selectedChatProvider})!,
    messages: convertToModelMessages(messages),
    tools: tools,
    stopWhen: stepCountIs(5),
    system: system.trim() !== '' ? system : undefined,
    onFinish: async (result: StepResult<ToolSet>) => {
      await addMessage({chatId, message: {
        role: 'assistant',
        parts: result.content,
        id: result.response.id,
        createdAt: new Date(),
      } as UIMessage});
    },
  });

  await incrementMessageUsageAction();

  return result.toUIMessageStreamResponse();
}