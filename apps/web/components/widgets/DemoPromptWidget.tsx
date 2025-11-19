"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { PROMPTS, Prompts } from "@/lib/prompts/demo-prompts";

export function DemoPromptWidget({ className }: { className?: string }) {
  const router = useRouter();
  const prompt: Prompts = useMemo(() => {
    return (
      PROMPTS[Math.floor(Math.random() * PROMPTS.length)] ?? {
        title: "",
        prompt: "",
        personality: "",
      }
    );
  }, []);

  function handleClick() {
    const encodedInput = encodeURIComponent(prompt.prompt);
    const encodedPersonality = encodeURIComponent(
      (prompt.personality?.toLowerCase() ?? "") || "",
    );
    const newChatId = generateUUID();
    router.replace(
      `/chat/${newChatId}?input=${encodedInput}&personality=${encodedPersonality}`,
      {
        scroll: false,
      },
    );
  }

  return (
    <Card className={`${className} cursor-pointer`} onClick={handleClick}>
      <CardHeader>
        <CardTitle>Try this</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-baseline gap-1.5 sm:gap-2">
          <div className="text-muted-foreground text-xs sm:text-sm">
            Tap to prefill
          </div>
          <div className="line-clamp-3 text-base leading-snug font-medium sm:text-lg">
            {prompt.title}
          </div>
          <div className="text-muted-foreground text-xs sm:text-sm">
            Ask AI to help you
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DemoPromptWidget;
