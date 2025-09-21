'use client';

import { FileUIPart } from 'ai';
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

  return (
    <div className="flex flex-col gap-2">
      {(() => {
        const attachments = message.attachments && message.attachments.length > 0 
          ? message.attachments 
          : message.parts.filter(part => part.type === 'file');
        return attachments.map((attachment: FileUIPart, i: number) => {
          return (
            <FilePart key={`${message.id}-${i}`} attachment={attachment} messageId={message.id} partIndex={i} />
          );
        });
      })()}
    <div className="flex gap-2 sm:gap-3 items-start">
      {message.role === 'user' && (
        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
          <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
            <AvatarImage src={data?.user?.image || ''} />
            <AvatarFallback className="text-xs">{data?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={`space-y-2 ${message.role === 'user' ? 'w-auto max-w-[85%] sm:max-w-xl' : 'w-full'}`}>
        <div className={`rounded-xl px-3 py-2 sm:px-4 sm:py-2 shadow-sm ${message.role === 'user' ? 'bg-muted text-foreground w-auto rounded-tl-sm' : 'text-foreground'}`}>
          <div className="space-y-2 sm:space-y-3">
            {message.parts.map((part, i: number) => {
              switch (part.type) {
                case 'text':
                  // Render user messages as plain text, assistant messages as markdown
                  if (message.role === 'user') {
                    return (
                      <div key={`${message.id}-${i}`} className="whitespace-pre-wrap max-h-90 overflow-y-auto">
                        {part.text}
                      </div>
                    );
                  } else {
                    return (
                      <TextPart key={`${message.id}-${i}`} text={part.text} messageId={message.id} partIndex={i} />
                    );
                  }
                case 'tool-exaWebSearch':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Web Search" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-createCalendarEvent':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Create Calendar Event" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-listCalendarEvents':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="List Calendar Events" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-checkCalendarAvailability':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Check Calendar Availability" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-listGitHubRepos':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="List GitHub Repos" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-createGitHubRepo':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Create GitHub Repo" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-getGitHubRepoInfo':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Get GitHub Repo Info" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-listGitHubIssues':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="List GitHub Issues" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-createGitHubIssue':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Create GitHub Issue" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-getGitHubIssue':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Get GitHub Issue" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-getGitHubUserInfo':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="Get GitHub User Info" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'tool-listGitHubFollowers':
                  return (
                    <ToolPart key={`${message.id}-${i}`} toolName="List GitHub Followers" part={part} messageId={message.id} partIndex={i} />
                  );
                case 'reasoning': {
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
                }
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
              <p className="text-xs text-muted-foreground text-end px-1">AI can make mistakes. Please double-check responses.</p>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
}


