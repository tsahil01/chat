"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getChatInfo, getSharedChatInfo } from "@/lib/chat";

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
    console.log("info", info);
    if (!info || !info.title) {
      setTitle("");
      onPersonalityChange?.("Default");
      return false;
    }
    setTitle(info.title);
    onTitleChange?.(info.title);
    onPersonalityChange?.(info.personality);
    return true;
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

  return (
    <h1 className="md:text-base text-sm tracking-tight text-foreground truncate">
      {displayedTitle || title}
    </h1>
  );
}

