"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";

interface Prompts {
  title: string;
  prompt: string;
}

const PROMPTS: Prompts[] = [
  { title: "How do I learn a backflip safely?", prompt: "Hey, I'm trying to learn a backflip but I'm afraid of getting hurt. Can you help me?" },
  { title: "What's the latest news?", prompt: "Find the top 5 news stories and summarize them." },
  { title: "Analyze this job description and provide a job fit analysis based on my LinkedIn", prompt: "Hey, I'm looking for a new job and I found this job description. Can you analyze it and provide a job fit analysis based on my LinkedIn profile? I will provide the job description and my LinkedIn profile next." },
  { title: "Create a 7-day workout split for a beginner runner + strength", prompt: "Hey, I'm a beginner runner and I'm looking for a 7-day workout split for a beginner runner + strength. Can you create a 7-day workout split for me?" },
  { title: "Brainstorm 5 naming options for a product with pros/cons", prompt: "Hey, I'm brainstorming 5 naming options for a product with pros/cons. Can you brainstorm 5 naming options for me?" },
  { title: "Generate a SQLite schema and 3 sample queries for an app", prompt: "Hey, Help me generate a SQLite schema and 3 sample queries for an app." },
  { title: "Rewrite this paragraph for clarity and brevity", prompt: "Hey, I'm rewriting this paragraph for clarity and brevity. Can you rewrite this paragraph for me?" },
  { title: "Outline a 30-minute meeting agenda for a goal", prompt: "Hey, Help me outline a 30-minute meeting agenda for a goal." },
  { title: "Translate to concise business English", prompt: "Hey, Help me translate this to concise business English." },
];

export function DemoPromptWidget({ className }: { className?: string }) {
  const router = useRouter();
  const prompt: Prompts = useMemo(() => {
    return PROMPTS[Math.floor(Math.random() * PROMPTS.length)] ?? { title: "", prompt: "" };
  }, []);

  function handleClick() {
    const encodedInput = encodeURIComponent(prompt.prompt);
    const newChatId = generateUUID();
    router.replace(`/chat/${newChatId}?input=${encodedInput}`, { scroll: false });
  }

  return (
    <Card className={`${className} cursor-pointer`} onClick={handleClick}>
      <CardHeader>
        <CardTitle>Try this</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-baseline gap-1.5 sm:gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground">Tap to prefill</div>
          <div className="text-base sm:text-lg font-medium leading-snug line-clamp-3">{prompt.title}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Ask AI to help you</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DemoPromptWidget;


