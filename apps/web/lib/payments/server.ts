"use server";

import { SubscriptionListResponse } from "dodopayments/resources/subscriptions.mjs";
import { auth, dodoPayments } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSubscriptionsAction(): Promise<SubscriptionListResponse[]> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        
        if (!session?.user?.email) {
            throw new Error("User not authenticated or email not available");
        }

        // Find customer by email first
        const customers = await dodoPayments.customers.list({
            email: session.user.email,
        });

        const customer = customers.items?.[0];
        if (!customer) {
            console.warn("No customer found for email:", session.user.email);
            return [];
        }

        // Get subscriptions for this customer
        const subscriptions = await dodoPayments.subscriptions.list({
            customer_id: customer.customer_id,
            status: "active",
        });

        return subscriptions.items || [];
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return [];
    }
}

export async function isProUserAction(): Promise<boolean> {
    try {
        const subscriptions = await getSubscriptionsAction();
        return subscriptions.some(subscription => subscription.status === "active");
    } catch (error) {
        console.error("Error checking pro user status:", error);
        return false;
    }
}