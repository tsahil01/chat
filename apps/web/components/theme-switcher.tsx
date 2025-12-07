"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { appThemes } from "@/lib/themes";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { LuPalette, LuChevronDown } from "react-icons/lu";

function Swatch({
  themeId,
  size = "md",
  fallback = ["#6366f1", "#0b1221"],
}: {
  themeId?: string;
  size?: "sm" | "md";
  fallback?: [string, string];
}) {
  const dimension = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const className = themeId ? `${themeId}` : "";
  return (
    <span
      aria-hidden
      className={`border-border flex ${dimension} items-center justify-center rounded-md border ${className}`}
      style={{
        background: `linear-gradient(135deg, var(--primary, ${fallback[0]}) 0%, var(--primary, ${fallback[0]}) 55%, var(--background, ${fallback[1]}) 100%)`,
        boxShadow: "0 0 0 1px var(--border)",
      }}
    >
      <LuPalette
        className={size === "sm" ? "h-3 w-3 opacity-80" : "h-3.5 w-3.5"}
        style={{ color: "var(--foreground, #ffffff)" }}
      />
    </span>
  );
}

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeThemeId = theme ?? "system";
  const appliedTheme = useMemo(() => {
    if (activeThemeId === "system") {
      return appThemes.find((item) => item.id === resolvedTheme) ?? null;
    }
    return appThemes.find((item) => item.id === activeThemeId) ?? null;
  }, [activeThemeId, resolvedTheme]);

  if (!mounted) return null;

  const handleSelect = (value: string) => {
    setTheme(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between rounded-lg px-3 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Swatch
              themeId={appliedTheme?.id}
              fallback={[appliedTheme?.accent ?? "#6366f1", "#0b1221"]}
            />
            <div className="flex min-w-0 flex-col text-left">
              <span className="truncate text-sm font-medium">
                {appliedTheme?.label ?? "System"}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {appliedTheme ? `${appliedTheme.mode} mode` : "Auto"}
              </span>
            </div>
          </div>
          <LuChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        align="end"
        side="top"
        sideOffset={8}
        avoidCollisions
      >
        <div className="p-2">
          <div className="text-muted-foreground mb-2 px-1 text-xs font-medium">
            Select theme
          </div>
          <div className="space-y-1">
            <Button
              variant={activeThemeId === "system" ? "secondary" : "ghost"}
              className="w-full justify-start px-2 py-2 text-sm"
              onClick={() => handleSelect("system")}
            >
              <div className="flex items-center gap-2">
                <Swatch
                  themeId={resolvedTheme === "dark" ? "dark" : "light"}
                  fallback={["#6366f1", "#111827"]}
                />
                <div className="flex flex-col text-left">
                  <span className="font-medium">System</span>
                  <span className="text-muted-foreground text-xs">
                    Auto ({resolvedTheme ?? "detecting"})
                  </span>
                </div>
              </div>
            </Button>
            {appThemes.map((item) => (
              <Button
                key={item.id}
                variant={activeThemeId === item.id ? "secondary" : "ghost"}
                className="w-full justify-start px-2 py-2 text-sm"
                onClick={() => handleSelect(item.id)}
              >
                <div className="flex items-center gap-2">
                  <Swatch
                    themeId={item.id}
                    fallback={[item.accent, "#0f172a"]}
                  />
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.mode} mode
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
