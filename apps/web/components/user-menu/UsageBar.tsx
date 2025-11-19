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
        <span className="text-muted-foreground text-xs">Usage</span>
        <span className="text-muted-foreground text-xs">{clamped}%</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded">
        <div
          className="bg-primary h-full rounded transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {text && <p className="text-muted-foreground mt-1 text-[10px]">{text}</p>}
    </div>
  );
}
