'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/MessageList';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { models, Models } from '@/lib/models';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { canUserSendMessage } from '@/lib/usage/client';
import { generateUUID } from '@/lib/utils';
import { getUIMessages } from '@/lib/chat';
import { authClient } from '@/lib/auth-client';
import { AuthDialog } from '@/components/auth-dialog';

export default function Page() {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Models | null>(models[0]!);
  const [collapsedReasoning, setCollapsedReasoning] = useState<Set<string>>(new Set());
  const [toggleWebSearch, setToggleWebSearch] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasProcessedUrlInput, setHasProcessedUrlInput] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!session && !isPending) {
      router.replace('/');
    }
  }, [session]);

  useEffect(() => {
    if (params?.id && typeof params.id === 'string') {
      setChatId(params.id);
    } else {
      router.replace('/');
    }
  }, [params?.id]);


  const chatIdRef = useRef<string | null>(null);
  const selectedModelRef = useRef<Models | null>(null);
  const toggleWebSearchRef = useRef<boolean>(false);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  useEffect(() => {
    toggleWebSearchRef.current = toggleWebSearch;
  }, [toggleWebSearch]);

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
  });
  const chatEndRef = useAutoScroll({ messages, collapsedReasoning });

  useEffect(() => {
    if (chatId) {
      const messageFromUrl = searchParams.get('input');
      const selectedModelNameFromUrl = searchParams.get('selectedModel');
      const toggleWebSearchFromUrl = searchParams.get('toggleWebSearch');
      if (selectedModelNameFromUrl) {
        setSelectedModel(models.find(model => model.model === selectedModelNameFromUrl) || models[0]!);
      }
      if (toggleWebSearchFromUrl === 'true') {
        setToggleWebSearch(true);
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
    const messageFromUrl = searchParams.get('input');
    if (messageFromUrl && !hasProcessedUrlInput && !isLoadingMessages && !isSubmitting && chatId) {
      const decodedMessage = decodeURIComponent(messageFromUrl);
      setHasProcessedUrlInput(true);
      router.replace(`/chat/${chatId}`, { scroll: false });
      setIsSubmitting(true);
      sendMessage({ text: decodedMessage });
    }
  }, [searchParams, hasProcessedUrlInput, isLoadingMessages, isSubmitting, sendMessage, chatId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!session) {
        setAuthOpen(true);
        return;
      }
      const canSend = await canUserSendMessage();
      if (!canSend) {
        setMessages(prev => [...prev, {
          role: 'system',
          parts: [{ type: 'text', text: '⚠️ You have reached your message limit for the month. Please upgrade to a paid plan to continue using the app.' }],
          id: `assistant-${Date.now()}`,
          createdAt: new Date(),
        } as UIMessage]);
        setIsSubmitting(false);
        return;
      }

      await sendMessage({ text: input });
      setInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReasoning = (messageId: string, partIndex: number) => {
    const key = `${messageId}-${partIndex}`;
    setCollapsedReasoning(prev => {
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
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">

        <MessageList
          messages={messages}
          isReasoningCollapsed={(key) => collapsedReasoning.has(key)}
          onToggleReasoning={toggleReasoning}
          onRetry={(messageId) => regenerate({ messageId })}
          chatEndRef={chatEndRef}
        />
        {isSubmitting && <TypingIndicator />}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        isSubmitting={isSubmitting}
        toggleWebSearch={toggleWebSearch}
        setToggleWebSearch={setToggleWebSearch}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        onSubmit={handleSubmit}
      />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} showTrigger={false} />
    </div >
  );
}