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
    model: "kimi-k2-turbo-preview",
    displayName: "kimi k2 turbo",
    provider: "moonshot",
    thinking: false,
    tags: ["Fast"],
    fileSupport: false,
    toolSupport: true,
  },
  {
    model: "moonshotai/kimi-k2-thinking",
    displayName: "kimi k2 thinking",
    provider: "openrouter",
    thinking: true,
    fileSupport: false,
    toolSupport: true,
  },
  {
    model: "nvidia/nemotron-nano-9b-v2:free",
    displayName: "nvidia nemotron nano",
    provider: "openrouter",
    thinking: true,
    fileSupport: false,
    toolSupport: true,
  },
  {
    model: "z-ai/glm-4.5-air:free",
    displayName: "z-ai glm 4.5 air",
    provider: "openrouter",
    thinking: true,
    fileSupport: false,
    toolSupport: true,
  },
  {
    model: "google/gemini-2.5-flash",
    displayName: "gemini 2.5 flash",
    provider: "openrouter",
    thinking: false,
    fileSupport: true,
    toolSupport: true,
  },
  {
    model: "google/gemini-2.5-flash-image",
    displayName: "gemini 2.5 flash image",
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
      return moonshot(model);
    case "openrouter":
      return openrouter(model);
    default:
      return undefined;
  }
}
