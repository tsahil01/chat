import { auth } from "@/lib/auth";
import { getCurrentMonth } from "@/lib/utils";
import { prisma } from "@workspace/db";
import { NextRequest } from "next/server";
import { z } from "zod";

const incrementUsageSchema = z.object({
    amount: z.number().int().positive().default(1),
    userLimit: z.number().int().positive()
});

export async function POST(
    request: NextRequest,
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        
        let amount: number;
        let userLimit: number;
        
        try {
            const validatedData = incrementUsageSchema.parse(body);
            amount = validatedData.amount;
            userLimit = validatedData.userLimit;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return Response.json({ 
                    error: "Invalid request data", 
                    details: error.errors 
                }, { status: 400 });
            }
            throw error;
        }

        const month = getCurrentMonth();    

        const currentUsage = await prisma.userUsage.findUnique({
            where: {
                userId_month: {
                    userId: session.user.id,
                    month: month,
                }
            }
        });

        const currentMessages = currentUsage?.messages || 0;

        if (currentMessages + amount > userLimit || amount > userLimit) {
            return Response.json({
                error: "Monthly message limit exceeded",
                currentUsage: currentMessages,
                limit: userLimit,
                month: month,
            }, { status: 429 });
        }

        // Increment usage in database using upsert
        const updatedUsage = await prisma.userUsage.upsert({
            where: {
                userId_month: {
                    userId: session.user.id,
                    month: month,
                }
            },
            update: {
                messages: {
                    increment: amount
                },
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                month: month,
                messages: amount,
            }
        });

        return Response.json({
            success: true,
            newUsage: updatedUsage.messages,
            remaining: userLimit - updatedUsage.messages,
            month: month,
        });

    } catch (error) {
        console.error("Error incrementing monthly usage:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
