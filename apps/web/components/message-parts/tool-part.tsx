import { Spinner } from "@workspace/ui/components/ui/shadcn-io/spinner";

interface ToolPartProps {
  toolName: string;
  part: {
    type: string;
    state: string;
  };
  messageId: string;
  partIndex: number;
}

export function ToolPart({
  toolName,
  part,
  messageId,
  partIndex,
}: ToolPartProps) {
  

  function parseToolName(toolName: string) {
    if (toolName.includes("WebSearch")) {
      return "Web Search";
    }
    if (toolName.includes("CreateCalendarEvent")) {
      return "Create Calendar Event";
    }
    if (toolName.includes("ListCalendarEvents")) {
      return "List Calendar Events";
    }
    if (toolName.includes("CheckCalendarAvailability")) {
      return "Check Calendar Availability";
  }
    if (toolName.includes("ViewCodeDiff")) {
      return "View Code Diff";
    }
    if (toolName.includes("ListEmails")) {
      return "List Emails";
    }
    if (toolName.includes("GetEmail")) {
      return "Get Email";
    }
    if (toolName.includes("SearchEmails")) {
      return "Search Emails";
    }
    if (toolName.includes("SendEmail")) {
      return "Send Email";
    }
    if (toolName.includes("ListGitHubIssues")) {
      return "List GitHub Issues";
    }
    if (toolName.includes("CreateGitHubIssue")) {
      return "Create GitHub Issue";
    }
    if (toolName.includes("GetGitHubIssue")) {
      return "Get GitHub Issue";
    }
    if (toolName.includes("GetGitHubUserInfo")) {
      return "Get GitHub User Info";
    }
    return toolName;
  } 

  return (
    <div
      key={`${messageId}-${partIndex}`}
      className="bg-background/50 max-w-xl rounded-lg border p-2 font-mono text-sm"
    >
      <div className="flex items-center gap-2">
        <span>Tool: {parseToolName(toolName)}</span>
        {part.state !== "output-available" && part.type !== "tool-result" && (
          <Spinner variant="ring" size={16} />
        )}
      </div>
    </div>
  );
}
