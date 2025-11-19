import { Button } from "@workspace/ui/components/button";
import { Copy, RefreshCcw } from "lucide-react";

interface MessageActionsProps {
  onCopy: () => void;
  onRetry: () => void;
  showRetry?: boolean;
}

export function MessageActions({
  onCopy,
  onRetry,
  showRetry,
}: MessageActionsProps) {
  return (
    <div className="text-muted-foreground flex items-center justify-end gap-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4" />
      </Button>
      {showRetry && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onRetry}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
