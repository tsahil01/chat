interface TextPartProps {
  text: string;
  messageId: string;
  partIndex: number;
}

export function TextPart({ text, messageId, partIndex }: TextPartProps) {
  return (
    <div key={`${messageId}-${partIndex}`} className="">
      {text}
    </div>
  );
}
