"use client";

import { UIDataTypes, UIMessage, UITools } from "ai";
import { RefObject } from "react";
import { MessageItem } from "@/components/chat/MessageItem";
import { cn } from "@workspace/ui/lib/utils";

type MessageListProps = {
  className?: string;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  isReasoningCollapsed: (key: string) => boolean;
  onToggleReasoning: (messageId: string, partIndex: number) => void;
  onRetry: (messageId: string) => void;
  chatEndRef: RefObject<HTMLDivElement | null>;
};

export function MessageList({
  className,
  messages,
  isReasoningCollapsed,
  onToggleReasoning,
  onRetry,
  chatEndRef,
}: MessageListProps) {
  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className={cn("space-y-6", className)}>
      {messages.map((message: UIMessage<unknown, UIDataTypes, UITools>) => (
        <MessageItem
          key={message.id}
          message={message}
          isReasoningCollapsed={isReasoningCollapsed}
          onToggleReasoning={onToggleReasoning}
          onRetry={onRetry}
          isLastAssistant={
            message.role === "assistant" && message.id === lastAssistantId
          }
        />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}
