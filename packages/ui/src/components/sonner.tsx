"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const THEME_MODE_MAP: Record<string, "light" | "dark"> = {
  light: "light",
  dark: "dark",
  classic: "light",
  minimal: "light",
  midnight: "dark",
  sunset: "light",
  ocean: "light",
  forest: "dark",
  pastel: "light",
  mono: "dark",
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system", resolvedTheme } = useTheme();
  const baseTheme =
    theme === "system"
      ? resolvedTheme === "dark"
        ? "dark"
        : "light"
      : (THEME_MODE_MAP[theme] ??
        (resolvedTheme === "dark" ? "dark" : "light"));

  return (
    <Sonner
      theme={baseTheme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
