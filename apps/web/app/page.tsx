'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { FaArrowTurnUp } from 'react-icons/fa6';
import { SelectModel } from '@/components/select-model';
import { models, Models } from '@/lib/models';
import { CiGlobe } from 'react-icons/ci';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Models | null>(models[0]!);
  const [collapsedReasoning, setCollapsedReasoning] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { data } = authClient.useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage({ text: input, metadata: { model: selectedModel?.model } });
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll reasoning boxes when they expand
  useEffect(() => {
    // Find all expanded reasoning boxes and scroll them to bottom
    const reasoningContainers = document.querySelectorAll('.max-h-32.overflow-y-auto');
    reasoningContainers.forEach(container => {
      container.scrollTop = container.scrollHeight;
    });
  }, [collapsedReasoning]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Welcome to Chat</h1>
              <p className="text-muted-foreground">Start a conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
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
                              <div key={`${message.id}-${i}`} className="">
                                {part.text}
                              </div>
                            );
                          case 'tool-exaWebSearch':
                            return (
                              <div
                                key={`${message.id}-${i}`}
                                className="bg-background/50 p-2 text-sm font-mono max-w-xl"
                              >
                                <div className="flex items-center gap-2">
                                  <span>Tool: Web Search</span>
                                  {part.state !== 'output-available' && (
                                    <Spinner variant="ring" size={16} />
                                  )}
                                </div>
                              </div>
                            );
                          case 'reasoning':
                            const reasoningKey = `${message.id}-${i}`;
                            const isCollapsed = collapsedReasoning.has(reasoningKey);
                            return (
                              <div
                                key={`${message.id}-${i}`}
                                className="border rounded-lg bg-muted/30 max-w-xl"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleReasoning(message.id, i)}
                                  className="w-full justify-between p-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                  <span>Reasoning</span>
                                  {isCollapsed ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronUp className="w-4 h-4" />
                                  )}
                                </Button>
                                {!isCollapsed && (
                                  <div className="px-3 pb-3">
                                    <div className="max-h-32 overflow-y-auto text-sm opacity-70 italic whitespace-pre-wrap">
                                      {part.text}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  </div>

                  {/* Interactive Elements for AI messages */}
                  {message.role === 'assistant' && (
                    <div className="flex justify-end items-center gap-2 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 p-0">
                        <span>Retry</span>
                      </Button>
                    </div>
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
        )}
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

      <div className="bg-muted/30 p-4 rounded-lg flex flex-col gap-5">
        <div className="max-w-4xl mx-auto w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isSubmitting}
            className="py-3 text-base bg-muted/30 focus:bg-background resize-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none focus:ring-offset-0 focus:ring-offset-transparent "
          />
        </div>
        <div className='flex flex-row justify-between'>
          <div className='flex flex-row gap-2'>
            <Button className="hover:cursor-pointer" variant={"outline"} size={"icon"}>
              <CiGlobe />
            </Button>
            <SelectModel models={models} selectedModel={selectedModel!} setSelectedModel={setSelectedModel} />
          </div>
          <div>
            <Button className="hover:cursor-pointer" size={"icon"} onClick={handleSubmit}>
              <FaArrowTurnUp />
            </Button>
          </div>

        </div>
      </div>
    </div >
  );
}