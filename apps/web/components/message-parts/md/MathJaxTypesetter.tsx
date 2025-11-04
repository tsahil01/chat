"use client";

import { PropsWithChildren, useEffect, useRef } from "react";

declare global {
  interface Window {
    MathJax?: any;
  }
}

let mathjaxLoadingPromise: Promise<void> | null = null;

function loadMathJax(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MathJax) return Promise.resolve();
  if (mathjaxLoadingPromise) return mathjaxLoadingPromise;

  // Configure MathJax before loading script
  window.MathJax = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
      processEscapes: true,
    },
    options: {
      skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    },
    svg: { fontCache: "global" },
    startup: {
      typeset: false,
    },
  };

  mathjaxLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MathJax"));
    document.head.appendChild(script);
  });

  return mathjaxLoadingPromise;
}

export function MathJaxTypesetter({ children }: PropsWithChildren<{}>) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        await loadMathJax();
        if (cancelled || !window.MathJax || !containerRef.current) return;
        await window.MathJax.typesetPromise?.([containerRef.current]);
      } catch {
        // ignore
      }
    };
    // Typeset after current paint
    const id = window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  });

  return <div ref={containerRef}>{children}</div>;
}
