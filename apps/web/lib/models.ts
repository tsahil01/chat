import { LanguageModel } from "ai";
import { moonshot } from "./providers/moonshot";
import { openrouter } from "./providers/openrouter";

export interface Models {
    model: string;
    provider: string;
}

export const models: Models[] = [{
    model: 'kimi-k2-turbo-preview',
    provider: 'moonshot',
},{
    model: 'nvidia/nemotron-nano-9b-v2:free',
    provider: 'openrouter',
}, {
    model: 'openai/gpt-oss-120b:free',
    provider: 'openrouter',
}, {
    model: 'openai/gpt-oss-20b:free',
    provider: 'openrouter',
}, {
    model: 'z-ai/glm-4.5-air:free',
    provider: 'openrouter',
}, {
    model: 'moonshotai/kimi-k2:free',
    provider: 'openrouter',
}];


export function getSelectedModel({model, provider}: {model: string, provider: string}): LanguageModel | undefined {
    if (!model || !provider) {
        return undefined;
    }
    switch (provider) {
        case 'moonshot':
            return moonshot(model);
        case 'openrouter':
            return openrouter(model);
        default:
            return undefined;
    }   
}