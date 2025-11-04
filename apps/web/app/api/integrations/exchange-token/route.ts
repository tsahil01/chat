import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const PROVIDER_CONFIGS = {
  github: {
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientId: process.env.INTEGRATION_GITHUB_CLIENT_ID,
    clientSecret: process.env.INTEGRATION_GITHUB_CLIENT_SECRET,
    userInfoUrl: 'https://api.github.com/user',
  },
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: process.env.INTEGRATION_GOOGLE_CLIENT_ID,
    clientSecret: process.env.INTEGRATION_GOOGLE_CLIENT_SECRET,
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, code } = body;

    if (!provider || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, code' },
        { status: 400 }
      );
    }

    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    if (!config) {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    // Get user info from provider
    const userResponse = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();
    const email = userData.email || userData.mail || null;

    // Calculate expiration time
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : new Date(Date.now() + 3600000); // Default to 1 hour

    return NextResponse.json({
      success: true,
      tokens: {
        provider,
        email,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error exchanging OAuth token:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to exchange token',
      },
      { status: 500 }
    );
  }
}
