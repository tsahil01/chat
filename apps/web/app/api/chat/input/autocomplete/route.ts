import { auth } from "@/lib/auth";
import { defaultModel, getSelectedModel } from "@/lib/models";
import { UIMessage } from "@/lib/types";
import { convertToModelMessages, generateText } from "ai";

export async function POST(req: Request) {
  const { query, firstMessage } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const system = `You are an intelligent autocomplete assistant. Your task is to help users complete their thoughts naturally and contextually.
${firstMessage ? `The user's first message is: ${firstMessage}` : ""}

Guidelines:
${firstMessage ? "- You might have user's first message in mind when completing the query." : ""}
- Continue the user's query seamlessly as if they were typing it themselves
- Maintain the same tone, style, and intent as the partial input
- Provide concise, helpful completions that extend the user's thought
- Do not repeat the user's input - only provide the continuation
- Keep completions brief (typically 1-3 sentences) unless a longer completion would be significantly more helpful
- Focus on being helpful, accurate, and contextually relevant
- If the input is already complete, provide a natural next thought or question

Return only the completion text, without any explanations or meta-commentary.`;

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
    assistantMessage: result.text,
  });
}
