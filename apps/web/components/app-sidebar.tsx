"use client"

import { useEffect, useRef, useState } from "react";
import { Chat } from "@workspace/db";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@workspace/ui/components/sidebar"
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { AuthDialog } from "./auth-dialog";
import { UserMenu } from "./user-menu";
import { useTheme } from "next-themes";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FiMessageCircle } from "react-icons/fi";
import { PiPlusBold } from "react-icons/pi";


export function AppSidebar() {
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const hasFetchedOnce = useRef(false);
  const lastChatsSignature = useRef<string>("");

  async function getSession() {
    try {
      const { data: session } = await authClient.getSession();
      setUser(session?.user || null);
      if (!session?.user) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error getting session:", error);
    }
  }

  async function handleLogout() {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  function computeChatsSignature(items: Chat[]): string {
    return items.map((c) => `${c.id}:${c.title ?? ""}`).join("|");
  }

  async function getRecentChats() {
    try {
      if (!user) return;
      if (!hasFetchedOnce.current) {
        setIsLoading(true);
      }
      const response = await fetch("/api/chat/recent");
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        return;
      }

      const newSignature = computeChatsSignature(data as Chat[]);
      if (newSignature !== lastChatsSignature.current) {
        lastChatsSignature.current = newSignature;
        setRecentChats(data);
      }
    } catch (error) {
      console.error("Error getting recent chats:", error);
      if (!hasFetchedOnce.current) {
        setRecentChats([]);
      }
    } finally {
      if (!hasFetchedOnce.current) {
        setIsLoading(false);
        hasFetchedOnce.current = true;
      }
    }
  }

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (!user) return;
    getRecentChats();

    const intervalId = setInterval(() => {
      getRecentChats();
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <Sidebar variant="floating">
      <SidebarContent className="overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-sidebar-border">
          <h1 className="text-base font-semibold">AI Chat</h1>
        </div>
        <div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/">
                      <PiPlusBold className="h-4 w-4" />
                      <span>New chat</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/chats">
                      <FiMessageCircle className="h-4 w-4" />
                      <span>Chats</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        {/* Recent Chats - scrollable only */}
        <div className="min-h-0 flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Recents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <FiMessageCircle className="h-4 w-4" />
                      <span>Loading...</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : Array.isArray(recentChats) && recentChats.length > 0 ? (
                  recentChats.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild>
                        <a href={`/chat/${item.id}`}>
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <FiMessageCircle className="h-4 w-4" />
                      <span>No recent chats</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      {/* Footer: fixed, non-scrollable */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex w-full flex-row items-center gap-2">
              <div className="flex-1 min-w-0 overflow-hidden">
                {user ? (
                  <UserMenu user={user} onLogout={handleLogout} />
                ) : (
                  <AuthDialog />
                )}
              </div>
              <button
                aria-label="Toggle theme"
                className="shrink-0 rounded p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <MdLightMode className="h-4 w-4" />
                ) : (
                  <MdDarkMode className="h-4 w-4" />
                )}
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
