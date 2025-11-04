import { createAuthClient } from "better-auth/client";
import { createAuthClient as createAuthClientReact } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClientReact({
  plugins: [dodopaymentsClient()],
});

export const integrationAuthClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  basePath: "/api/integration-auth",
});

export function parseOAuthCallbackUrl(url: string) {
  const params = new URL(url).searchParams;
  return {
    code: params.get("code"),
    state: params.get("state"),
  };
}

export async function exchangeOAuthCode(
  provider: string,
  code: string,
  codeVerifier?: string,
) {
  try {
    const response = await fetch("/api/integrations/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, code, codeVerifier }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error exchanging OAuth code:", error);
    throw error;
  }
}
