export interface IntegrationConfig {
  name: string;
  displayName: string;
  OAUTH_ENDPOINTS: string;
  SCOPES: string[];
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export const INTEGRATION_CONFIG: IntegrationConfig[] = [
  {
    name: "google",
    displayName: "Google Calendar",
    OAUTH_ENDPOINTS: "https://accounts.google.com/o/oauth2/v2/auth",
    SCOPES: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    clientId: process.env.NEXT_PUBLIC_INTEGRATION_GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.INTEGRATION_GOOGLE_CLIENT_SECRET as string,
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  },
  {
    name: "github",
    displayName: "GitHub",
    OAUTH_ENDPOINTS: "https://github.com/login/oauth/authorize",
    SCOPES: ["user:email", "repo", "read:user"],
    clientId: process.env.NEXT_PUBLIC_INTEGRATION_GITHUB_CLIENT_ID as string,
    clientSecret: process.env.INTEGRATION_GITHUB_CLIENT_SECRET as string,
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
  },
];
