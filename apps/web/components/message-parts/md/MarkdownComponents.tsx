import { ReactNode } from 'react';

export const markdownComponents = {
  // Headings
  h1: ({ children }: { children: ReactNode }) => <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mt-4 sm:mt-6 selection:bg-primary selection:text-primary-foreground">{children}</h1>,
  h2: ({ children }: { children: ReactNode }) => <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 mt-3 sm:mt-5 selection:bg-primary selection:text-primary-foreground">{children}</h2>,
  h3: ({ children }: { children: ReactNode }) => <h3 className="text-base sm:text-lg font-medium mb-2 mt-3 sm:mt-4 selection:bg-primary selection:text-primary-foreground">{children}</h3>,
  h4: ({ children }: { children: ReactNode }) => <h4 className="text-sm sm:text-base font-medium mb-1 sm:mb-2 mt-2 sm:mt-3 selection:bg-primary selection:text-primary-foreground">{children}</h4>,

  // Paragraphs
  p: ({ children }: { children: ReactNode }) => <p className="text-sm sm:text-base leading-relaxed selection:bg-primary selection:text-primary-foreground">{children}</p>,

  // Lists
  ul: ({ children }: { children: ReactNode }) => <ul className="list-disc list-outside pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 selection:bg-primary selection:text-primary-foreground">{children}</ul>,
  ol: ({ children }: { children: ReactNode }) => <ol className="list-decimal list-outside pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 selection:bg-primary selection:text-primary-foreground">{children}</ol>,
  li: ({ children }: { children: ReactNode }) => <li className="m-0 text-sm sm:text-base selection:bg-primary selection:text-primary-foreground">{children}</li>,

  // Links
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a href={href} className="underline underline-offset-4 text-primary hover:text-primary/90 selection:bg-primary selection:text-primary-foreground" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),

  // Code (inline)
  code: ({ children }: { children: ReactNode }) => (
    <code className="rounded bg-secondary px-1 sm:px-1.5 py-0.5 font-mono text-xs sm:text-sm text-secondary-foreground selection:bg-primary selection:text-primary-foreground">
      {children}
    </code>
  ),

  // Strikethrough
  del: ({ children }: { children: ReactNode }) => (
    <del className="text-muted-foreground selection:bg-primary selection:text-primary-foreground">{children}</del>
  ),

  // hr
  hr: ({ children }: { children: ReactNode }) => (
    <hr className="my-4 border-t border-border selection:bg-primary selection:text-primary-foreground" />
  ),
  br: ({ children }: { children: ReactNode }) => (
    <br />
  ),

  // Keyboard keys
  kbd: ({ children }: { children: ReactNode }) => (
    <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground selection:bg-primary selection:text-primary-foreground">
      {children}
    </kbd>
  ),

  // Details/Summary
  details: ({ children }: { children: ReactNode }) => (
    <details className="my-3 rounded border bg-secondary/30 p-3 selection:bg-primary selection:text-primary-foreground">
      {children}
    </details>
  ),
  summary: ({ children }: { children: ReactNode }) => (
    <summary className="cursor-pointer select-none text-sm font-medium text-primary selection:bg-primary selection:text-primary-foreground">
      {children}
    </summary>
  ),

  // Images
  img: ({ src, alt, title }: { src?: string; alt?: string; title?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} title={title} className="my-2 h-auto max-w/full rounded-lg border selection:bg-primary selection:text-primary-foreground" />
  ),

  // Blockquotes
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="my-3 sm:my-4 border-l-2 border-border pl-3 sm:pl-4 italic text-secondary-foreground selection:bg-primary selection:text-primary-foreground">
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children }: { children: ReactNode }) => (
    <div className="overflow-x-auto my-3 sm:my-4 selection:bg-primary selection:text-primary-foreground">
      <table className="min-w-full border selection:bg-primary selection:text-primary-foreground text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: ReactNode }) => <thead className="selection:bg-primary selection:text-primary-foreground">{children}</thead>,
  tbody: ({ children }: { children: ReactNode }) => <tbody className="selection:bg-primary selection:text-primary-foreground">{children}</tbody>,
  tr: ({ children }: { children: ReactNode }) => <tr className="border-b selection:bg-primary selection:text-primary-foreground">{children}</tr>,
  th: ({ children }: { children: ReactNode }) => <th className="px-2 sm:px-4 py-1 sm:py-2 text-left font-medium selection:bg-primary selection:text-primary-foreground">{children}</th>,
  td: ({ children }: { children: ReactNode }) => <td className="px-2 sm:px-4 py-1 sm:py-2 selection:bg-primary selection:text-primary-foreground">{children}</td>,
};


