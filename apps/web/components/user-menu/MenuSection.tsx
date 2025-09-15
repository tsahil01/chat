"use client";

import React from "react";
import type { MenuItem } from "./config";

export function MenuSection({ title, items }: { title?: string; items: MenuItem[] }) {
  return (
    <div className="border-t pt-2">
      {title && (
        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{title}</p>
      )}
      {items.map(({ id, label, icon: Icon, action, rightText }) => (
        <button
          key={id}
          onClick={action}
          className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          {rightText && <span className="text-xs text-muted-foreground">{rightText}</span>}
        </button>
      ))}
    </div>
  );
}


