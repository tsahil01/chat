"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getChatInfo } from "@/lib/chat";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LuBrain } from "react-icons/lu";

export function Providers({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [title, setTitle] = useState("");
  const [personality, setPersonality] = useState<string | null>(null);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);

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
          <div className="flex flex-row items-center gap-2 p-4">
            <SidebarTrigger className="bg-sidebar-accent text-sidebar-accent-foreground hover:cursor-pointer" />
            <div className="flex flex-row gap-2 items-center w-full justify-between">
            <h1 className="md:text-base text-sm tracking-tight text-foreground truncate">
              {displayedTitle || title}
            </h1>
            {personality && (
            <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground font-medium my-auto">
                {/* <LuBrain className="w-4 h-4 flex-shrink-0" /> */}
                {personality?.charAt(0).toUpperCase() + personality?.slice(1) || "Default"}
              </span>
            )}
            </div>
          </div>
          {children}
        </main>
      </SidebarProvider>
    </NextThemesProvider>
  );
}
