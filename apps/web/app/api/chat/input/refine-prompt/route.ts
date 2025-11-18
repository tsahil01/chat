import { auth } from "@/lib/auth";
import { defaultModel, getSelectedModel } from "@/lib/models";
import { UIMessage } from "@/lib/types";
import { convertToModelMessages, generateText } from "ai";

export async function POST(req: Request) {
  const { query } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const system = `You are an intelligent prompt refinement assistant. Your task is to help users refine their prompt naturally and contextually. User will provide a prompt and you will refine it.

Guidelines:
- Refine the user's prompt to be more specific and clear
- Keep the prompt brief (typically 1-3 sentences) unless a longer prompt would be significantly more helpful
- Focus on being helpful, accurate, and contextually relevant
- If the prompt is already specific and clear, provide a natural next thought or question
- Never use markdown formatting and em dashes in the prompt
- Do not change the user's intent or purpose of the prompt

Return only the refined prompt text, without any explanations or meta-commentary.`;

  const message = {
    role: "user",
    parts: [{ type: "text", text: query }],
    id: "user",
    createdAt: new Date(),
  } as UIMessage;

  const result = await generateText({
    model: getSelectedModel({
      model: defaultModel!.model,
      provider: defaultModel!.provider,
    })!,
    system,
    messages: convertToModelMessages([message]),
    maxOutputTokens: 30,
  });

  return Response.json({
    refinedPrompt: result.text,
  });
}
