import { INTEGRATION_CONFIG } from "@/lib/integration-config";

export function buildOAuthUrl(
  provider: (typeof INTEGRATION_CONFIG)[number]["name"],
  options?: { state?: string },
) {
  const baseUrl = INTEGRATION_CONFIG.find(
    (config) => config.name === provider,
  )?.OAUTH_ENDPOINTS;
  if (!baseUrl) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const config = INTEGRATION_CONFIG.find((config) => config.name === provider);
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const clientId = config.clientId;

  if (!clientId) {
    throw new Error(`Missing client ID for ${provider}`);
  }

  const redirectUri = `${
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/integrations/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: config.SCOPES.join(" "),
    response_type: "code",
    state: options?.state || `${provider}:${Date.now()}`,
    ...(config.name === "github" && { allow_signup: "true" }),
    ...(config.name === "google" && {
      access_type: "offline",
      prompt: "consent",
    }),
  });

  return `${baseUrl}?${params.toString()}`;
}

export function generateState(provider: string) {
  return `${provider}:${Date.now()}:${Math.random().toString(36).substring(7)}`;
}

export function parseState(state: string) {
  const parts = state.split(":");
  return {
    provider: parts[0],
    timestamp: parts[1],
    nonce: parts[2],
  };
}
