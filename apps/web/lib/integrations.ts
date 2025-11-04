const OAUTH_ENDPOINTS = {
  github: 'https://github.com/login/oauth/authorize',
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
};

const SCOPES = {
  github: ['user:email', 'repo', 'read:user'],
  google: ['openid', 'email', 'profile'],
};

export function buildOAuthUrl(
  provider: 'github' | 'google',
  options?: { state?: string }
) {
  const baseUrl = OAUTH_ENDPOINTS[provider];
  if (!baseUrl) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  let clientId: string | undefined;

  if (provider === 'github') {
    clientId = process.env.NEXT_PUBLIC_INTEGRATION_GITHUB_CLIENT_ID;
  } else if (provider === 'google') {
    clientId = process.env.NEXT_PUBLIC_INTEGRATION_GOOGLE_CLIENT_ID;
  }

  if (!clientId) {
    throw new Error(`Missing client ID for ${provider}`);
  }

  const redirectUri = `${
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }/api/integrations/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES[provider].join(' '),
    response_type: 'code',
    state: options?.state || `${provider}:${Date.now()}`,
    ...(provider === 'github' && { allow_signup: 'true' }),
  });

  return `${baseUrl}?${params.toString()}`;
}

export function generateState(provider: string) {
  return `${provider}:${Date.now()}:${Math.random().toString(36).substring(7)}`;
}

export function parseState(state: string) {
  const parts = state.split(':');
  return {
    provider: parts[0],
    timestamp: parts[1],
    nonce: parts[2],
  };
}
