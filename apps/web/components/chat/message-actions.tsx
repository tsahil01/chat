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
    <div className="flex justify-end items-center gap-2 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onCopy}
      >
        <Copy className="w-4 h-4" />
      </Button>
      {showRetry && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onRetry}
        >
          <RefreshCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
