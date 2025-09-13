import { generateText, UIMessage } from "ai";
import { openrouter } from "./openrouter";

export async function generateTitleFromUserMessage({
    message,
  }: {
    message: UIMessage;
  }) {
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
  }