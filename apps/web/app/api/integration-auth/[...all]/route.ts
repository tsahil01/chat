import { toNextJsHandler } from "better-auth/next-js";
import { integrationAuth } from "@/lib/integration-auth";

export const { GET, POST } = toNextJsHandler(integrationAuth.handler);



