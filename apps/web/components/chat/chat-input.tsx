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
import { useState, useEffect, useRef, useCallback } from "react";
import ImageSquarePreview from "@/components/chat/ImageSquarePreview";
import { FileUIPart } from "ai";
import { SelectPersonality } from "@/components/select-personality";
import { personalities } from "@/lib/prompts/personality";
import { cn } from "@workspace/ui/lib/utils";
import { MdAutoFixHigh } from "react-icons/md";

interface ChatInputProps {
  className?: string;
  firstMessage?: string;
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
  firstMessage,
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
  const [autocompleteText, setAutocompleteText] = useState<string>("");
  const [refinePromptLoading, setRefinePromptLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedInput = input.trim();
    const shouldFetch =
      trimmedInput.length >= 3 &&
      !isSubmitting &&
      !trimmedInput.endsWith("\n") &&
      !trimmedInput.endsWith(".") &&
      !trimmedInput.endsWith("!") &&
      !trimmedInput.endsWith("?");

    if (!shouldFetch) {
      setAutocompleteText("");
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (input.trim().length < 3 || isSubmitting) {
        setAutocompleteText("");
        return;
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat/input/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: input, firstMessage }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Failed to fetch autocomplete");

        const data = await response.json();
        if (data.assistantMessage && input.trim().length >= 3) {
          setAutocompleteText(data.assistantMessage);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Autocomplete error:", error);
        }
        setAutocompleteText("");
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [input, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autocompleteText) {
      setAutocompleteText("");
    }
    setInput(e.target.value);
  };

  const handleAcceptAutocomplete = useCallback(() => {
    if (autocompleteText) {
      const newInput = input + autocompleteText;
      setInput(newInput);
      setAutocompleteText("");

      if (textareaRef.current) {
        textareaRef.current.focus();
        const length = newInput.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }
  }, [autocompleteText, input, setInput]);

  const handleRefinePrompt = async () => {
    try {
      setRefinePromptLoading(true);
      const response = await fetch("/api/chat/input/refine-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      if (!response.ok) throw new Error("Failed to fetch refine prompt");

      const data = await response.json();
      setInput(data.refinedPrompt);
      setRefinePromptLoading(false);
    } catch (error) {
      console.error("Refine prompt error:", error);
      setRefinePromptLoading(false);
    }
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && !isUploading) {
        onSubmit(e as unknown as React.FormEvent);
      }
    } else if (e.key === "Tab" && autocompleteText) {
      e.preventDefault();
      handleAcceptAutocomplete();
    } else if (e.key === "Escape" && autocompleteText) {
      e.preventDefault();
      setAutocompleteText("");
    }
  }

  return (
    <>
      <div
        className={cn(
          "bg-muted/30 border-border m-2 flex flex-col rounded-lg border",
          className,
        )}
      >
        <div className="w-full">
          {(uploadingPreview || fileParts) && (
            <div className="mb-3 flex flex-row flex-wrap gap-2 rounded-lg">
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
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={isSubmitting}
              className="bg-muted/30 dark:bg-muted/30 focus:bg-muted/30 dark:focus:bg-muted/30 relative z-10 max-h-[200px] resize-none rounded-t-lg rounded-b-none border-none px-3 py-2 text-sm shadow-none ring-0 outline-none focus:border-none focus:shadow-none focus:ring-0 focus:ring-offset-0 focus:ring-offset-transparent focus:outline-none focus-visible:border-none focus-visible:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:max-h-[300px] sm:text-base"
            />
            {autocompleteText && !isSubmitting && textareaRef.current && (
              <div
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden bg-transparent px-3 py-2 break-words whitespace-pre-wrap"
                style={{
                  maxHeight: "200px",
                  fontFamily: window.getComputedStyle(textareaRef.current)
                    .fontFamily,
                  lineHeight: window.getComputedStyle(textareaRef.current)
                    .lineHeight,
                  fontSize: window.getComputedStyle(textareaRef.current)
                    .fontSize,
                }}
                aria-hidden="true"
              >
                <span className="invisible">{input}</span>
                <span className="text-muted-foreground">
                  {autocompleteText}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="my-auto flex flex-row items-center justify-between gap-2 p-2">
          <div className="flex flex-row flex-wrap gap-1 sm:gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Toggle
                  pressed={toggleWebSearch}
                  onPressedChange={setToggleWebSearch}
                  size="sm"
                >
                  <CiGlobe className="h-4 w-4" />
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
            <Tooltip>
              <TooltipTrigger>
                <Button
                  onClick={handleRefinePrompt}
                  size="sm"
                  variant="ghost"
                  disabled={refinePromptLoading || input.length < 3}
                >
                  <MdAutoFixHigh className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refine Prompt</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="my-auto flex flex-shrink-0 flex-row flex-wrap gap-2">
            <div className="flex flex-row flex-wrap gap-1 sm:gap-2">
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
                  className="my-auto hover:cursor-pointer"
                  size="sm"
                  onClick={onSubmit}
                  disabled={
                    isSubmitting ||
                    isUploading ||
                    refinePromptLoading ||
                    input.length < 1
                  }
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
