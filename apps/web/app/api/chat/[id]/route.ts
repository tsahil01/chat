import { getChat } from "@/app/api/chat/action";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("id");

  if (!chatId) {
    return Response.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const chat = await getChat(chatId);

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  return Response.json(chat);
}
