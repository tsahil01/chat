"use client";

import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { useParams, useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { getUIMessages } from "@/lib/chat";
import { Spinner } from "@workspace/ui/components/ui/shadcn-io/spinner";

export default function Page() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      setChatId(params.id);
    } else {
      router.replace("/");
    }
  }, [params?.id]);

  const chatIdRef = useRef<string | null>(null);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const { messages, setMessages } = useChat({
    id: chatId || generateUUID(),
    onError: (error) => {
      console.error("Chat error:", error);

      // Handle different error types
      if (error.message?.includes("Monthly message limit exceeded")) {
        let errorMessage =
          "⚠️ You have reached your message limit for the month. Please upgrade to a paid plan to continue using the app.";

        try {
          const errorData = JSON.parse(error.message);
          if (errorData.currentUsage && errorData.limit) {
            errorMessage = `⚠️ You have used ${errorData.currentUsage}/${errorData.limit} messages this month. Please upgrade to a paid plan to continue using the app.`;
          }
        } catch {
          // Use default message if parsing fails
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            parts: [{ type: "text", text: errorMessage }],
            id: `error-${Date.now()}`,
            createdAt: new Date(),
          } as UIMessage,
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            parts: [
              {
                type: "text",
                text: `⚠️ An unexpected error occurred. Please try again. \nError: ${error.message}`,
              },
            ],
            id: `error-${Date.now()}`,
            createdAt: new Date(),
          } as UIMessage,
        ]);
      }
    },
  });

  useEffect(() => {
    if (chatId) {
      getChatsMessages();
    }
  }, [chatId]);

  async function getChatsMessages() {
    if (!chatId) return;

    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/${chatId}/share/messages`);
      if (!response.ok) {
        if (response.status === 404) {
          setMessages([]);
          return;
        }
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      const uiMessages = await getUIMessages(data.messages);
      setMessages(uiMessages);
    } catch (error) {
      console.error("Error getting chat messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner variant="ring" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] w-full mx-auto px-2">
      <div className="flex-1 overflow-y-auto space-y-4 p-2 sm:p-4">
        <MessageList
          className="w-full md:max-w-5xl mx-auto"
          messages={messages}
          isReasoningCollapsed={() => false}
          onToggleReasoning={() => {}}
          onRetry={() => {}}
          chatEndRef={chatEndRef}
          showRetry={false}
        />
      </div>
    </div>
  );
}
