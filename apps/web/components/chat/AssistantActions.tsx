"use client";

import { MessageActions } from "@/components/chat/message-actions";
import { UIMessage } from "ai";

type AssistantActionsProps = {
  className?: string;
  message: UIMessage;
  onRetry: (messageId: string) => void;
  showRetry?: boolean;
};

export function AssistantActions({
  className,
  message,
  onRetry,
  showRetry,
}: AssistantActionsProps) {
  return (
    <MessageActions
      className={className}
      onCopy={() => {
        const textParts = message.parts
          .filter((p) => p.type === "text" && "text" in p)
          .map((p) => (p as any).text)
          .join("");
        navigator.clipboard.writeText(textParts);
      }}
      onRetry={() => onRetry(message.id)}
      showRetry={showRetry}
    />
  );
}
