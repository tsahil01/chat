import { LanguageModel } from "ai";
import { moonshot } from "./providers/moonshot";
import { openrouter } from "./providers/openrouter";

export interface Models {
  model: string;
  displayName: string;
  provider: string;
  fileSupport: boolean;
}

export const models: Models[] = [
  {
    model: "kimi-k2-turbo-preview",
    displayName: "kimi k2 turbo",
    provider: "moonshot",
    fileSupport: false,
  },
  {
    model: "nvidia/nemotron-nano-9b-v2:free",
    displayName: "nvidia nemotron nano",
    provider: "openrouter",
    fileSupport: false,
  },
  {
    model: "z-ai/glm-4.5-air:free",
    displayName: "z-ai glm 4.5 air",
    provider: "openrouter",
    fileSupport: false,
  },
  {
    model: "moonshotai/kimi-k2:free",
    displayName: "kimi k2",
    provider: "openrouter",
    fileSupport: false,
  },
  {
    model: "google/gemini-2.5-flash",
    displayName: "gemini 2.5 flash",
    provider: "openrouter",
    fileSupport: true,
  },
];

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
