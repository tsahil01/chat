"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getChatTitle } from "@/lib/chat"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"


export function Providers({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [title, setTitle] = useState("");

  async function getTitle() {
    const chatId = params.id as string;
    if (!chatId) return "New Chat";
    const title = await getChatTitle(chatId);
    setTitle(title);
  }

  useEffect(() => {
    getTitle();
  }, [params.id]);

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
        <main className="flex-1 p-4">
          <div className="flex flex-row items-center gap-2">
            <SidebarTrigger className="bg-sidebar-accent text-sidebar-accent-foreground hover:cursor-pointer" />
            <h1 className="text-base">{title}</h1>
          </div>
          {children}
        </main>
      </SidebarProvider>
    </NextThemesProvider>
  )
}
