'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useEffect, useState } from 'react';
import { ChatInput } from '@/components/chat-input';
import { MessageList } from '@/components/chat/MessageList';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { models, Models } from '@/lib/models';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { canUserSendMessage } from '@/lib/usage/client';
import { generateUUID } from '@/lib/utils';
import { getUIMessages } from '@/lib/chat';

export default function Chat() {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Models | null>(models[0]!);
  const [collapsedReasoning, setCollapsedReasoning] = useState<Set<string>>(new Set());
  const [toggleWebSearch, setToggleWebSearch] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (params?.id && typeof params.id === 'string') {
      setChatId(params.id);
    } else {
      router.replace('/');
    }
  }, [params?.id]);


  const { messages, setMessages, sendMessage, regenerate } = useChat({
    id: chatId || generateUUID(),
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest: ({ id, messages }) => {
        return {
          body: {
            chatId: chatId || id,
            messages,
            selectedChatModel: selectedModel?.model,
            toggleWebSearch: toggleWebSearch,
          },
        };
      },
    }),
  });
  const chatEndRef = useAutoScroll({ messages, collapsedReasoning });

  useEffect(() => {
    getChatsMessages();
  }, [chatId]);


  async function getChatsMessages() {
    try {
      const response = await fetch(`/api/chat/${params.id}/messages`);
      const data = await response.json();
      const uiMessages = await getUIMessages(data.messages);
      setMessages(uiMessages);
    } catch (error) {
      console.error("Error getting chat messages:", error);
    }

  }

  useEffect(() => {
    const messageFromUrl = searchParams.get('message');
    if (messageFromUrl && messages.length === 0 && !isSubmitting) {
      const decodedMessage = decodeURIComponent(messageFromUrl);
      setInput(decodedMessage);
      sendMessage({ text: decodedMessage });
      setInput('');
      router.replace(`/chat/${chatId}`, { scroll: false });
    }
  }, [searchParams, messages.length, isSubmitting, sendMessage, chatId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const canSend = await canUserSendMessage();
      if (!canSend) {
        messages.push({
          role: 'system',
          parts: [{ type: 'text', text: '⚠️ You have reached your message limit for the month. Please upgrade to a paid plan to continue using the app.' }],
          id: `assistant-${Date.now()}`,
          createdAt: new Date(),
        } as UIMessage);
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
    </div >
  );
}