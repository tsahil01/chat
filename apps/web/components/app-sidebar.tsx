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
            setIsLoading(true);
            const response = await fetch("/api/chat/conversations");
            const data = await response.json();
            console.log(data);
            if (Array.isArray(data)) {
                setRecentChats(data);
            } else {
                console.error("API response is not an array:", data);
                setRecentChats([]);
            }
        } catch (error) {
            console.error("Error getting recent chats:", error);
            setRecentChats([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getRecentChats();
        getSession();
    }, []);

  return (
    <Sidebar>
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">AI Chat</h1>
        </div>

        {/* New Chat Button */}
        <div className="p-2">
          <SidebarMenuButton asChild className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <a href="/chat">
              <MdAdd className="h-4 w-4" />
              <span>New chat</span>
            </a>
          </SidebarMenuButton>
        </div>

        {/* Navigation Menu */}
        {/* <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/chats">
                    <MdMessage className="h-4 w-4" />
                    <span>Chats</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/projects">
                    <MdFolderOpen className="h-4 w-4" />
                    <span>Projects</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/artifacts">
                    <MdLayers className="h-4 w-4" />
                    <span>Artifacts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
         */}
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
                  <SidebarMenuItem key={item.title}>
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

        {/* User/Login Section - Bottom */}
        <div className="mt-auto p-2 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <AuthDialog />
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
