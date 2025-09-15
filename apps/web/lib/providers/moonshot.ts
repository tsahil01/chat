import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const moonshot = createOpenRouter({
  apiKey: process.env.MOONSHOT_API_KEY as string,
  baseURL: 'https://api.moonshot.ai/v1',
  headers: {
    'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
  },
});