"use client"

import {
  MdMessage,
  MdAdd,
} from "react-icons/md"
import { useEffect, useState } from "react";
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

export function AppSidebar() {
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  async function getSession() {
    const { data: session } = await authClient.getSession();
    setUser(session?.user || null);
  }

  async function handleLogout() {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  async function getRecentChats() {
    try {
      if (!user) return;
      setIsLoading(true);
      const response = await fetch("/api/chat/conversations");
      const data = await response.json();
      if (Array.isArray(data) && recentChats !== data) {
        setRecentChats(data);
      } else {
        console.error("API response is not an array:", data);
        setRecentChats(recentChats);
      }
    } catch (error) {
      console.error("Error getting recent chats:", error);
      setRecentChats([]);
    } finally {
      setIsLoading(false);
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
    }, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <Sidebar>
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">AI Chat</h1>
        </div>
        <div className="">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/">
                      <MdAdd className="h-4 w-4" />
                      <span>New chat</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/chats">
                      <MdMessage className="h-4 w-4" />
                      <span>Chats</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Recent Chats */}
        <SidebarGroup>
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <MdMessage />
                    <span>Loading...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : Array.isArray(recentChats) && recentChats.length > 0 ? (
                recentChats.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <a href={`/chat/${item.id}`}>
                        <MdMessage />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <MdMessage />
                    <span>No recent chats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Footer: fixed, non-scrollable */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <AuthDialog />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
