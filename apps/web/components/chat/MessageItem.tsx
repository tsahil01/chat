'use client';

import { FileUIPart, UIDataTypes, UITools } from 'ai';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { TextPart } from '@/components/message-parts/text-part';
import { ToolPart } from '@/components/message-parts/tool-part';
import { ReasoningPart } from '@/components/message-parts/reasoning-part';
import { FilePart } from '@/components/message-parts/file-part';
import { AssistantActions } from '@/components/chat/AssistantActions';
import { authClient } from '@/lib/auth-client';
import { UIMessage } from '@/lib/types';

type MessageItemProps = {
  message: UIMessage;
  isReasoningCollapsed: (key: string) => boolean;
  onToggleReasoning: (messageId: string, partIndex: number) => void;
  onRetry: (messageId: string) => void;
  isLastAssistant?: boolean;
};

export function MessageItem({ message, isReasoningCollapsed, onToggleReasoning, onRetry, isLastAssistant }: MessageItemProps) {
  const { data } = authClient.useSession();
  console.log('message', message);

  return (
    <div className="flex flex-col gap-2">
      {message.attachments && message.attachments.map((attachment: FileUIPart, i: number) => {
        return (
          <FilePart key={`${message.id}-${i}`} attachment={attachment} messageId={message.id} partIndex={i} />
        );
      })}
    <div className="flex gap-3">
      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center my-auto">
          <Avatar>
            <AvatarImage src={data?.user?.image || ''} />
            <AvatarFallback className="text-xs">{data?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={`space-y-2 ${message.role === 'user' ? 'w-auto' : 'w-full'}`}>
        <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-muted text-foreground max-w-xl w-auto' : 'text-foreground'}`}>
          <div className="space-y-3">
            {message.parts.map((part, i: number) => {
              switch (part.type) {
                case 'text':
                  return (
                    <TextPart key={`${message.id}-${i}`} text={part.text} messageId={message.id} partIndex={i} />
                  );
                case 'tool-exaWebSearch':
                  return (
                    <ToolPart key={`${message.id}-${i}`} part={part} messageId={message.id} partIndex={i} />
                  );
                case 'reasoning':
                  const reasoningKey = `${message.id}-${i}`;
                  const collapsed = isReasoningCollapsed(reasoningKey);
                  return (
                    <ReasoningPart
                      key={`${message.id}-${i}`}
                      part={part}
                      messageId={message.id}
                      partIndex={i}
                      isCollapsed={collapsed}
                      onToggle={onToggleReasoning}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>

        {message.role === 'assistant' && (
          <>
            <AssistantActions message={message} onRetry={onRetry} />
            {isLastAssistant && (
              <p className="text-xs text-muted-foreground text-end">AI can make mistakes. Please double-check responses.</p>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
}


