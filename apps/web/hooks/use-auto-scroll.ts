import { useEffect, useRef } from "react";

interface UseAutoScrollProps {
  messages: any[];
  collapsedReasoning: Set<string>;
}

const SCROLL_THRESHOLD = 100;

function isNearBottom(element: HTMLElement): boolean {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  return distanceFromBottom <= SCROLL_THRESHOLD;
}

export function useAutoScroll({
  messages,
  collapsedReasoning,
}: UseAutoScrollProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatEndRef.current) return;

    const scrollableContainer = chatEndRef.current.closest(
      ".overflow-y-auto",
    ) as HTMLElement | null;

    if (!scrollableContainer) return;

    if (isNearBottom(scrollableContainer)) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
