import { auth } from "@/lib/auth";
import { getCurrentMonth } from "@/lib/utils";
import { prisma } from "@workspace/db";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const month = getCurrentMonth();

        // Get usage from database
        const usage = await prisma.userUsage.findUnique({
            where: {
                userId_month: {
                    userId: session.user.id,
                    month: month,
                }
            }
        });

        return Response.json({
            messages: usage?.messages || 0,
            month: month,
            userId: session.user.id,
        });

    } catch (error) {
        console.error("Error getting monthly usage:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
