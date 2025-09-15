'use client';

import { MessageActions } from '@/components/message-actions';
import { UIMessage } from 'ai';

type AssistantActionsProps = {
  message: UIMessage;
  onRetry: (messageId: string) => void;
};

export function AssistantActions({ message, onRetry }: AssistantActionsProps) {
  return (
    <MessageActions
      onCopy={() => {
        const textParts = message.parts
          .filter(p => p.type === 'text' && 'text' in p)
          .map(p => (p as any).text)
          .join('');
        navigator.clipboard.writeText(textParts);
      }}
      onRetry={() => onRetry(message.id)}
    />
  );
}


