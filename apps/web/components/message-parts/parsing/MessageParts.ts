export type MessagePart =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language?: string; unfinished?: boolean };

const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g;

export function parseCodeBlocks(text: string): MessagePart[] {
  CODE_BLOCK_REGEX.lastIndex = 0;
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CODE_BLOCK_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({ type: "text", content: textContent });
      }
    }

    const language = match[1] || "text";
    const code = match[2]?.trim() || "";
    parts.push({ type: "code", content: code, language });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const unfinishedMatch = /^[\s\S]*?```(\w+)?\n([\s\S]*)$/m.exec(
      remainingText,
    );
    if (unfinishedMatch) {
      const prefix = remainingText.slice(0, unfinishedMatch.index);
      if (prefix.trim()) {
        parts.push({ type: "text", content: prefix });
      }

      const language = unfinishedMatch[1] || "text";
      const codeTail = unfinishedMatch[2] || "";
      parts.push({
        type: "code",
        content: codeTail,
        language,
        unfinished: true,
      });
    } else if (remainingText.trim()) {
      parts.push({ type: "text", content: remainingText });
    }
  }

  return parts;
}
