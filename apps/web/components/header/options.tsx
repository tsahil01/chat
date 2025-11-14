"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function HeaderOptions({ chatId }: { chatId: string }) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchChatStatus() {
      try {
        const response = await fetch(`/api/chat/${chatId}`);
        if (response.ok) {
          const chat = await response.json();
          setIsArchived(chat.visibility === "ARCHIVE");
        }
      } catch (error) {
        console.error("Error fetching chat status:", error);
      }
    }
    if (chatId) {
      fetchChatStatus();
    }
  }, [chatId]);

  async function handleArchive() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ visibility: "ARCHIVE" }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive chat");
      }

      setIsArchived(true);
      setOpen(false);
    } catch (error) {
      console.error("Error archiving chat:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnarchive() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ visibility: "PRIVATE" }),
      });

      if (!response.ok) {
        throw new Error("Failed to unarchive chat");
      }

      setIsArchived(false);
      setOpen(false);
    } catch (error) {
      console.error("Error unarchiving chat:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      setDeleteDialogOpen(false);
      router.replace("/chats", { scroll: false });
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="my-auto">
            <BsThreeDotsVertical />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="end">
          <div className="flex flex-col">
            {isArchived ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleUnarchive}
                disabled={isLoading}
              >
                <ArchiveRestore className="h-4 w-4" />
                Unarchive
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleArchive}
                disabled={isLoading}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => {
                setOpen(false);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}