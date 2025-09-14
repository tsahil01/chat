import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

interface ToolPartProps {
  part: {
    type: string;
    state: string;
  };
  messageId: string;
  partIndex: number;
}

export function ToolPart({ part, messageId, partIndex }: ToolPartProps) {
  return (
    <div
      key={`${messageId}-${partIndex}`}
      className="bg-background/50 border rounded-lg p-2 text-sm font-mono max-w-xl"
    >
      <div className="flex items-center gap-2">
        <span>Tool: Web Search</span>
        {part.state !== 'output-available' && (
          <Spinner variant="ring" size={16} />
        )}
      </div>
    </div>
  );
}
