import {
  streamText,
  UIMessage,
  convertToModelMessages,
  StepResult,
  ToolSet,
  stepCountIs,
  UIMessagePart,
  UIDataTypes,
  UITools,
} from "ai";
import { getTools } from "@/lib/tools";
import { auth } from "@/lib/auth";
import {
  getChatWithUsage,
  getIntegrations,
  handleChatCompletion,
  handleStreamingError,
} from "./action";
import { getSelectedModel, Models, models } from "@/lib/models";
import { system_prompt } from "@/lib/prompts/system";
import { Integration } from "@workspace/db";

export const maxDuration = 30;

export interface ChatRequest {
  chatId: string;
  messages: UIMessage[];
  selectedChatModel: string;
  selectedChatProvider: string;
  toggleWebSearch: boolean;
  timezone: string;
  personality?: string;
}

export async function POST(req: Request) {
  let system = ``;

  const {
    chatId,
    messages,
    selectedChatModel,
    selectedChatProvider,
    toggleWebSearch,
    timezone = "UTC",
    personality,
  }: ChatRequest = await req.json();

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

  const integrations: Integration[] = await getIntegrations(session.user.id);

  system += system_prompt(
    selectedChatModel,
    timezone,
    personality,
    integrations,
  );

  if (toggleWebSearch) {
    system += `- You need to use the exaWebSearch tool for next user message. It does not matter what the user asks, you need to use the exaWebSearch tool.\n`;
  }

  const sanitizedMessages: UIMessage[] = messages.map((msg) => ({
    ...msg,
    parts: Array.isArray(msg.parts)
      ? (msg.parts as UIMessagePart<UIDataTypes, UITools>[]).filter(
          (part) => part.type !== "tool-result" && part.type !== "tool-call",
        )
      : msg.parts,
  }));

  const getModelDetails = (modelName: string): Models | undefined => {
    return models.find((model) => model.model === modelName);
  };

  const result = streamText({
    model: getSelectedModel({
      model: selectedChatModel,
      provider: selectedChatProvider,
    })!,
    messages: convertToModelMessages(sanitizedMessages),
    ...(getModelDetails(selectedChatModel)?.toolSupport
      ? { tools: getTools(integrations) }
      : {}),
    stopWhen: stepCountIs(100),
    system: system.trim() !== "" ? system : undefined,
    onFinish: async (result: StepResult<ToolSet>) => {
      const parts: UIMessagePart<UIDataTypes, UITools>[] = [];

      result.response.messages.forEach((msg) => {
        const content = Array.isArray(msg.content)
          ? msg.content
          : [msg.content];
        parts.push(...(content as UIMessagePart<UIDataTypes, UITools>[]));
      });

      const assistantMessage = {
        role: "assistant",
        parts: parts,
        id: result.response.id,
        createdAt: new Date(),
      } as UIMessage;

      console.log("assistantMessage", JSON.stringify(assistantMessage, null, 2));

      const { success, errors } = await handleChatCompletion({
        chatId,
        lastIncoming,
        needsChatCreation,
        needsMessageCleanup,
        assistantMessage,
        personality,
      });

      if (!success) {
        console.error("Background operations completed with errors:", errors);
      }
    },
    onError: async (error) => {
      console.error("Streaming error:", JSON.stringify(error, null, 2));

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
