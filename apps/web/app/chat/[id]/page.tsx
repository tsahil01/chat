"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, FileUIPart, UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/MessageList";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { models, Models } from "@/lib/models";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { getUIMessages } from "@/lib/chat";
import { authClient } from "@/lib/auth-client";
import { AuthDialog } from "@/components/auth-dialog";

export default function Page() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Models | null>(models[0]!);
  const [collapsedReasoning, setCollapsedReasoning] = useState<Set<string>>(
    new Set(),
  );
  const [toggleWebSearch, setToggleWebSearch] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasProcessedUrlInput, setHasProcessedUrlInput] = useState(false);
  const [personalityName, setPersonalityName] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [fileParts, setFileParts] = useState<FileUIPart[] | null>(null);
  const { data: session, isPending } = authClient.useSession();

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!session && !isPending) {
      setAuthOpen(true);
      router.push("/");
    }
  }, [session, isPending]);

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      setChatId(params.id);
    } else {
      router.replace("/");
    }
  }, [params?.id]);

  const chatIdRef = useRef<string | null>(null);
  const selectedModelRef = useRef<Models | null>(null);
  const toggleWebSearchRef = useRef<boolean>(false);
  const personalityNameRef = useRef<string | null>(null);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  useEffect(() => {
    toggleWebSearchRef.current = toggleWebSearch;
  }, [toggleWebSearch]);

  useEffect(() => {
    personalityNameRef.current = personalityName;
  }, [personalityName]);

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      prepareSendMessagesRequest: ({ id, messages }) => {
        const effectiveChatId = chatIdRef.current || id;
        const effectiveModel = selectedModelRef.current;
        const effectiveToggle = toggleWebSearchRef.current;
        return {
          body: {
            chatId: effectiveChatId,
            messages,
            selectedChatModel: effectiveModel?.model,
            selectedChatProvider: effectiveModel?.provider,
            toggleWebSearch: effectiveToggle,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            personality: personalityNameRef.current,
          },
        };
      },
    });
  }, []);

  const { messages, setMessages, sendMessage, regenerate } = useChat({
    id: chatId || generateUUID(),
    transport,
    onFinish: () => {
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsSubmitting(false);

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
      } else if (error.message?.includes("Failed to generate response")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            parts: [
              {
                type: "text",
                text: `⚠️ Sorry, there was an error generating the response. Please try again. \nError: ${error.message}`,
              },
            ],
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
  const chatEndRef = useAutoScroll({ messages, collapsedReasoning });

  useEffect(() => {
    if (chatId) {
      const messageFromUrl = searchParams.get("input");
      const selectedModelNameFromUrl = searchParams.get("selectedModel");
      const toggleWebSearchFromUrl = searchParams.get("toggleWebSearch");
      const personalityNameFromUrl = searchParams.get("personality");
      if (selectedModelNameFromUrl) {
        setSelectedModel(
          models.find((model) => model.model === selectedModelNameFromUrl) ||
            models[0]!,
        );
      }
      if (toggleWebSearchFromUrl === "true") {
        setToggleWebSearch(true);
      }
      if (personalityNameFromUrl) {
        setPersonalityName(personalityNameFromUrl);
      }
      if (!messageFromUrl) {
        getChatsMessages();
      }
    }
  }, [chatId]);

  async function getChatsMessages() {
    if (!chatId) return;

    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      if (!response.ok) {
        if (response.status === 404) {
          setMessages([]);
          return;
        }
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      setPersonalityName(data.personality || null);
      const uiMessages = await getUIMessages(data.messages);
      setMessages(uiMessages);
    } catch (error) {
      console.error("Error getting chat messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    const messageFromUrl = searchParams.get("input");
    if (
      messageFromUrl &&
      !hasProcessedUrlInput &&
      !isLoadingMessages &&
      !isSubmitting &&
      chatId
    ) {
      setHasProcessedUrlInput(true);
      let fileParts: FileUIPart[] | null = null;
      const filePartsFromUrl = searchParams.get("fileParts");
      if (filePartsFromUrl) {
        try {
          const decoded = decodeURIComponent(filePartsFromUrl);
          const parsed = JSON.parse(decoded);
          if (Array.isArray(parsed)) {
            fileParts = parsed;
          }
        } catch (err) {
          console.error("Failed to parse fileParts from URL", err);
        }
      }
      router.replace(`/chat/${chatId}`, { scroll: false });
      setIsSubmitting(true);
      sendMessage({
        text: messageFromUrl,
        ...(fileParts ? { files: fileParts } : {}),
      });
    }
  }, [
    searchParams,
    hasProcessedUrlInput,
    isLoadingMessages,
    isSubmitting,
    sendMessage,
    chatId,
    router,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!session) {
        setAuthOpen(true);
        return;
      }
      if (fileParts && !selectedModel?.fileSupport) {
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            parts: [
              {
                type: "text",
                text: `⚠️ File upload is not supported for this model. Please try again with a different model.`,
              },
            ],
            id: `error-${Date.now()}`,
            createdAt: new Date(),
          } as UIMessage,
        ]);
        return;
      }
      const inputToSend = input;
      setInput("");
      await sendMessage({
        text: inputToSend,
        ...(fileParts ? { files: fileParts } : {}),
      });
      setFileParts(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReasoning = (messageId: string, partIndex: number) => {
    const key = `${messageId}-${partIndex}`;
    setCollapsedReasoning((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] w-full mx-auto p-2">
      <div className="flex-1 overflow-y-auto space-y-4 p-2 sm:p-4">
        <MessageList
          className="w-full md:max-w-5xl mx-auto"
          messages={messages}
          isReasoningCollapsed={(key) => collapsedReasoning.has(key)}
          onToggleReasoning={toggleReasoning}
          onRetry={(messageId) => {
            setIsSubmitting(true);
            regenerate({ messageId });
          }}
          chatEndRef={chatEndRef}
        />
        <div className="w-full md:max-w-5xl mx-auto p-2">
          {isSubmitting && <TypingIndicator />}
        </div>
      </div>

      <ChatInput
        className="w-full md:max-w-5xl mx-auto"
        disablePersonality={true}
        input={input}
        setInput={setInput}
        isSubmitting={isSubmitting}
        toggleWebSearch={toggleWebSearch}
        setToggleWebSearch={setToggleWebSearch}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        onSubmit={handleSubmit}
        fileParts={fileParts}
        setFileParts={setFileParts}
        personality={personalityName}
        setPersonality={setPersonalityName}
      />
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        showTrigger={false}
      />
    </div>
  );
}
