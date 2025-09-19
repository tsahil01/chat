import { streamText, UIMessage, convertToModelMessages, stepCountIs, StepResult, ToolSet } from 'ai';
import tools from '@/lib/tools';
import { auth } from '@/lib/auth';
import { incrementMessageUsageAction } from '@/lib/usage/server';
import { addMessage, createChat, getChatWithUsage, deleteAllMessagesAfter } from './action';
import { generateTitleFromUserMessage } from '@/lib/chat';
import { Visibility } from '@workspace/db';
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

  const { chat, usage } = await getChatWithUsage(chatId, session.user.id);

  if (!usage || usage.remaining <= 0) {
    return Response.json({ 
      error: "Monthly message limit exceeded",
      errorType: "USAGE_LIMIT",
      remaining: usage?.remaining || 0,
      limit: usage?.limit || 150,
      currentUsage: usage?.currentUsage || 0
    }, { status: 429 });
  }

  if (!chat) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      setImmediate(async () => {
        try {
          const title = await generateTitleFromUserMessage({ message: lastMessage });
          await createChat({ chatId, title, visibility: Visibility.PRIVATE });
        } catch (error) {
          console.error('Background chat creation failed:', error);
        }
      });
    }
  } else {
    if (chat.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const lastIncoming = messages[messages.length - 1]!;
  if (chat && lastIncoming?.role === 'user') {
    const isDuplicateUser = chat.messages.some((m) => m.id === lastIncoming.id);
    if (isDuplicateUser) {
      setImmediate(async () => {
        try {
          await deleteAllMessagesAfter(chatId, lastIncoming.id);
        } catch (error) {
          console.error('Background message cleanup failed:', error);
        }
      });
    }
  }

  if (lastIncoming?.role === 'user') {
    setImmediate(async () => {
      try {
        await addMessage({chatId, message: lastIncoming});
      } catch (error) {
        console.error('Background user message storage failed:', error);
      }
    });
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

  try {
    const result = streamText({
      model: getSelectedModel({model: selectedChatModel, provider: selectedChatProvider})!,
      messages: convertToModelMessages(messages),
      tools: tools,
      stopWhen: stepCountIs(5),
      system: system.trim() !== '' ? system : undefined,
      onFinish: async (result: StepResult<ToolSet>) => {
        try {
          await Promise.all([
            addMessage({chatId, message: {
              role: 'assistant',
              parts: result.content,
              id: result.response.id,
              createdAt: new Date(),
            } as UIMessage}),
            incrementMessageUsageAction()
          ]);
        } catch (error) {
          console.error('Error storing assistant message:', error);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in streamText:', error);
    return Response.json({ 
      error: "Failed to generate response",
      errorType: "STREAM_ERROR"
    }, { status: 500 });
  }
}