"use client";

import { useState } from "react";
import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { ChatTitle } from "./chat-title";
import { PersonalityBadge } from "./personality-badge";
import { ShareButton } from "./share-button";

export function HeaderContent() {
  const params = useParams();
  const pathname = usePathname();
  const [personality, setPersonality] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const { open, isMobile } = useSidebar();
  const isShareRoute = pathname?.includes("/share/");
  const chatId = params.id as string;

  return (
    <div className={cn("flex flex-row items-center gap-2 p-3")}>
      {(!open || isMobile) && (
        <SidebarTrigger className="bg-sidebar-accent text-sidebar-accent-foreground hover:cursor-pointer" />
      )}
      <div className="flex flex-row gap-2 items-center w-full justify-between">
        <ChatTitle
          onTitleChange={setTitle}
          onPersonalityChange={setPersonality}
          isShareRoute={isShareRoute}
        />
        <div className="flex flex-row items-center gap-2">
          <PersonalityBadge personality={personality} />
          {isShareRoute && (
            <Badge variant="outline" className="text-xs">
              Shared Chat
            </Badge>
          )}
          {!isShareRoute && title && chatId && <ShareButton chatId={chatId} />}
        </div>
      </div>
    </div>
  );
}
