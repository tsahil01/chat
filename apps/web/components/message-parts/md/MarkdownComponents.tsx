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
    <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),

  // Code (inline)
  code: ({ children }: { children: ReactNode }) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),

  // Blockquotes
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700">
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children }: { children: ReactNode }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: ReactNode }) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children: ReactNode }) => <tr className="border-b border-gray-200">{children}</tr>,
  th: ({ children }: { children: ReactNode }) => <th className="px-4 py-2 text-left font-medium">{children}</th>,
  td: ({ children }: { children: ReactNode }) => <td className="px-4 py-2">{children}</td>,
};


