"use client";

import { useState } from "react";
import { PROMPTS, Prompts } from "@/lib/prompts/demo-prompts";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface DemoPromptWidgetProps {
  className?: string;
  setInput: (input: string) => void;
  setPersonality: (personality: string) => void;
}

export function DemoPromptWidget({
  className,
  setInput,
  setPersonality,
}: DemoPromptWidgetProps) {
  const [prompts, setPrompts] = useState<Prompts[]>(
    [...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 6),
  );

  function handleClick({ prompt }: { prompt: Prompts }) {
    setInput(prompt?.prompt ?? "");
    setPersonality(prompt?.personality?.toLowerCase() ?? "");
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
