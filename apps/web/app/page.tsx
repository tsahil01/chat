"use client";

import { useState } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { appConfig } from "@workspace/config";
import { ChatInput } from "@/components/chat/chat-input";
import { models, Models } from "@/lib/models";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { AuthDialog } from "@/components/auth-dialog";
import { FileUIPart } from "ai";

export default function Chat() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Models | null>(models[0]!);
  const [toggleWebSearch, setToggleWebSearch] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [fileParts, setFileParts] = useState<FileUIPart[] | null>(null);
  const [personalityName, setPersonalityName] = useState<string | null>(null);

  const { data: session, isPending } = authClient.useSession();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!session && !isPending) {
        setAuthOpen(true);
        return;
      }
      const newChatId = generateUUID();
      let url = `/chat/${newChatId}`;
      const encodedInput = `?input=${encodeURIComponent(input)}`;
      const encodedSelectedModel = `&selectedModel=${encodeURIComponent(selectedModel?.model || "")}`;
      const encodedToggleWebSearch = `&toggleWebSearch=${encodeURIComponent(toggleWebSearch)}`;
      const encodedPersonality = `&personality=${encodeURIComponent(personalityName || "")}`;
      const encodedFileParts = fileParts
        ? `&fileParts=${encodeURIComponent(JSON.stringify(fileParts))}`
        : "";
      if (encodedInput) {
        url += encodedInput;
      }
      if (encodedSelectedModel) {
        url += encodedSelectedModel;
      }
      if (encodedPersonality) {
        url += encodedPersonality;
      }
      if (encodedToggleWebSearch) {
        url += encodedToggleWebSearch;
      }
      if (encodedFileParts) {
        url += encodedFileParts;
      }
      router.replace(url, { scroll: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto my-auto flex h-full max-w-5xl flex-col justify-center p-2">
      <div className="mb-4 px-3 text-left sm:mb-6 sm:px-0">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Welcome to {appConfig.appName}
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Start a conversation by typing a message below.
        </p>
      </div>
      <ChatInput
        className="m-0"
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
      <WelcomeScreen />
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        showTrigger={false}
      />
    </div>
  );
}
