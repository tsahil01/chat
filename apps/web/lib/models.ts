import { LanguageModel } from "ai";
import { moonshot } from "./providers/moonshot";
import { openrouter } from "./providers/openrouter";

export interface Models {
  model: string;
  displayName: string;
  provider: string;
  thinking: boolean;
  tags?: string[];
  fileSupport: boolean;
  toolSupport: boolean;
}

export const models: Models[] = [
  {
    model: "openai/gpt-oss-20b:free",
    displayName: "GPT-OSS 20B",
    provider: "openrouter",
    thinking: false,
    fileSupport: false,
    toolSupport: true,
    tags: ["Fast"],
  },
  {
    model: "x-ai/grok-4.1-fast",
    displayName: "Grok 4.1 Fast",
    provider: "openrouter",
    thinking: false,
    fileSupport: false,
    toolSupport: true,
    tags: ["Fast"],
  },
  {
    model: "kimi-k2-turbo-preview",
    displayName: "Kimi K2",
    provider: "moonshot",
    thinking: false,
    tags: ["Fast"],
    fileSupport: false,
    toolSupport: true,
  },
  {
    model: "moonshotai/kimi-k2-thinking",
    displayName: "Kimi K2 Thinking",
    provider: "openrouter",
    thinking: true,
    fileSupport: false,
    toolSupport: true,
    tags: ["Fast"],
  },
  {
    model: "z-ai/glm-4.5-air:free",
    displayName: "Z-AI GLM 4.5 Air",
    provider: "openrouter",
    thinking: true,
    fileSupport: false,
    toolSupport: true,
  },
  {
    model: "google/gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    provider: "openrouter",
    thinking: false,
    fileSupport: true,
    toolSupport: true,
  },
  {
    model: "google/gemini-2.5-flash-lite-preview-09-2025",
    displayName: "Gemini 2.5 Flash Lite",
    provider: "openrouter",
    thinking: false,
    fileSupport: true,
    toolSupport: true,
  },
  {
    model: "google/gemini-2.5-flash-image",
    displayName: "Gemini 2.5 Flash Image",
    provider: "openrouter",
    thinking: false,
    fileSupport: true,
    toolSupport: false,
  },
];

export const defaultModel = models[0];

export function getSelectedModel({
  model,
  provider,
}: {
  model: string;
  provider: string;
}): LanguageModel | undefined {
  if (!model || !provider) {
    return undefined;
  }
  switch (provider) {
    case "moonshot":
      return moonshot.chat(model);
    case "openrouter":
      return openrouter(model);
    default:
      return undefined;
  }
}
