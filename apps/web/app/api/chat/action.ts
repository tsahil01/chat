"use server";

import { auth } from "@/lib/auth";
import { Chat, Message, prisma, Visibility } from "@workspace/db";
import { UIMessage } from "ai";
import { headers } from "next/headers";

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
                role: message.role,
                parts: JSON.parse(JSON.stringify(message.parts)),
                attachments: JSON.parse(JSON.stringify(message.parts.filter((part: any)=>{
                    return part.type === 'image' || part.type === 'file';
                }))),
            }
        });

        return createdMessage;
    } catch (error) {
        console.error("Error adding message:", error);
        return null;
    }
}