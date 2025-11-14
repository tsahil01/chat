"use client";

import { useState } from "react";
import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { ChatTitle } from "./chat-title";
import { PersonalityBadge } from "./personality-badge";
import { ShareButton } from "./share-button";
import { HeaderOptions } from "./options";

export function HeaderContent() {
  const params = useParams();
  const pathname = usePathname();
  const [personality, setPersonality] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const { open, isMobile } = useSidebar();
  const isChatRoute = pathname?.includes("/chat/");
  const isShareRoute = pathname?.includes("/share/");
  const chatId = params.id as string;

  if (!isChatRoute) {
    return null;
  }

  return (
    <div className={cn("flex flex-row items-center gap-2 p-2 pb-0 mx-auto")}>
      {(!open || isMobile) && (
        <SidebarTrigger className="bg-sidebar-accent text-sidebar-accent-foreground hover:cursor-pointer" />
      )}
      <div className="flex flex-row gap-2 items-center w-full justify-between mx-auto">
        <ChatTitle
          onTitleChange={setTitle}
          onPersonalityChange={setPersonality}
          isShareRoute={isShareRoute}
        />
        <div className="flex flex-row items-center gap-1 my-auto">
          <PersonalityBadge personality={personality} />
          {isShareRoute && (
            <Badge variant="outline" className="text-xs">
              Shared Chat
            </Badge>
          )}
          {!isShareRoute && title && chatId && <ShareButton chatId={chatId} />}
          {!isShareRoute && title && chatId && (
            <HeaderOptions chatId={chatId as string} />
          )}
        </div>
      </div>
    </div>
  );
}
