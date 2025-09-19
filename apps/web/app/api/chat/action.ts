"use server";

import { auth } from "@/lib/auth";
import { Chat, Message, prisma, Visibility } from "@workspace/db";
import { FileUIPart, UIMessage } from "ai";
import { headers } from "next/headers";
import { isProUserAction } from "@/lib/payments/server";
import { FREE_LIMIT, PRO_LIMIT } from "@/lib/usage";

export async function getChat(chatId: string): Promise<Chat & { messages: Message[] } | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return null;
        }

        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
                userId: session.user.id
            },
            include: {
                messages: true
            }
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

export async function getChatWithUsage(chatId: string, userId: string): Promise<{
    chat: (Chat & { messages: Message[] }) | null;
    usage: { currentUsage: number; limit: number; remaining: number } | null;
}> {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        const [chat, usage, isPro] = await Promise.all([
            prisma.chat.findUnique({
                where: {
                    id: chatId,
                    userId: userId
                },
                include: {
                    messages: true
                }
            }),
            prisma.userUsage.findUnique({
                where: {
                    userId_month: {
                        userId: userId,
                        month: currentMonth
                    }
                }
            }),
            isProUserAction()
        ]);

        const limit = isPro ? PRO_LIMIT : FREE_LIMIT;
        const currentUsage = usage?.messages || 0;
        
        return {
            chat,
            usage: {
                currentUsage,
                limit,
                remaining: Math.max(0, limit - currentUsage)
            }
        };
    } catch (error) {
        console.error("Error getting chat with usage:", error);
        return { chat: null, usage: null };
    }
}

export async function createChat({chatId, title, visibility}: {chatId: string, title: string, visibility: Visibility}): Promise<Chat | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
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
            }
        });

        return chat;
    } catch (error) {
        console.error("Error creating chat:", error);
        return null;
    }
}

export async function addMessage({chatId, message}: {chatId: string, message: UIMessage}): Promise<Message | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
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
                attachments: JSON.parse(JSON.stringify(
                    message.parts.filter((part): part is FileUIPart => part.type === 'file')
                )),
            }
        });

        return createdMessage;
    } catch (error) {
        console.error("Error adding message:", error);
        return null;
    }
}

export async function deleteAllMessagesAfter(chatId: string, messageId: string): Promise<boolean> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
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