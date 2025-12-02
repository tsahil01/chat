"use client";

import { FileUIPart } from "ai";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { TextPart } from "@/components/message-parts/text-part";
import { ToolPart } from "@/components/message-parts/tool-part";
import { ReasoningPart } from "@/components/message-parts/reasoning-part";
import { FilePart } from "@/components/message-parts/file-part";
import { AssistantActions } from "@/components/chat/AssistantActions";
import { authClient } from "@/lib/auth-client";
import { UIMessage } from "@/lib/types";
import { UserActions } from "./UserActions";
import { useState } from "react";

type MessageItemProps = {
  message: UIMessage;
  isReasoningCollapsed: (key: string) => boolean;
  onToggleReasoning: (messageId: string, partIndex: number) => void;
  onRetry: (messageId: string) => void;
  isLastAssistant?: boolean;
  showRetry?: boolean;
};

export function MessageItem({
  message,
  isReasoningCollapsed,
  onToggleReasoning,
  onRetry,
  isLastAssistant,
  showRetry = true,
}: MessageItemProps) {
  const { data } = authClient.useSession();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {(() => {
        const attachments =
          message.attachments && message.attachments.length > 0
            ? message.attachments
            : message.parts.filter((part) => part.type === "file");
        return attachments.map((attachment: FileUIPart, i: number) => {
          return (
            <FilePart
              key={`${message.id}-${i}`}
              attachment={attachment}
              messageId={message.id}
              partIndex={i}
            />
          );
        });
      })()}
      <div
        className={`flex flex-col items-end gap-2 sm:gap-3 md:flex-row`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="item-start flex w-full gap-2 sm:gap-3">
          {message.role === "user" && (
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={data?.user?.image || ""} />
                <AvatarFallback className="text-xs">
                  {data?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div
            className={`space-y-2 ${message.role === "user" ? "w-auto max-w-[85%] sm:max-w-xl" : "w-full"}`}
          >
            <div
              className={`w-full rounded-xl px-3 py-2 shadow-sm sm:px-4 sm:py-2 ${message.role === "user" ? "bg-muted text-foreground w-auto rounded-tl-sm" : "text-foreground"}`}
            >
              <div className="space-y-2 sm:space-y-3">
                {message.parts.map((part, i: number) => {
                  switch (part.type) {
                    case "text":
                      // Render user messages as plain text, assistant messages as markdown
                      if (message.role === "user") {
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="max-h-90 overflow-y-auto whitespace-pre-wrap"
                          >
                            {part.text}
                          </div>
                        );
                      } else {
                        return (
                          <TextPart
                            key={`${message.id}-${i}`}
                            text={part.text}
                            messageId={message.id}
                            partIndex={i}
                          />
                        );
                      }
                    case "tool-result": {
                      const toolName =
                        "toolName" in part && typeof part.toolName === "string"
                          ? part.toolName
                          : "Unknown Tool";
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName={toolName}
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    }
                    case "tool-exaWebSearch":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Web Search"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-parallelWebSearch":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Web Search"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-createCalendarEvent":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Create Calendar Event"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-listCalendarEvents":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="List Calendar Events"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-checkCalendarAvailability":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Check Calendar Availability"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-deleteCalendarEvent":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Delete Calendar Event"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-listGitHubRepos":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="List GitHub Repos"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-createGitHubRepo":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Create GitHub Repo"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-getGitHubRepoInfo":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Get GitHub Repo Info"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-listGitHubIssues":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="List GitHub Issues"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-createGitHubIssue":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Create GitHub Issue"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-getGitHubIssue":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Get GitHub Issue"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-getGitHubUserInfo":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Get GitHub User Info"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-listGitHubFollowers":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="List GitHub Followers"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-listGitHubPullRequests":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="List GitHub Pull Requests"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-createGitHubPullRequest":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Create GitHub Pull Request"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-getGitHubPullRequest":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Get GitHub Pull Request"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-viewCodeDiff":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="View Code Diff"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-listEmails":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="List Emails"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-getEmail":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Get Email"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-searchEmails":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Search Emails"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "tool-sendEmail":
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          toolName="Send Email"
                          part={part}
                          messageId={message.id}
                          partIndex={i}
                        />
                      );
                    case "reasoning": {
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
            {message.role === "assistant" && (
              <>
                <AssistantActions
                  message={message}
                  onRetry={onRetry}
                  showRetry={showRetry}
                />
                {isLastAssistant && (
                  <p className="text-muted-foreground px-1 text-end text-xs">
                    AI can make mistakes. Please double-check responses.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        {message.role === "user" && (
          <UserActions
            className={isHovered ? "" : "md:hidden"}
            message={message}
            onRetry={onRetry}
            showRetry={showRetry}
          />
        )}
      </div>
    </div>
  );
}
