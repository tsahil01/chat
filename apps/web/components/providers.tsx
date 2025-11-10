"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getChatInfo } from "@/lib/chat";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@workspace/ui/components/sonner";
import {
  showAnnouncementToast,
  type AnnouncementToastOptions,
} from "@workspace/ui/components/announcement-toast";

function HeaderContent() {
  const params = useParams();
  const [title, setTitle] = useState("");
  const [personality, setPersonality] = useState<string | null>(null);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const { open, isMobile } = useSidebar();

  async function getTitle() {
    const chatId = params.id as string;
    if (!chatId) {
      setTitle("");
      return;
    }
    const info = await getChatInfo(chatId);
    if (!info) {
      setTitle("");
      setPersonality("Default");
      return;
    }
    setTitle(info.title);
    setPersonality(info.personality);
  }

  useEffect(() => {
    getTitle();
  }, [params.id]);

  // Reset typing when the title changes
  useEffect(() => {
    setDisplayedTitle("");
    setTypingIndex(0);
  }, [title]);

  // Typewriter effect
  useEffect(() => {
    if (!title) return;
    if (typingIndex >= title.length) return;

    const intervalId = setInterval(() => {
      setDisplayedTitle((prev) => prev + title.charAt(typingIndex));
      setTypingIndex((idx) => idx + 1);
    }, 24);

    return () => clearInterval(intervalId);
  }, [title, typingIndex]);

  return (
    <div className="flex flex-row items-center gap-2 p-3">
      {(!open || isMobile) && (
        <SidebarTrigger className="bg-sidebar-accent text-sidebar-accent-foreground hover:cursor-pointer" />
      )}
      <div className="flex flex-row gap-2 items-center w-full justify-between pt-3">
        <h1 className="md:text-base text-sm tracking-tight text-foreground truncate">
          {displayedTitle || title}
        </h1>
        {personality && (
          <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground font-medium my-auto">
            {/* <LuBrain className="w-4 h-4 flex-shrink-0" /> */}
            {personality?.charAt(0).toUpperCase() + personality?.slice(1) ||
              "Default"}
          </span>
        )}
      </div>
    </div>
  );
}

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
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <HeaderContent />
          {children}
        </main>
      </SidebarProvider>
      <Toaster />
    </NextThemesProvider>
  );
}
