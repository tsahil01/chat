import { getChat } from "@/app/api/chat/action";
import { auth } from "@/lib/auth";
import { prisma, Visibility } from "@workspace/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const chatId = params.id;

  if (!chatId) {
    return Response.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const chat = await getChat(chatId);

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  if (chat.userId !== session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sharedChat = await prisma.chat.update({
    where: { id: chatId },
    data: { visibility: Visibility.PUBLIC },
  });

  if (!sharedChat) {
    return Response.json({ error: "Failed to unshare chat" }, { status: 500 });
  }

  return Response.json({ success: true });
}
