import { getChat } from "@/app/api/chat/action";
import { prisma, Visibility } from "@workspace/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await params;

  if (!chatId) {
    return Response.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const chat = await getChat(chatId);

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  return Response.json(chat);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await params;

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

  const body = await request.json();
  const { title, visibility } = body;

  const updateData: { title?: string; visibility?: Visibility } = {};
  if (title !== undefined) {
    updateData.title = title;
  }
  if (visibility !== undefined) {
    updateData.visibility = visibility as Visibility;
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json(
      { error: "At least one field (title or visibility) is required" },
      { status: 400 },
    );
  }

  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: updateData,
  });

  return Response.json(updatedChat);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await params;

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

  const [deletedMessages, deletedChat] = await Promise.all([
    prisma.message.deleteMany({
      where: {
        chatId,
      },
    }),
    prisma.chat.delete({
      where: { id: chatId },
    }),
  ]);

  if (deletedMessages.count === 0) {
    return Response.json(
      { error: "Failed to delete messages" },
      { status: 500 },
    );
  }

  if (!deletedChat) {
    return Response.json({ error: "Failed to delete chat" }, { status: 500 });
  }

  return Response.json(deletedChat);
}
