export interface Prompts {
  title: string;
  prompt: string;
  personality?: string;
}

export const PROMPTS: Prompts[] = [
  {
    title: "Learn a backflip safely",
    prompt:
      "Hey, I'm trying to learn a backflip but I'm afraid of getting hurt. Can you help me?",
  },
  {
    title: "Latest news",
    prompt: "Find the top 5 news stories and summarize them.",
    personality: "news",
  },
  {
    title: "Job fit analysis",
    prompt:
      "Hey, I'm looking for a new job and I found this job description. Can you analyze it and provide a job fit analysis based on my LinkedIn profile? I will provide the job description and my LinkedIn profile next.",
    personality: "career",
  },
  {
    title: "7-day workout plan",
    prompt:
      "Hey, I'm a beginner runner and I'm looking for a 7-day workout split for a beginner runner + strength. Can you create a 7-day workout split for me?",
    personality: "fitness",
  },
  {
    title: "Product name ideas",
    prompt:
      "Hey, I'm brainstorming 5 naming options for a product with pros/cons. Can you brainstorm 5 naming options for me?",
    personality: "creative",
  },
  {
    title: "SQLite schema & queries",
    prompt:
      "Hey, Help me generate a SQLite schema and 3 sample queries for an app.",
    personality: "tech",
  },
  {
    title: "Rewrite for clarity",
    prompt:
      "Hey, I'm rewriting this paragraph for clarity and brevity. Can you rewrite this paragraph for me?",
    personality: "creative",
  },
  {
    title: "Meeting agenda",
    prompt: "Hey, Help me outline a 30-minute meeting agenda for a goal.",
  },
  {
    title: "Business English translation",
    prompt: "Hey, Help me translate this to concise business English.",
    personality: "communicator",
  },
];
