"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getChatInfo, getSharedChatInfo } from "@/lib/chat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { ChevronDown } from "lucide-react";
import { Metadata } from "next";
import { appConfig } from "@workspace/config";

interface ChatTitleProps {
  onTitleChange?: (title: string) => void;
  onPersonalityChange?: (personality: string | null) => void;
  isShareRoute?: boolean;
}

export function ChatTitle({
  onTitleChange,
  onPersonalityChange,
  isShareRoute,
}: ChatTitleProps) {
  const params = useParams();
  const [title, setTitle] = useState("");
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function getTitle() {
    const chatId = params.id as string;
    if (!chatId) {
      setTitle("");
      return false;
    }
    let info;
    if (isShareRoute) {
      info = await getSharedChatInfo(chatId);
    } else {
      info = await getChatInfo(chatId);
    }
    if (!info || !info.title || info.title === "New Chat") {
      setTitle("");
      onPersonalityChange?.("Default");
      return false;
    }
    setTitle(info.title);
    onTitleChange?.(info.title);
    onPersonalityChange?.(info.personality);

    const metadata: Metadata = {
      title: `${info.title} | ${appConfig.appName}`,
      description: info.title,
    };
    document.title = metadata.title as string;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", metadata.description as string);
    return true;
  }

  async function updateTitle() {
    const chatId = params.id as string;
    if (!chatId || !editTitle.trim() || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update title");
      }

      const updatedChat = await response.json();
      setTitle(updatedChat.title);
      onTitleChange?.(updatedChat.title);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating title:", error);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const chatId = params.id as string;
    if (!chatId) {
      return;
    }

    getTitle();
    const intervalId = setInterval(async () => {
      const hasTitle = await getTitle();
      if (hasTitle) {
        clearInterval(intervalId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [params.id]);

  useEffect(() => {
    setDisplayedTitle("");
    setTypingIndex(0);
  }, [title]);

  useEffect(() => {
    if (!title) return;
    if (typingIndex >= title.length) return;

    const intervalId = setInterval(() => {
      setDisplayedTitle((prev) => prev + title.charAt(typingIndex));
      setTypingIndex((idx) => idx + 1);
    }, 24);

    return () => clearInterval(intervalId);
  }, [title, typingIndex]);

  useEffect(() => {
    if (isOpen) {
      setEditTitle(title);
    }
  }, [isOpen, title]);

  const titleDisplay = (
    <h1 className="text-foreground truncate text-sm tracking-tight md:text-base">
      {displayedTitle || title}
    </h1>
  );

  if (isShareRoute) {
    return titleDisplay;
  }

  const hasTitle = Boolean(title);

  if (!hasTitle) {
    return (
      <h1 className="text-foreground truncate text-sm tracking-tight md:text-base">
        {displayedTitle || title || "New Chat"}
      </h1>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="my-auto">
          <span className="truncate">
            {displayedTitle || title || "New Chat"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chat Name</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter chat name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateTitle();
                }
                if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={updateTitle}
              disabled={isSaving || !editTitle.trim()}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
