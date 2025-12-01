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
    <div
      key={`${messageId}-${partIndex}`}
      className="w-full max-w-full min-w-0"
    >
      {parts.map((part, index) => {
        if (part.type === "code") {
          const language = part.language || "text";
          const filename = `code.${language}`;

          return (
            <div
              key={`code-${messageId}-${partIndex}-${index}`}
              className="max-w-xs min-w-0 overflow-x-scroll md:max-w-full"
            >
              <LightCodeBlock
                language={language}
                filename={filename}
                code={part.content}
                syntaxHighlighting={!part.unfinished}
                lineNumbers={true}
              />
            </div>
          );
        }

        return (
          <div key={`text-${messageId}-${partIndex}-${index}`}>
            <MarkdownRenderer content={part.content} />
          </div>
        );
      })}
    </div>
  );
}
