'use client';

import { useState } from 'react';
import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';
import { WelcomeScreen } from '@/components/welcome-screen';
import { ChatInput } from '@/components/chat-input';
import { models, Models } from '@/lib/models';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';

export default function Chat() {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Models | null>(models[0]!);
  const [toggleWebSearch, setToggleWebSearch] = useState(false);
  
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
        const newChatId = generateUUID();
        const encodedInput = encodeURIComponent(input);
        router.replace(`/chat/${newChatId}?input=${encodedInput}`, { scroll: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <WelcomeScreen />
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