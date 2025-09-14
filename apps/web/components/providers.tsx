"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function Providers({ children }: { children: React.ReactNode }) {
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
        <SidebarTrigger className="bg-sidebar-accent text-sidebar-accent-foreground hover:cursor-pointer" />
        {children}
      </main>
    </SidebarProvider>
    </NextThemesProvider>
  )
}
