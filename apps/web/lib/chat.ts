import { generateText, UIMessage } from "ai";
import { openrouter } from "./openrouter";
import { Message } from "@workspace/db";

export async function generateTitleFromUserMessage({
    message,
  }: {
    message: UIMessage;
  }) {
    try {
    const { text: title } = await generateText({
      model: openrouter('nvidia/nemotron-nano-9b-v2:free'),
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

  export async function getUIMessages(messages: Message[]): Promise<UIMessage[]> {
    return messages.map((message) => ({ 
      role: message.role as 'system' | 'user' | 'assistant',
      parts: JSON.parse(JSON.stringify(message.parts)),
      id: message.id,
      createdAt: message.createdAt,
    }));
  }