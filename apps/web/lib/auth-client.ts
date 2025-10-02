import { createAuthClient } from "better-auth/react"
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClient({
    plugins: [dodopaymentsClient()],
})

export const integrationAuthClient = createAuthClient({
    basePath: "/api/integration-auth",
})
