import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@workspace/db";

export const integrationAuth = betterAuth({
  basePath: "/api/integration-auth",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    github: {
      clientId: process.env.INTEGRATION_GITHUB_CLIENT_ID as string,
      clientSecret: process.env.INTEGRATION_GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.INTEGRATION_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.INTEGRATION_GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
});
