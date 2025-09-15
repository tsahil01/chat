import { getChat } from "@/app/api/chat/action";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
    try {
    const chatId = context.params.id;

    if (!chatId) {
        return Response.json({ error: "Chat ID is required" }, { status: 400 });
    }
    
    const chat = await getChat(chatId);

    if (!chat) {
        return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    return Response.json(chat);
} catch (error) {
        console.error("Error getting chat messages:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}