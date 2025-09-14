'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Copy, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
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
  const { data } = authClient.useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage({ text: input });
      setInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      <AvatarFallback className="text-xs">{data?.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                  </>}

                {/* Message Content */}
                <div className="space-y-2">
                  <div className={`rounded-lg p-3 w-auto ${message.role === 'user'
                    ? 'bg-muted text-foreground max-w-xl w-auto'
                    : 'text-foreground'
                    }`}>
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
                              className="bg-background/50 border rounded p-2 text-sm font-mono"
                            >
                              Tool: Web Search
                            </div>
                          );
                        case 'reasoning':
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="text-sm opacity-70 italic"
                            >
                              {part.text}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
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
          </div>
        )
        }
        {
          isSubmitting && (
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >

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
            <SelectModel models={models} selectedModel={selectedModel!} setSelectedModel={setSelectedModel} />
            <Button className="hover:cursor-pointer" variant={"outline"} size={"icon"}>
              <CiGlobe />
            </Button>
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