"use client";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Toggle } from "@workspace/ui/components/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CiGlobe } from "react-icons/ci";
import { FaArrowUp } from "react-icons/fa6";
import { SelectModel } from "@/components/select-model";
import { models, Models } from "@/lib/models";
import Upload from "@/components/chat/upload";
import { useState } from "react";
import ImageSquarePreview from "@/components/chat/ImageSquarePreview";
import { FileUIPart } from "ai";
import { SelectPersonality } from "@/components/select-personality";
import { personalities } from "@/lib/prompts/personality";
import { cn } from "@workspace/ui/lib/utils";

interface ChatInputProps {
  className?: string;
  input: string;
  setInput: (value: string) => void;
  isSubmitting: boolean;
  toggleWebSearch: boolean;
  setToggleWebSearch: (value: boolean) => void;
  selectedModel: Models | null;
  setSelectedModel: (model: Models) => void;
  onSubmit: (e: React.FormEvent) => void;
  fileParts: FileUIPart[] | null;
  setFileParts: (parts: FileUIPart[] | null) => void;
  personality?: string | null;
  setPersonality?: (personality: string | null) => void;
  disablePersonality?: boolean;
}

export function ChatInput({
  className,
  input,
  setInput,
  isSubmitting,
  toggleWebSearch,
  setToggleWebSearch,
  selectedModel,
  setSelectedModel,
  onSubmit,
  fileParts,
  setFileParts,
  disablePersonality,
  personality,
  setPersonality,
}: ChatInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState<string | null>(null);
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && !isUploading) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  }

  return (
    <>
      <div
        className={cn(
          "bg-muted/30 rounded-lg flex flex-col border border-border m-2",
          className,
        )}
      >
        <div className="w-full">
          {(uploadingPreview || fileParts) && (
            <div className="rounded-lg mb-3 flex flex-row gap-2 flex-wrap">
              {uploadingPreview && (
                <ImageSquarePreview
                  src={uploadingPreview}
                  loading
                  size={80}
                  onRemove={() => setUploadingPreview(null)}
                />
              )}
              {fileParts?.map((part, index) => (
                <ImageSquarePreview
                  key={index}
                  src={part.url}
                  size={80}
                  onRemove={() => {
                    const next = [...(fileParts || [])];
                    next.splice(index, 1);
                    setFileParts(next.length ? next : null);
                  }}
                />
              ))}
            </div>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isSubmitting}
            className="text-sm sm:text-base bg-muted/30 dark:bg-muted/30 focus:bg-muted/30 dark:focus:bg-muted/30 resize-none focus:outline-none focus:ring-0 border-none focus:border-none focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none focus:shadow-none focus:ring-offset-0 focus:ring-offset-transparent shadow-none ring-0 outline-none max-h-[200px] sm:max-h-[300px] rounded-t-lg rounded-b-none px-3 py-2"
          />
        </div>
        <div className="flex flex-row justify-between items-center gap-2 p-2 my-auto">
          <div className="flex flex-row gap-1 sm:gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger>
                <Toggle
                  pressed={toggleWebSearch}
                  onPressedChange={setToggleWebSearch}
                  size="sm"
                >
                  <CiGlobe className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Web Search</p>
              </TooltipContent>
            </Tooltip>
            <Upload
              fileParts={fileParts}
              setFileParts={setFileParts}
              setIsUploading={setIsUploading}
              setUploadingPreview={setUploadingPreview}
            />
          </div>
          <div className="flex-shrink-0 flex flex-row gap-2 my-auto flex-wrap">
            <div className="flex flex-row gap-1 sm:gap-2 flex-wrap">
              <SelectPersonality
                disabled={disablePersonality}
                personalities={personalities}
                selectedPersonality={
                  personalities.find((p) => p.name === personality)!
                }
                setSelectedPersonality={(personality) =>
                  setPersonality?.(personality.name)
                }
              />
              <SelectModel
                models={models}
                selectedModel={selectedModel!}
                setSelectedModel={setSelectedModel}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="hover:cursor-pointer my-auto"
                  size="sm"
                  onClick={onSubmit}
                  disabled={isSubmitting || isUploading}
                >
                  <FaArrowUp className="my-auto" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}
