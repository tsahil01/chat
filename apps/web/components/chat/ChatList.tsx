"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  visibility: "PUBLIC" | "PRIVATE";
}

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  onChatClick: (chatId: string) => void;
  onNewChat: () => void;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyActionText?: string;
}

export function ChatList({
  chats,
  loading,
  error,
  onChatClick,
  onNewChat,
  onRetry,
  emptyMessage = "No conversations yet. Start a new chat to get going!",
  emptyActionText = "Start Your First Chat",
}: ChatListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-3 w-12 ml-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (chats.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">{emptyMessage}</p>
          <Button size="sm" onClick={onNewChat}>
            {emptyActionText}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onChatClick(chat.id)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate text-sm">{chat.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(chat.createdAt)}
                </p>
              </div>
              <div className="ml-3 shrink-0">
                <Badge variant="secondary" className="text-xs">
                  {chat.visibility.toLowerCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
