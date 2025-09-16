import { LightCodeBlock } from "@workspace/ui/components/code-block-lite";
import { parseCodeBlocks } from "./parsing/MessageParts";
import { MarkdownRenderer } from "./md/MarkdownRenderer";

interface TextPartProps {
  text: string;
  messageId: string;
  partIndex: number;
}

export function TextPart({ text, messageId, partIndex }: TextPartProps) {
  const parts = parseCodeBlocks(text);

  return (
    <div key={`${messageId}-${partIndex}`} className="max-w-none">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          const language = part.language || 'text';
          const filename = `code.${language}`;

          return (
            <LightCodeBlock
              key={`code-${index}`}
              language={language}
              filename={filename}
              code={part.content}
              syntaxHighlighting={!part.unfinished}
              lineNumbers={true}
            />
          );
        }

        return (
          <div key={`text-${index}`}>
            <MarkdownRenderer content={part.content} />
          </div>
        );
      })}
    </div>
  );
}
