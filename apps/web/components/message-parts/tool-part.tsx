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
  return (
    <div
      key={`${messageId}-${partIndex}`}
      className="bg-background/50 max-w-xl rounded-lg border p-2 font-mono text-sm"
    >
      <div className="flex items-center gap-2">
        <span>Tool: {toolName}</span>
        {part.state !== "output-available" && (
          <Spinner variant="ring" size={16} />
        )}
      </div>
    </div>
  );
}
