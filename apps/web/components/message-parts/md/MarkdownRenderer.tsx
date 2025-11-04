import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDeflist from "remark-deflist";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "./MarkdownComponents";
import { MathJaxTypesetter } from "./MathJaxTypesetter";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <MathJaxTypesetter>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDeflist]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents as any}
      >
        {content}
      </ReactMarkdown>
    </MathJaxTypesetter>
  );
}
