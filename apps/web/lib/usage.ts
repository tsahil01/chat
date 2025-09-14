import { authClient } from "./auth-client";
import { isProUser } from "./payments";
import { getCurrentMonth, getNextMonthResetDate } from "./utils";

const FREE_LIMIT = 30;
const PRO_LIMIT = 1000;

interface UsageData {
    userId: string;
    currentUsage: number;
    limit: number;
    remaining: number;
    isProUser: boolean;
    month: string;
    resetDate: Date;
}

export async function getUsageLimit(): Promise<number> {
    try {
        const isPro = await isProUser();
        return isPro ? PRO_LIMIT : FREE_LIMIT;
    } catch (error) {
        console.error("Error getting usage limit:", error);
        return FREE_LIMIT;
    }
}

export async function getUserUsage(): Promise<UsageData | null> {
    try {
        // Get current user session
        const { data: session, error } = await authClient.getSession();
        
        if (error || !session) {
            console.warn("User not authenticated");
            return null;
        }

        // Get user's pro status and limit
        const isPro = await isProUser();
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
        const usage = await getUserUsage();
        
        if (!usage) {
            return false; // Not authenticated
        }

        return usage.remaining > 0;
    } catch (error) {
        console.error("Error checking message permission:", error);
        return false;
    }
}

export async function incrementMessageUsage(): Promise<boolean> {
    try {
        const { data: session } = await authClient.getSession();
        
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
        const response = await fetch(`/api/usage`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return 0; // No usage record for this month yet
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.messages || 0;

    } catch (error) {
        console.error("Error fetching monthly usage:", error);
        return 0;
    }
}

async function incrementMonthlyUsage(month: string, amount: number): Promise<boolean> {
    try {
        const userLimit = await getUsageLimit();
        const response = await fetch(`/api/usage/${month}/increment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ amount, userLimit }),
        });

        return response.ok;

    } catch (error) {
        console.error("Error incrementing monthly usage:", error);
        return false;
    }
}

export async function getUsagePercentage(): Promise<number> {
    const usage = await getUserUsage();
    if (!usage || usage.limit === 0) return 0;
    
    return Math.min(100, (usage.currentUsage / usage.limit) * 100);
}

export async function getRemainingMessages(): Promise<number> {
    const usage = await getUserUsage();
    return usage?.remaining || 0;
}

export function formatUsageDisplay(usage: UsageData): string {
    return `${usage.currentUsage}/${usage.limit} messages this month (${usage.remaining} remaining)`;
}

// Usage status helpers
export async function getUsageStatus(): Promise<'safe' | 'warning' | 'limit'> {
    const usage = await getUserUsage();
    if (!usage) return 'limit';
    
    const percentage = (usage.currentUsage / usage.limit) * 100;
    
    if (percentage >= 100) return 'limit';
    if (percentage >= 80) return 'warning';
    return 'safe';
}

export async function shouldShowUpgradePrompt(): Promise<boolean> {
    const usage = await getUserUsage();
    if (!usage) return false;
    
    return !usage.isProUser && usage.remaining <= 5; // Show when 5 or fewer messages left
}