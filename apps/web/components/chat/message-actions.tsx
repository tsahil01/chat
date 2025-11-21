import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Copy, RefreshCcw } from "lucide-react";

interface MessageActionsProps {
  className?: string;
  onCopy: () => void;
  onRetry: () => void;
  showRetry?: boolean;
}

export function MessageActions({
  className,
  onCopy,
  onRetry,
  showRetry,
}: MessageActionsProps) {
  return (
    <div className={cn("text-muted-foreground flex items-center justify-end gap-1 text-sm", className)}>
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
