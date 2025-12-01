import { generateText } from "ai";
import { Message } from "@workspace/db";
import { getChat, getSharedChat } from "@/app/api/chat/action";
import { UIMessage } from "@/lib/types";
import { defaultModel, getSelectedModel } from "@/lib/models";

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  try {
    const { text: title } = await generateText({
      model: getSelectedModel({
        model: defaultModel!.model,
        provider: defaultModel!.provider,
      })!,
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 10 characters long
      - the title should be a summary of the user's message
      - do not use quotes/ colons/ markdown/ em dashes.`,
      prompt: JSON.stringify(message),
      maxOutputTokens: 20,
    });

    return title;
  } catch (error) {
    console.error("Error generating title:", error);
    return "New Chat";
  }
}

export async function getChatInfo(chatId: string) {
  const chat = await getChat(chatId);
  if (!chat) return null;
  return {
    title: chat.title || "New Chat",
    personality: chat.personality || null,
  };
}

export async function getSharedChatInfo(chatId: string) {
  const chat = await getSharedChat(chatId);
  if (!chat) return null;
  return {
    title: chat.title || "New Chat",
    personality: chat.personality || null,
  };
}

export async function getUIMessages(
  messages?: Message[] | null,
): Promise<UIMessage[]> {
  if (!Array.isArray(messages) || messages.length === 0) return [];
  return messages
    .map((message: Message) => ({
      role: message.role as "system" | "user" | "assistant",
      parts: JSON.parse(JSON.stringify(message.parts)),
      id: message.id,
      createdAt: message.createdAt,
      attachments: JSON.parse(JSON.stringify(message.attachments)),
    }))
    .sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}
