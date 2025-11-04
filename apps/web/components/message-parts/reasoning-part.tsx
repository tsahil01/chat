import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/ui/shadcn-io/spinner";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReasoningPartProps {
  part: {
    type: string;
    text: string;
    state?: string;
  };
  messageId: string;
  partIndex: number;
  isCollapsed: boolean;
  onToggle: (messageId: string, partIndex: number) => void;
}

export function ReasoningPart({
  part,
  messageId,
  partIndex,
  isCollapsed,
  onToggle,
}: ReasoningPartProps) {
  return (
    <div
      key={`${messageId}-${partIndex}`}
      className="border rounded-lg bg-muted/30 max-w-xl"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(messageId, partIndex)}
        className="w-full justify-between p-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <div className="flex items-center gap-2">
          <span>Reasoning</span>
          {part.state && part.state !== "done" && (
            <Spinner variant="default" size={16} />
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </Button>
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="max-h-32 overflow-y-auto text-sm opacity-70 italic whitespace-pre-wrap">
            {part.text}
          </div>
        </div>
      )}
    </div>
  );
}
