"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { PROMPTS, Prompts } from "@/lib/prompts/demo-prompts";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export function DemoPromptWidget({ className }: { className?: string }) {
  const [prompts, setPrompts] = useState<Prompts[]>(
    [...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 6),
  );
  const router = useRouter();

  function handleClick({ prompt }: { prompt: Prompts }) {
    const encodedInput = encodeURIComponent(prompt?.prompt ?? "");
    const encodedPersonality = encodeURIComponent(
      (prompt?.personality?.toLowerCase() ?? "") || "",
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
    <div
      className={cn(
        "flex flex-row flex-wrap items-center justify-center gap-2",
        className,
      )}
    >
      {prompts.map((prompt, index) => (
        <Button
          key={index}
          onClick={() => handleClick({ prompt })}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {prompt?.title}
        </Button>
      ))}
    </div>
  );
}

export default DemoPromptWidget;
