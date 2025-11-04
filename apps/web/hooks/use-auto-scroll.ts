import { useEffect, useRef } from "react";

interface UseAutoScrollProps {
  messages: any[];
  collapsedReasoning: Set<string>;
}

export function useAutoScroll({
  messages,
  collapsedReasoning,
}: UseAutoScrollProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-scroll reasoning containers to bottom when they expand
  useEffect(() => {
    const reasoningContainers = document.querySelectorAll(
      ".max-h-32.overflow-y-auto",
    );
    reasoningContainers.forEach((container) => {
      container.scrollTop = container.scrollHeight;
    });
  }, [collapsedReasoning]);

  return chatEndRef;
}
