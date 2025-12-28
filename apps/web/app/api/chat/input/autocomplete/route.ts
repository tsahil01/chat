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

  const system = `Complete the user's typing by continuing their sentence/question naturally. Do NOT provide answers or solutions.
${firstMessage ? `Context: ${firstMessage}` : ""}

Rules:
- Continue typing only, never answer the question
- Keep same meaning and structure
- 3-10 words max
${firstMessage ? "- Consider the first message context" : ""}

Examples:
- "How to stay positive" → "when feeling stressed" (NOT an answer)
- "Explain quantum" → "physics" (NOT an explanation)

Return only the continuation text.`;

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
    messages: await convertToModelMessages([message]),
    maxOutputTokens: 30,
  });

  return Response.json({
    assistantMessage: result.text,
  });
}
