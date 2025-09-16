import { ReactNode } from 'react';

export const markdownComponents = {
  // Headings
  h1: ({ children }: { children: ReactNode }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
  h2: ({ children }: { children: ReactNode }) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
  h3: ({ children }: { children: ReactNode }) => <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>,
  h4: ({ children }: { children: ReactNode }) => <h4 className="text-base font-medium mb-2 mt-3">{children}</h4>,

  // Paragraphs
  p: ({ children }: { children: ReactNode }) => <p className="leading-relaxed">{children}</p>,

  // Lists
  ul: ({ children }: { children: ReactNode }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
  ol: ({ children }: { children: ReactNode }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
  li: ({ children }: { children: ReactNode }) => <li className="ml-2">{children}</li>,

  // Links
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a href={href} className="underline underline-offset-4 text-primary hover:text-primary/90" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),

  // Code (inline)
  code: ({ children }: { children: ReactNode }) => (
    <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-secondary-foreground">
      {children}
    </code>
  ),

  // Strikethrough
  del: ({ children }: { children: ReactNode }) => (
    <del className="text-muted-foreground">{children}</del>
  ),

  // Keyboard keys
  kbd: ({ children }: { children: ReactNode }) => (
    <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </kbd>
  ),

  // Details/Summary
  details: ({ children }: { children: ReactNode }) => (
    <details className="my-3 rounded border bg-secondary/30 p-3">
      {children}
    </details>
  ),
  summary: ({ children }: { children: ReactNode }) => (
    <summary className="cursor-pointer select-none text-sm font-medium text-primary">
      {children}
    </summary>
  ),

  // Images
  img: ({ src, alt, title }: { src?: string; alt?: string; title?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} title={title} className="my-2 h-auto max-w-full rounded-lg border" />
  ),

  // Blockquotes
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="my-4 border-l-2 border-border pl-4 italic text-secondary-foreground">
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children }: { children: ReactNode }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: ReactNode }) => <thead>{children}</thead>,
  tbody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children: ReactNode }) => <tr className="border-b">{children}</tr>,
  th: ({ children }: { children: ReactNode }) => <th className="px-4 py-2 text-left font-medium">{children}</th>,
  td: ({ children }: { children: ReactNode }) => <td className="px-4 py-2">{children}</td>,
};


