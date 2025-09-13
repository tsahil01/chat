import { SubscriptionListResponse } from "dodopayments/resources/subscriptions.mjs";
import { authClient } from "./auth-client";

async function getSubscriptions(): Promise<SubscriptionListResponse[]> {
    try {
        const { data: session } = await authClient.getSession();
        
        if (!session) {
            console.warn("User not authenticated");
            return [];
        }

        const { data: subscriptions, error } =
            await authClient.dodopayments.customer.subscriptions.list({
                query: {
                    limit: 10,
                    page: 1,
                    status: "active",
                },
            });

        if (error) {
            console.error("Failed to fetch subscriptions:", error);
            return [];
        }

        return subscriptions.items || [];
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return [];
    }
}

async function isProUser(): Promise<boolean> {
    try {
        const subscriptions = await getSubscriptions();
        return subscriptions.some(subscription => subscription.status === "active");
    } catch (error) {
        console.error("Error checking pro user status:", error);
        return false;
    }
}

export { getSubscriptions, isProUser };