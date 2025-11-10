"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { AnnouncementToastContent } from "@workspace/ui/components/announcement-toast-content";

const STORAGE_KEY = "ui.announcement-toast.seen";
const activeAnnouncementIds = new Set<string>();
type ButtonVariant = NonNullable<
  React.ComponentProps<typeof Button>["variant"]
>;

type AnnouncementHighlight = {
  title: string;
  description?: string;
};

type AnnouncementAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  variant?: ButtonVariant;
};

export type AnnouncementToastOptions = {
  id: string;
  title: string;
  description?: string;
  action?: AnnouncementAction;
  dismissLabel?: string;
  extendedTitle?: string;
  extendedContent?: string;
  delay?: number;
  duration?: number;
  force?: boolean;
  persistSeen?: boolean;
  highlights?: AnnouncementHighlight[];
  onShow?: (toastId: string | number) => void;
  onDismiss?: () => void;
  onAction?: () => void;
};

export const hasSeenAnnouncementToast = (id: string) => {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.includes(id) : false;
  } catch {
    return false;
  }
};

export const markAnnouncementToastSeen = (id: string) => {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([id]));
      return;
    }
    if (parsed.includes(id)) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...parsed, id]));
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([id]));
  }
};

export const resetAnnouncementToasts = (ids?: string[]) => {
  if (typeof window === "undefined") return;

  if (!ids) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return;
    const filtered = parsed.filter(
      (storedId: unknown) =>
        typeof storedId === "string" && !ids.includes(storedId),
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

export const showAnnouncementToast = (options: AnnouncementToastOptions) => {
  if (typeof window === "undefined") return;

  const persistSeen = options.persistSeen ?? true;
  const hasSeen = persistSeen && hasSeenAnnouncementToast(options.id);
  const isActive = activeAnnouncementIds.has(options.id);
  const shouldSkip = !options.force && (hasSeen || isActive);

  if (shouldSkip) return;

  const present = () => {
    activeAnnouncementIds.add(options.id);
    const toastId = toast.custom(
      (id) => (
        <AnnouncementToastContent
          toastId={id}
          options={{ ...options, persistSeen }}
          onClose={() => {
            activeAnnouncementIds.delete(options.id);
          }}
        />
      ),
      {
        duration: options.duration ?? Infinity,
      },
    );

    options.onShow?.(toastId);
  };

  if (options.delay && options.delay > 0) {
    window.setTimeout(present, options.delay);
  } else {
    present();
  }
};
