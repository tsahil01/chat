'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useEffect, useState } from 'react';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { MessageActions } from '@/components/message-actions';
import { ChatInput } from '@/components/chat-input';
import { TextPart } from '@/components/message-parts/text-part';
import { ToolPart } from '@/components/message-parts/tool-part';
import { ReasoningPart } from '@/components/message-parts/reasoning-part';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { models, Models } from '@/lib/models';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { canUserSendMessage } from '@/lib/usage';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

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


  const { messages, sendMessage, regenerate } = useChat({
    id: chatId || 'new-chat',
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
  const { data } = authClient.useSession();
  const chatEndRef = useAutoScroll({ messages, collapsedReasoning });

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
      console.log('canSend', canSend);
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

          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={message.id} className="flex gap-3">
                {/* Avatar */}
                {message.role === 'user' && <>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center my-auto">
                    <Avatar>
                      <AvatarImage src={data?.user?.image || ""} />
                      <AvatarFallback className="text-xs">{data?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                </>}

                {/* Message Content */}
                <div className={`space-y-2 ${message.role === 'user' ? 'w-auto' : 'w-full'}`}>
                  <div className={`rounded-lg p-3 ${message.role === 'user'
                    ? 'bg-muted text-foreground max-w-xl w-auto'
                    : 'text-foreground'
                    }`}>
                    <div className="space-y-3">
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case 'text':
                            return (
                              <TextPart
                                key={`${message.id}-${i}`}
                                text={part.text}
                                messageId={message.id}
                                partIndex={i}
                              />
                            );
                          case 'tool-exaWebSearch':
                            return (
                              <ToolPart
                                key={`${message.id}-${i}`}
                                part={part}
                                messageId={message.id}
                                partIndex={i}
                              />
                            );
                          case 'reasoning':
                            const reasoningKey = `${message.id}-${i}`;
                            const isCollapsed = collapsedReasoning.has(reasoningKey);
                            return (
                              <ReasoningPart
                                key={`${message.id}-${i}`}
                                part={part}
                                messageId={message.id}
                                partIndex={i}
                                isCollapsed={isCollapsed}
                                onToggle={toggleReasoning}
                              />
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  </div>

                  {/* Interactive Elements for AI messages */}
                  {message.role === 'assistant' && (
                    <MessageActions
                      onCopy={() => {
                        // TODO: Implement copy functionality
                        const textParts = message.parts
                          .filter(p => p.type === 'text' && 'text' in p)
                          .map(p => (p as any).text)
                          .join('');
                        navigator.clipboard.writeText(textParts);
                      }}
                      onRetry={() => {
                        regenerate({ messageId: message.id });
                      }}
                    />
                  )}

                  {/* Disclaimer for AI messages */}
                  {message.role === 'assistant' && (
                    <p className="text-xs text-muted-foreground text-end">
                      AI can make mistakes. Please double-check responses.
                    </p>
                  )}
                </div>
              </div>
            ))}
            {/* Auto-scroll anchor */}
            <div ref={chatEndRef} />
          </div>
        {isSubmitting && (
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="rounded-lg p-3">
                <Spinner variant="bars" size={16} />
              </div>
            </div>
          </div>
        )}
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