"use server";

import { FREE_LIMIT, PRO_LIMIT, UsageData } from ".";
import { getCurrentMonth, getNextMonthResetDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isProUserAction } from "@/lib/payments/server";
import { prisma } from "@workspace/db";

export async function getUsageLimitAction(): Promise<number> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            console.warn("User not authenticated");
            return FREE_LIMIT;
        }

        const isPro = await isProUserAction();
        return isPro ? PRO_LIMIT : FREE_LIMIT;
    } catch (error) {
        console.error("Error getting usage limit:", error);
        return FREE_LIMIT;
    }
}

export async function getUserUsageAction(): Promise<UsageData | null> {
    try {
        // Get current user session
        const session = await auth.api.getSession({
            headers: await headers()
        });
        
        if (!session) {
            console.warn("User not authenticated");
            return null;
        }

        // Get user's pro status and limit
        const isPro = await isProUserAction();
        const limit = isPro ? PRO_LIMIT : FREE_LIMIT;

        // Get current month in "YYYY-MM" format
        const currentMonth = getCurrentMonth();
        
        // Fetch current usage from your API
        const currentUsage = await getCurrentMonthUsage();
        
        return {
            userId: session.user.id,
            currentUsage,
            limit,
            remaining: Math.max(0, limit - currentUsage),
            isProUser: isPro,
            month: currentMonth,
            resetDate: getNextMonthResetDate(),
        };

    } catch (error) {
        console.error("Error getting user usage:", error);
        return null;
    }
}

export async function canUserSendMessage(): Promise<boolean> {
    try {
        const usage = await getUserUsageAction();
        
        if (!usage) {
            return false; // Not authenticated
        }

        return usage.remaining > 0;
    } catch (error) {
        console.error("Error checking message permission:", error);
        return false;
    }
}

export async function incrementMessageUsageAction(): Promise<boolean> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        
        if (!session) {
            console.warn("User not authenticated");
            return false;
        }

        const currentMonth = getCurrentMonth();
        
        // Call your API to increment message usage
        const success = await incrementMonthlyUsage(currentMonth, 1);
        return success;

    } catch (error) {
        console.error("Error incrementing message usage:", error);
        return false;
    }
}

// Helper functions for API calls
async function getCurrentMonthUsage(): Promise<number> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            console.warn("User not authenticated");
            return 0;
        }

        const usage = await prisma.userUsage.findUnique({
            where: {
                userId_month: {
                    userId: session.user.id,
                    month: getCurrentMonth(),
                }
            }
        });

        return usage?.messages || 0;
    } catch (error) {
        console.error("Error fetching monthly usage:", error);
        return 0;
    }
}

async function incrementMonthlyUsage(month: string, amount: number): Promise<boolean> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            console.warn("User not authenticated");
            return false;
        }
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
            },
            create: {
                userId: session.user.id,
                month: month,
                messages: amount,
            }
        });

        if (!updatedUsage) {
            console.warn("Failed to increment monthly usage");
            return false;
        }

        return true;

    } catch (error) {
        console.error("Error incrementing monthly usage:", error);
        return false;
    }
}