"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { LuShare2, LuCopy, LuCheck, LuLock } from "react-icons/lu";

interface ShareButtonProps {
  chatId: string;
}

export function ShareButton({ chatId }: ShareButtonProps) {
  const [isShared, setIsShared] = useState(false);
  const [isLoadingShare, setIsLoadingShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    async function checkShareStatus() {
      try {
        const response = await fetch(`/api/chat/${chatId}`);
        if (response.ok) {
          const chat = await response.json();
          setIsShared(chat.visibility === "PUBLIC");
        }
      } catch (error) {
        console.error("Error checking share status:", error);
      }
    }

    if (chatId) {
      checkShareStatus();
    }
  }, [chatId]);

  async function shareChat() {
    const response = await fetch(`/api/chat/${chatId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error("Failed to share chat");
      return false;
    }
    return true;
  }

  async function unshareChat() {
    const response = await fetch(`/api/chat/${chatId}/unshare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error("Failed to unshare chat");
      return false;
    }
    return true;
  }

  async function handleShare() {
    if (isLoadingShare) return;

    setIsLoadingShare(true);
    try {
      const success = await shareChat();
      if (success) {
        setIsShared(true);
      }
    } catch (error) {
      console.error("Error sharing chat:", error);
    } finally {
      setIsLoadingShare(false);
    }
  }

  async function handleUnshare() {
    if (isLoadingShare) return;

    setIsLoadingShare(true);
    try {
      const success = await unshareChat();
      if (success) {
        setIsShared(false);
        setPopoverOpen(false);
      }
    } catch (error) {
      console.error("Error unsharing chat:", error);
    } finally {
      setIsLoadingShare(false);
    }
  }

  function getShareUrl() {
    if (typeof window !== "undefined" && chatId) {
      return `${window.location.origin}/chat/share/${chatId}`;
    }
    return "";
  }

  async function handleCopyLink() {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="my-auto gap-2">
          <LuShare2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {isShared ? (
          <div className="p-4">
            <div className="mb-2 text-sm font-medium">Share Chat</div>
            <div className="text-muted-foreground mb-4 text-xs">
              Anyone with this link can view this chat in read-only mode.
            </div>
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-muted flex-1 truncate rounded-md p-2 font-mono text-xs">
                {getShareUrl()}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <LuCheck className="mr-1 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <LuCopy className="mr-1 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnshare}
              disabled={isLoadingShare}
              className="w-full"
            >
              <LuLock className="mr-2 h-4 w-4" />
              Unshare
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-2 text-sm font-medium">Share Chat</div>
            <div className="text-muted-foreground mb-4 text-xs">
              Make this chat shareable so others can view it.
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleShare}
              disabled={isLoadingShare}
              className="w-full"
            >
              <LuShare2 className="mr-2 h-4 w-4" />
              Share Chat
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
