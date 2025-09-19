'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react';

type LightCodeBlockProps = {
  language?: string;
  filename?: string;
  code: string;
  className?: string;
  lineNumbers?: boolean;
  syntaxHighlighting?: boolean;
  themes?: { light: string; dark: string };
};

let shikiModulePromise: Promise<typeof import('shiki')> | null = null;
let sharedWorker: Worker | null = null;

const baseContainerClassName = cn(
  'mt-2 mb-5 bg-background text-sm rounded-md border overflow-hidden',
  '[&_pre]:py-4',
  '[&_pre]:m-0',
  '[&_code]:w-full',
  '[&_code]:grid',
  '[&_code]:overflow-x-auto',
  '[&_code]:bg-transparent'
);

const lineNumberClassNames = cn(
  '[&_code]:[counter-reset:line]',
  '[&_code]:[counter-increment:line_0]',
  '[&_.line]:before:content-[counter(line)]',
  '[&_.line]:before:inline-block',
  '[&_.line]:before:[counter-increment:line]',
  '[&_.line]:before:w-8',
  '[&_.line]:before:mr-4',
  '[&_.line]:before:text-[13px]',
  '[&_.line]:before:text-right',
  '[&_.line]:before:text-muted-foreground/50',
  '[&_.line]:before:font-mono',
  '[&_.line]:before:select-none'
);

const darkModeClassNames = cn(
  'dark:[&_.shiki]:!text-[var(--shiki-dark)]',
  'dark:[&_.shiki]:!bg-[var(--shiki-dark-bg)]',
  'dark:[&_.shiki]:![font-style:var(--shiki-dark-font-style)]',
  'dark:[&_.shiki]:![font-weight:var(--shiki-dark-font-weight)]',
  'dark:[&_.shiki]:![text-decoration:var(--shiki-dark-text-decoration)]',
  'dark:[&_.shiki_span]:!text-[var(--shiki-dark)]',
  'dark:[&_.shiki_span]:![font-style:var(--shiki-dark-font-style)]',
  'dark:[&_.shiki_span]:![font-weight:var(--shiki-dark-font-weight)]',
  'dark:[&_.shiki_span]:![text-decoration:var(--shiki-dark-text-decoration)]'
);

function Fallback({ code }: { code: string }) {
  return (
    <div>
      <pre className="w-full">
        <code>
          {code.split('\n').map((line, i) => (
            <span className="line" key={i}>
              {line}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function LightCodeBlock({
  language = 'text',
  filename,
  code,
  className,
  lineNumbers = true,
  syntaxHighlighting = true,
  themes = { light: 'vitesse-light', dark: 'vitesse-dark' },
}: LightCodeBlockProps) {
  const [html, setHtml] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const lastHighlightedRef = useRef<string>('');
  const debouncedCode = useDebouncedValue(code, syntaxHighlighting ? 150 : 0);
  const requestIdRef = useRef<number>(0);
  const instanceIdRef = useRef<string>((() => {
    try {
      return (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? (crypto as Crypto & { randomUUID: () => string }).randomUUID()
        : Math.random().toString(36).slice(2);
    } catch {
      return Math.random().toString(36).slice(2);
    }
  })());

  useEffect(() => {
    if (!syntaxHighlighting) {
      setHtml('');
      return;
    }

    let isCancelled = false;

    const runInWorkerIfPossible = async () => {
      // Use a shared module worker when available to avoid main thread blocking
      try {
        if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
          if (!sharedWorker) {
            sharedWorker = new Worker(
              new URL('./code-block-lite.worker.ts', import.meta.url),
              { type: 'module' }
            );
          }
          const currentId = (requestIdRef.current = requestIdRef.current + 1);
          const instanceId = instanceIdRef.current as string;
          const payload = { id: currentId, instanceId, code: debouncedCode, language, themes };
          sharedWorker.postMessage(payload);
          const onMessage = (e: MessageEvent) => {
            const data = e.data as { id: number; instanceId?: string; html?: string };
            if (!data || data.id !== currentId) return;
            if (data.instanceId && data.instanceId !== (instanceId as string)) return;
            sharedWorker?.removeEventListener('message', onMessage);
            if (isCancelled) return;
            const cacheKey = `${language}\n${debouncedCode}`;
            lastHighlightedRef.current = cacheKey;
            setHtml(data.html ?? '');
          };
          sharedWorker.addEventListener('message', onMessage);
          return;
        }
      } catch {
        // Worker not available, fallback to main thread
      }

      // Fallback to main thread highlighting
      try {
        if (!shikiModulePromise) shikiModulePromise = import('shiki');
        const { codeToHtml } = await shikiModulePromise;
        const cacheKey = `${language}\n${debouncedCode}`;
        if (cacheKey === lastHighlightedRef.current) return;
        const result = await codeToHtml(debouncedCode, {
          lang: language,
          themes,
        });
        if (!isCancelled) {
          lastHighlightedRef.current = cacheKey;
          setHtml(result);
        }
      } catch {
        if (!isCancelled) setHtml('');
      }
    };

    // Use requestIdleCallback to avoid blocking typing/streaming
    if (typeof (window as Window & { requestIdleCallback?: typeof requestIdleCallback }).requestIdleCallback === 'function') {
      const id = (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(runInWorkerIfPossible, { timeout: 200 });
      return () => {
        isCancelled = true;
        (window as Window & { cancelIdleCallback?: typeof cancelIdleCallback }).cancelIdleCallback?.(id);
      };
    }

    const id = window.setTimeout(runInWorkerIfPossible, 16);
    return () => {
      isCancelled = true;
      window.clearTimeout(id);
    };
  }, [debouncedCode, language, themes, syntaxHighlighting]);

  const containerClass = useMemo(
    () =>
      cn(
        baseContainerClassName,
        darkModeClassNames,
        lineNumbers && lineNumberClassNames,
        className
      ),
    [className, lineNumbers]
  );

  const onCopy = () => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    });
  };

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between border-b bg-secondary px-3 py-1">
        <div className="text-xs text-muted-foreground truncate">
          {filename ?? `code.${language}`}
        </div>
        <Button size="icon" variant="ghost" onClick={onCopy} className="shrink-0">
          {isCopied ? <CheckIcon size={14} className="text-muted-foreground" /> : <CopyIcon size={14} className="text-muted-foreground" />}
        </Button>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {syntaxHighlighting && html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <Fallback code={code} />
        )}
      </div>
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}


