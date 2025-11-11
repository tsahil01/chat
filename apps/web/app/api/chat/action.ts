"use server";

import { auth } from "@/lib/auth";
import { Chat, Message, prisma, Visibility } from "@workspace/db";
import { FileUIPart, UIMessage } from "ai";
import { headers } from "next/headers";
import { isProUserAction } from "@/lib/payments/server";
import { FREE_LIMIT, PRO_LIMIT } from "@/lib/usage";
import { generateTitleFromUserMessage } from "@/lib/chat";
import { incrementMessageUsageAction } from "@/lib/usage/server";

export async function getChat(
  chatId: string
): Promise<
  (Chat & { messages: Message[]; personality: string | null }) | null
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      return null;
    }

    return chat;
  } catch (error) {
    console.error("Error getting chat:", error);
    return null;
  }
}

export async function getUsage(
  userId: string,
  type: "message" | "image"
): Promise<{
  currentUsage: number;
  limit: number;
  remaining: number;
}> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [usage, isPro] = await Promise.all([
      prisma.userUsage.findUnique({
        where: {
          userId_month: {
            userId: userId,
            month: currentMonth,
          },
        },
      }),
      isProUserAction(),
    ]);

    const limit = isPro ? PRO_LIMIT : FREE_LIMIT;
    const currentUsage = usage?.messages || 0;

    return {
      currentUsage,
      limit,
      remaining: Math.max(0, limit - currentUsage),
    };
  } catch (error) {
    console.error("Error getting usage:", error);
    return { currentUsage: 0, limit: 0, remaining: 0 };
  }
}

export async function getChatWithUsage(
  chatId: string,
  userId: string
): Promise<{
  chat: (Chat & { messages: Message[] }) | null;
  usage: { currentUsage: number; limit: number; remaining: number } | null;
}> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [chat, usage, isPro] = await Promise.all([
      prisma.chat.findUnique({
        where: {
          id: chatId,
          userId: userId,
        },
        include: {
          messages: true,
        },
      }),
      prisma.userUsage.findUnique({
        where: {
          userId_month: {
            userId: userId,
            month: currentMonth,
          },
        },
      }),
      isProUserAction(),
    ]);

    const limit = isPro ? PRO_LIMIT : FREE_LIMIT;
    const currentUsage = usage?.messages || 0;

    return {
      chat,
      usage: {
        currentUsage,
        limit,
        remaining: Math.max(0, limit - currentUsage),
      },
    };
  } catch (error) {
    console.error("Error getting chat with usage:", error);
    return { chat: null, usage: null };
  }
}

export async function createChat({
  chatId,
  title,
  visibility,
  personality,
}: {
  chatId: string;
  title: string;
  visibility: Visibility;
  personality?: string;
}): Promise<Chat | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    const chat = await prisma.chat.create({
      data: {
        id: chatId,
        title,
        userId: session.user.id,
        visibility,
        personality,
      },
    });

    return chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
}

export async function addMessage({
  chatId,
  message,
}: {
  chatId: string;
  message: UIMessage;
}): Promise<Message | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }
    const createdMessage = await prisma.message.create({
      data: {
        chatId,
        id: message.id,
        role: message.role,
        parts: JSON.parse(JSON.stringify(message.parts)),
        attachments: JSON.parse(
          JSON.stringify(
            message.parts.filter(
              (part): part is FileUIPart => part.type === "file"
            )
          )
        ),
      },
    });

    return createdMessage;
  } catch (error) {
    console.error("Error adding message:", error);
    return null;
  }
}

export async function deleteAllMessagesAfter(
  chatId: string,
  messageId: string
): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const targetMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        chatId,
      },
      select: { createdAt: true },
    });

    if (!targetMessage) {
      return false;
    }

    await prisma.message.deleteMany({
      where: {
        chatId,
        createdAt: {
          gt: targetMessage.createdAt,
        },
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting messages after target:", error);
    return false;
  }
}

export async function handleChatCompletion({
  chatId,
  lastIncoming,
  needsChatCreation,
  needsMessageCleanup,
  assistantMessage,
  personality,
}: {
  chatId: string;
  lastIncoming: UIMessage;
  needsChatCreation: boolean;
  needsMessageCleanup: boolean;
  assistantMessage: UIMessage;
  personality?: string;
}): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    if (needsChatCreation) {
      try {
        await createChat({
          chatId,
          title: "New Chat",
          visibility: Visibility.PRIVATE,
          personality: personality,
        });

        setImmediate(async () => {
          try {
            const title = await generateTitleFromUserMessage({
              message: lastIncoming,
            });
            await prisma.chat.update({
              where: { id: chatId },
              data: { title },
            });
          } catch (error) {
            console.error("Background title generation failed:", error);
          }
        });
      } catch (error) {
        console.error("Chat creation failed:", error);
        errors.push("Failed to create chat");
      }
    }

    if (needsMessageCleanup) {
      try {
        await deleteAllMessagesAfter(chatId, lastIncoming.id);
      } catch (error) {
        console.error("Message cleanup failed:", error);
        errors.push("Failed to clean up duplicate messages");
      }
    }

    if (lastIncoming?.role === "user") {
      try {
        const savedMessage = await addMessage({
          chatId,
          message: lastIncoming,
        });
        if (!savedMessage) {
          errors.push("Failed to save user message");
        }
      } catch (error) {
        console.error("User message save failed:", error);
        errors.push("Failed to save user message");
      }
    }

    try {
      await Promise.all([
        addMessage({ chatId, message: assistantMessage }),
        incrementMessageUsageAction(),
      ]);
    } catch (error) {
      console.error("Assistant message save failed:", error);
      errors.push("Failed to save assistant message");
    }

    return { success: errors.length === 0, errors };
  } catch (error) {
    console.error("Critical error in background operations:", error);
    return {
      success: false,
      errors: ["Critical error in background operations"],
    };
  }
}

export async function handleStreamingError({
  chatId,
  lastIncoming,
  needsChatCreation,
}: {
  chatId: string;
  lastIncoming: UIMessage;
  needsChatCreation: boolean;
}): Promise<boolean> {
  if (lastIncoming?.role !== "user") return false;

  try {
    if (needsChatCreation) {
      await createChat({
        chatId,
        title: "New Chat",
        visibility: Visibility.PRIVATE,
      });
    }
    await addMessage({ chatId, message: lastIncoming });
    return true;
  } catch (error) {
    console.error("Failed to save user message after streaming error:", error);
    return false;
  }
}
