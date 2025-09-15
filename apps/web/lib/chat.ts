import { generateText, UIMessage } from "ai";
import { openrouter } from "./providers/openrouter";
import { Message } from "@workspace/db";
import { moonshot } from "./providers/moonshot";
import { getChat } from "@/app/api/chat/action";

export async function generateTitleFromUserMessage({
    message,
  }: {
    message: UIMessage;
  }) {
    try {
    const { text: title } = await generateText({
      model: moonshot('kimi-k2-0905-preview'),
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
      prompt: JSON.stringify(message),
        });
    
        return title;
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Chat";
    }
  }

  export async function getChatTitle(chatId: string) {
    const chat = await getChat(chatId);
    if (!chat) return "New Chat";
    return chat.title;
  }

  export async function getUIMessages(messages?: Message[] | null): Promise<UIMessage[]> {
    if (!Array.isArray(messages) || messages.length === 0) return [];
    return messages.map((message) => ({ 
      role: message.role as 'system' | 'user' | 'assistant',
      parts: JSON.parse(JSON.stringify(message.parts)),
      id: message.id,
      createdAt: message.createdAt,
    }));
  }