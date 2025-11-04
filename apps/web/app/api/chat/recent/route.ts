import { auth } from "@/lib/auth";
import { prisma, Chat } from "@workspace/db";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.chat.count({
      where: {
        userId: session.user.id,
      },
    });

    const chats: Chat[] = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        visibility: true,
        userId: true,
        lastContext: true,
      },
    });

    const hasMore = offset + chats.length < totalCount;

    return Response.json({
      chats,
      hasMore,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error getting recent chats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
