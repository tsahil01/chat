import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@workspace/db";
import { INTEGRATION_CONFIG } from "./integration-config";

export const integrationAuth = betterAuth({
  basePath: "/api/integration-auth",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    ...Object.fromEntries(
      INTEGRATION_CONFIG.map((config) => [
        config.name,
        {
          clientId: config.clientId as string,
          clientSecret: config.clientSecret as string,
        },
      ])
    ),
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
});
