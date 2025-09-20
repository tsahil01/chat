import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@workspace/db';

/**
 * Get GitHub account tokens for a user
 */
export async function getGitHubTokens(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      providerId: 'github'
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
 * Get GitHub account for the current user
 */
export async function getCurrentUserGitHubAccount() {
  const session = await getCurrentSession();
  const githubAccount = await getGitHubTokens(session.user.id);

  if (!githubAccount || !githubAccount.accessToken) {
    throw new Error("To use GitHub services, you need to link your GitHub account. Please use the go to the integrations page and link your GitHub account.");
  }

  return { session, githubAccount };
}

/**
 * Make unauthenticated GitHub API request (for public data)
 */
export async function makePublicGitHubRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'YourApp/1.0',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Try authenticated GitHub request first, fallback to public if no auth
 */
export async function makeGitHubRequestWithFallback(endpoint: string, options: RequestInit = {}) {
  try {
    // Try authenticated request first
    return await makeGitHubRequest(endpoint, options);
  } catch (error: any) {
    // If auth fails (user not authenticated or no GitHub account), try public
    if (error.message.includes('not authenticated') || error.message.includes('link your GitHub account')) {
      return await makePublicGitHubRequest(endpoint, options);
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Make authenticated GitHub API request
 */
export async function makeGitHubRequest(endpoint: string, options: RequestInit = {}) {
  const { githubAccount } = await getCurrentUserGitHubAccount();

  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${githubAccount.accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'YourApp/1.0',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Handle GitHub API errors with consistent formatting
 */
export function handleGitHubError(error: any, operation: string): string {
  if (error.message.includes('not authenticated')) {
    return "Error: Please sign in to use GitHub features.";
  }
  if (error.message.includes('link your GitHub account')) {
    return error.message;
  }
  console.error(`GitHub ${operation} error:`, error);
  return `❌ Failed to ${operation}: ${error.message}`;
}