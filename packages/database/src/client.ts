import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from root directory
// Always load .env in development and build, Vercel will provide env vars in production
config({ path: resolve(process.cwd(), "../../.env") });

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    accelerateUrl: connectionString,
  }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
