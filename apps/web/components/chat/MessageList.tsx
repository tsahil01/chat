'use client';

import { UIMessage } from 'ai';
import { RefObject } from 'react';
import { MessageItem } from '@/components/chat/MessageItem';

type MessageListProps = {
  messages: UIMessage[];
  isReasoningCollapsed: (key: string) => boolean;
  onToggleReasoning: (messageId: string, partIndex: number) => void;
  onRetry: (messageId: string) => void;
  chatEndRef: RefObject<HTMLDivElement | null>;
};

export function MessageList({ messages, isReasoningCollapsed, onToggleReasoning, onRetry, chatEndRef }: MessageListProps) {
  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isReasoningCollapsed={isReasoningCollapsed}
          onToggleReasoning={onToggleReasoning}
          onRetry={onRetry}
          isLastAssistant={message.role === 'assistant' && message.id === lastAssistantId}
        />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}


