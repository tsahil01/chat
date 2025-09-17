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

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        if (!query.trim()) {
            return Response.json({
                chats: [],
                pagination: {
                    page,
                    limit,
                    totalCount: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        // Use raw SQL for better search performance and reliability
        const searchQuery = `%${query}%`;
        
        // Get total count for pagination
        const totalCountResult = await prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(DISTINCT c.id)::bigint as count
            FROM "Chat" c
            LEFT JOIN "Message" m ON c.id = m."chatId"
            WHERE c."userId" = ${session.user.id}
            AND (
                LOWER(c.title) LIKE LOWER(${searchQuery})
                OR LOWER(m.parts::text) LIKE LOWER(${searchQuery})
            )
        `;
        const totalCount = Number(totalCountResult[0]?.count || 0);

        // Get chats with search results
        const chats = await prisma.$queryRaw<Chat[]>`
            SELECT DISTINCT c.*
            FROM "Chat" c
            LEFT JOIN "Message" m ON c.id = m."chatId"
            WHERE c."userId" = ${session.user.id}
            AND (
                LOWER(c.title) LIKE LOWER(${searchQuery})
                OR LOWER(m.parts::text) LIKE LOWER(${searchQuery})
            )
            ORDER BY c."createdAt" DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const totalPages = Math.ceil(totalCount / limit);

        return Response.json({
            chats,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error searching chats:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
