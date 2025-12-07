"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect } from "react";
import {
  showAnnouncementToast,
  type AnnouncementToastOptions,
} from "@workspace/ui/components/announcement-toast";
import { HeaderContent } from "@/components/header";
import { themeIds } from "@/lib/themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const hasShownAnnouncementRef = React.useRef(false);

  useEffect(() => {
    if (hasShownAnnouncementRef.current) return;

    let isMounted = true;

    const loadAnnouncements = async () => {
      try {
        const response = await fetch("/announcements.json", {
          cache: "no-cache",
        });
        if (!response.ok) {
          console.warn("Failed to fetch announcements.json");
          return;
        }

        const data: { announcements?: AnnouncementToastOptions[] } =
          await response.json();
        const [announcement] = data.announcements ?? [];

        if (!isMounted || !announcement) return;

        showAnnouncementToast(announcement);
        hasShownAnnouncementRef.current = true;
      } catch (error) {
        console.warn("Unable to load announcements", error);
      }
    };

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      storageKey="chat-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      themes={themeIds}
    >
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="flex-1">
          <HeaderContent />
          {children}
        </main>
      </SidebarProvider>
    </NextThemesProvider>
  );
}
