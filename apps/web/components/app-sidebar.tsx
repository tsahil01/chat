"use client";

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
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { AuthDialog } from "./auth-dialog";
import { UserMenu } from "./user-menu";
import { useTheme } from "next-themes";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FiMessageCircle } from "react-icons/fi";
import { PiPlusBold } from "react-icons/pi";
import { LuWorkflow } from "react-icons/lu";
import Link from "next/link";

export function AppSidebar() {
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const hasFetchedOnce = useRef(false);
  const lastChatsSignature = useRef<string>("");
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  async function getRecentChats(pageNum = 1, append = false) {
    try {
      if (!user) return;

      if (pageNum === 1 && !hasFetchedOnce.current) {
        setIsLoading(true);
      } else if (append) {
        setIsLoadingMore(true);
      }

      const response = await fetch(`/api/chat/recent?page=${pageNum}&limit=20`);
      const data = await response.json();

      if (!data || !Array.isArray(data.chats)) {
        console.error("API response is not valid:", data);
        return;
      }

      const { chats, hasMore: moreAvailable } = data;

      const nonArchivedChats = chats.filter(
        (chat: Chat) => chat.visibility !== "ARCHIVE"
      );

      if (append) {
        setRecentChats((prev) => [...prev, ...nonArchivedChats]);
      } else {
        const newSignature = computeChatsSignature(nonArchivedChats);
        if (newSignature !== lastChatsSignature.current) {
          lastChatsSignature.current = newSignature;
          setRecentChats(nonArchivedChats);
        }
      }

      setHasMore(moreAvailable);
      setPage(pageNum);
    } catch (error) {
      console.error("Error getting recent chats:", error);
      if (!hasFetchedOnce.current) {
        setRecentChats([]);
      }
    } finally {
      if (pageNum === 1 && !hasFetchedOnce.current) {
        setIsLoading(false);
        hasFetchedOnce.current = true;
      } else if (append) {
        setIsLoadingMore(false);
      }
    }
  }

  async function loadMoreChats() {
    if (isLoadingMore || !hasMore) return;
    await getRecentChats(page + 1, true);
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && hasMore && !isLoadingMore) {
      loadMoreChats();
    }
  }

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (!user) return;
    getRecentChats(1, false);

    // Reduced polling frequency for better performance
    const intervalId = setInterval(() => {
      getRecentChats(1, false);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <Sidebar variant="floating">
      <SidebarContent className="overflow-hidden">
        {/* Header */}
        <div className="flex justify-between p-3 border-b border-sidebar-border">
          <Link href="/">
            <h1 className="text-base font-semibold my-auto">AI Chat</h1>
          </Link>
          <SidebarTrigger className="bg-sidebar-accent text-sidebar-accent-foreground hover:cursor-pointer my-auto" />
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/integrations">
                      <LuWorkflow className="h-4 w-4" />
                      <span>Integrations</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        {/* Recent Chats - scrollable only */}
        <div
          ref={sidebarRef}
          className="min-h-0 flex-1 overflow-auto"
          onScroll={handleScroll}
        >
          <SidebarGroup>
            <SidebarGroupLabel>Recents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <span>Loading...</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : Array.isArray(recentChats) && recentChats.length > 0 ? (
                  <>
                    {recentChats.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                          <a href={`/chat/${item.id}`}>
                            <span className="truncate">{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {isLoadingMore && (
                      <SidebarMenuItem>
                        <SidebarMenuButton disabled>
                          <span>Loading more...</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {!hasMore && recentChats.length > 20 && (
                      <SidebarMenuItem>
                        <SidebarMenuButton disabled>
                          <span className="text-xs text-muted-foreground">
                            No more chats
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
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
                className="shrink-0 rounded p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
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
  );
}
