import { getChat } from "@/app/api/chat/action";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
    const chatId = params.id;

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