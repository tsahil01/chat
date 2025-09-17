import { auth } from "@/lib/auth";
import { prisma, Chat } from "@workspace/db";

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const chats: Chat[] = await prisma.chat.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: "desc"
            },
        });

        return Response.json(chats);
    } catch (error) {
        console.error("Error getting recent chats:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
