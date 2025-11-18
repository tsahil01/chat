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

  const system = `Improve the prompt's clarity and specificity while preserving its EXACT meaning and intent.

Rules:
- Do NOT change meaning, intent, or what user is asking
- Only improve clarity and wording
- Make vague terms specific ("better" → "more efficient")
- Keep same tone and style
- No markdown or em dashes
- Keep brief (1-3 sentences)

Return only the refined prompt.`;

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
