import { createOpenAI } from "@ai-sdk/openai";

export const moonshot = createOpenAI({
  apiKey: process.env.MOONSHOT_API_KEY as string,
  baseURL: "https://api.moonshot.ai/v1",
  headers: {
    Authorization: `Bearer ${process.env.MOONSHOT_API_KEY}`,
  },
});
