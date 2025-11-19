import { ReactNode } from "react";

export const markdownComponents = {
  // Headings
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="selection:bg-primary selection:text-primary-foreground mt-4 mb-3 text-xl font-bold sm:mt-6 sm:mb-4 sm:text-2xl">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="selection:bg-primary selection:text-primary-foreground mt-3 mb-2 text-lg font-semibold sm:mt-5 sm:mb-3 sm:text-xl">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="selection:bg-primary selection:text-primary-foreground mt-3 mb-2 text-base font-medium sm:mt-4 sm:text-lg">
      {children}
    </h3>
  ),
  h4: ({ children }: { children: ReactNode }) => (
    <h4 className="selection:bg-primary selection:text-primary-foreground mt-2 mb-1 text-sm font-medium sm:mt-3 sm:mb-2 sm:text-base">
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children }: { children: ReactNode }) => (
    <p className="selection:bg-primary selection:text-primary-foreground text-sm leading-relaxed sm:text-base">
      {children}
    </p>
  ),

  // Lists
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="selection:bg-primary selection:text-primary-foreground mb-3 list-outside list-disc space-y-1 pl-4 sm:mb-4 sm:pl-6">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="selection:bg-primary selection:text-primary-foreground mb-3 list-outside list-decimal space-y-1 pl-4 sm:mb-4 sm:pl-6">
      {children}
    </ol>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="selection:bg-primary selection:text-primary-foreground m-0 text-sm sm:text-base">
      {children}
    </li>
  ),

  // Links
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/90 selection:bg-primary selection:text-primary-foreground underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),

  // Code (inline)
  code: ({ children }: { children: ReactNode }) => (
    <code className="bg-secondary text-secondary-foreground selection:bg-primary selection:text-primary-foreground rounded px-1 py-0.5 font-mono text-xs sm:px-1.5 sm:text-sm">
      {children}
    </code>
  ),

  // Strikethrough
  del: ({ children }: { children: ReactNode }) => (
    <del className="text-muted-foreground selection:bg-primary selection:text-primary-foreground">
      {children}
    </del>
  ),

  // hr
  hr: ({ children }: { children: ReactNode }) => (
    <hr className="border-border selection:bg-primary selection:text-primary-foreground my-4 border-t" />
  ),
  br: ({ children }: { children: ReactNode }) => <br />,

  // Keyboard keys
  kbd: ({ children }: { children: ReactNode }) => (
    <kbd className="bg-muted text-muted-foreground selection:bg-primary selection:text-primary-foreground inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium">
      {children}
    </kbd>
  ),

  // Details/Summary
  details: ({ children }: { children: ReactNode }) => (
    <details className="bg-secondary/30 selection:bg-primary selection:text-primary-foreground my-3 rounded border p-3">
      {children}
    </details>
  ),
  summary: ({ children }: { children: ReactNode }) => (
    <summary className="text-primary selection:bg-primary selection:text-primary-foreground cursor-pointer text-sm font-medium select-none">
      {children}
    </summary>
  ),

  // Images
  img: ({
    src,
    alt,
    title,
  }: {
    src?: string;
    alt?: string;
    title?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      title={title}
      className="max-w/full selection:bg-primary selection:text-primary-foreground my-2 h-auto rounded-lg border"
    />
  ),

  // Blockquotes
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-border text-secondary-foreground selection:bg-primary selection:text-primary-foreground my-3 border-l-2 pl-3 italic sm:my-4 sm:pl-4">
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children }: { children: ReactNode }) => (
    <div className="selection:bg-primary selection:text-primary-foreground my-3 overflow-x-auto sm:my-4">
      <table className="selection:bg-primary selection:text-primary-foreground min-w-full border text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: ReactNode }) => (
    <thead className="selection:bg-primary selection:text-primary-foreground">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children: ReactNode }) => (
    <tbody className="selection:bg-primary selection:text-primary-foreground">
      {children}
    </tbody>
  ),
  tr: ({ children }: { children: ReactNode }) => (
    <tr className="selection:bg-primary selection:text-primary-foreground border-b">
      {children}
    </tr>
  ),
  th: ({ children }: { children: ReactNode }) => (
    <th className="selection:bg-primary selection:text-primary-foreground px-2 py-1 text-left font-medium sm:px-4 sm:py-2">
      {children}
    </th>
  ),
  td: ({ children }: { children: ReactNode }) => (
    <td className="selection:bg-primary selection:text-primary-foreground px-2 py-1 sm:px-4 sm:py-2">
      {children}
    </td>
  ),
};
