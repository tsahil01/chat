interface Models {
    model: string;
    provider: string;
}

const models: Models[] = [{
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

export default models;