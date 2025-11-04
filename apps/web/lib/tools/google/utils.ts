import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@workspace/db";
import { google } from "googleapis";

/**
 * Get Google integration tokens for a user
 */
export async function getGoogleTokens(userId: string) {
  const integration = await prisma.integration.findFirst({
    where: {
      userId: userId,
      name: "google",
    },
    select: {
      accessToken: true,
      refreshToken: true,
      expiresAt: true,
    },
  });

  return integration;
}

/**
 * Get the current authenticated session
 */
export async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("User not authenticated. Please sign in first.");
  }

  return session;
}

/**
 * Get Google integration for the current user
 */
export async function getCurrentUserGoogleAccount() {
  const session = await getCurrentSession();
  const googleIntegration = await getGoogleTokens(session.user.id);

  if (!googleIntegration) {
    throw new Error(
      "To use Google services, you need to link your Google account. Please go to the integrations page and link your Google account.",
    );
  }

  return { session, googleAccount: googleIntegration };
}

/**
 * Create and configure a Google OAuth2 client
 */
export function createGoogleOAuth2Client(googleIntegration: {
  accessToken: string | null;
  refreshToken: string | null;
}): any {
  if (!googleIntegration.accessToken || !googleIntegration.refreshToken) {
    throw new Error("Invalid Google integration credentials");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.INTEGRATION_GOOGLE_CLIENT_ID,
    process.env.INTEGRATION_GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: googleIntegration.accessToken,
    refresh_token: googleIntegration.refreshToken,
  });

  return oauth2Client;
}

/**
 * Create a Google Calendar client
 */
export function createGoogleCalendarClient(googleIntegration: {
  accessToken: string | null;
  refreshToken: string | null;
}) {
  const oauth2Client = createGoogleOAuth2Client(googleIntegration);
  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Handle Google API errors with consistent formatting
 */
export function handleGoogleError(error: any, operation: string): string {
  console.error(`Google ${operation} error:`, error);
  return `❌ Failed to ${operation}: ${error.message}`;
}

/**
 * Create a Google Gmail client
 */
export function createGoogleGmailClient(googleIntegration: {
  accessToken: string | null;
  refreshToken: string | null;
}) {
  const oauth2Client = createGoogleOAuth2Client(googleIntegration);
  return google.gmail({ version: "v1", auth: oauth2Client });
}
