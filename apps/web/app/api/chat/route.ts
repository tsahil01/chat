import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  StepResult,
  ToolSet,
} from "ai";
import tools from "@/lib/tools";
import { auth } from "@/lib/auth";
import {
  getChatWithUsage,
  handleChatCompletion,
  handleStreamingError,
} from "./action";
import { getSelectedModel } from "@/lib/models";
import { system_prompt } from "@/lib/prompts/system";

export const maxDuration = 30;

export async function POST(req: Request) {
  let system = ``;

  const {
    chatId,
    messages,
    selectedChatModel,
    selectedChatProvider,
    toggleWebSearch,
    timezone = "UTC",
  }: {
    chatId: string;
    messages: UIMessage[];
    selectedChatModel: string;
    selectedChatProvider: string;
    toggleWebSearch: boolean;
    timezone: string;
  } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chat, usage } = await getChatWithUsage(chatId, session.user.id);

  if (!usage || usage.remaining <= 0) {
    return Response.json(
      {
        error: "Monthly message limit exceeded",
        errorType: "USAGE_LIMIT",
        remaining: usage?.remaining || 0,
        limit: usage?.limit || 150,
        currentUsage: usage?.currentUsage || 0,
      },
      { status: 429 },
    );
  }

  const lastIncoming = messages[messages.length - 1]!;
  const needsChatCreation = !chat;
  const needsMessageCleanup = Boolean(
    chat &&
      lastIncoming?.role === "user" &&
      chat.messages.some((m) => m.id === lastIncoming.id),
  );

  system += system_prompt(selectedChatModel, timezone);

  if (toggleWebSearch) {
    system += `- You need to use the exaWebSearch tool for next user message. It does not matter what the user asks, you need to use the exaWebSearch tool.\n`;
  }

  if (system.trim() !== "") {
    messages.push({
      role: "system",
      parts: [{ type: "text", text: system }],
      id: "system",
      createdAt: new Date(),
    } as UIMessage);
  }

  const result = streamText({
    model: getSelectedModel({
      model: selectedChatModel,
      provider: selectedChatProvider,
    })!,
    messages: convertToModelMessages(messages),
    tools: tools,
    stopWhen: stepCountIs(5),
    system: system.trim() !== "" ? system : undefined,
    onFinish: async (result: StepResult<ToolSet>) => {
      const assistantMessage = {
        role: "assistant" as const,
        parts: result.content,
        id: result.response.id,
        createdAt: new Date(),
      } as UIMessage;

      const { success, errors } = await handleChatCompletion({
        chatId,
        lastIncoming,
        needsChatCreation,
        needsMessageCleanup,
        assistantMessage,
      });

      if (!success) {
        console.error("Background operations completed with errors:", errors);
      }
    },
    onError: async (error) => {
      console.error("Streaming error:", error);

      const saved = await handleStreamingError({
        chatId,
        lastIncoming,
        needsChatCreation,
      });

      if (!saved) {
        console.error("Failed to save user message after streaming error");
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
