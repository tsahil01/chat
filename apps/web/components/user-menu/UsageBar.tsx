"use client";

import React from "react";

export function UsageBar({
  percentage,
  text,
}: {
  percentage: number;
  text?: string;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
  return (
    <div className="px-2 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Usage</span>
        <span className="text-xs text-muted-foreground">{clamped}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-muted">
        <div
          className="h-full rounded bg-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {text && <p className="mt-1 text-[10px] text-muted-foreground">{text}</p>}
    </div>
  );
}
