import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@workspace/db';
import { google } from 'googleapis';

/**
 * Get Google account tokens for a user
 */
export async function getGoogleTokens(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      providerId: 'google'
    },
    select: {
      accessToken: true,
      refreshToken: true,
      accessTokenExpiresAt: true,
    }
  });

  return account;
}

/**
 * Get the current authenticated session
 */
export async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("User not authenticated. Please sign in first.");
  }

  return session;
}

/**
 * Get Google account for the current user
 */
export async function getCurrentUserGoogleAccount() {
  const session = await getCurrentSession();
  const googleAccount = await getGoogleTokens(session.user.id);

  if (!googleAccount) {
    throw new Error("To use Google services, you need to link your Google account. Please use the go to the integrations page and link your Google account.");
  }

  return { session, googleAccount };
}

/**
 * Create and configure a Google OAuth2 client
 */
export function createGoogleOAuth2Client(googleAccount: { accessToken: string | null; refreshToken: string | null }): any {
  if (!googleAccount.accessToken || !googleAccount.refreshToken) {
    throw new Error("Invalid Google account credentials");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: googleAccount.accessToken,
    refresh_token: googleAccount.refreshToken,
  });

  return oauth2Client;
}

/**
 * Create a Google Calendar client
 */
export function createGoogleCalendarClient(googleAccount: { accessToken: string | null; refreshToken: string | null }) {
  const oauth2Client = createGoogleOAuth2Client(googleAccount);
  return google.calendar({ version: 'v3', auth: oauth2Client });
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
export function createGoogleGmailClient(googleAccount: { accessToken: string | null; refreshToken: string | null }) {
  const oauth2Client = createGoogleOAuth2Client(googleAccount);
  return google.gmail({ version: 'v1', auth: oauth2Client });
}