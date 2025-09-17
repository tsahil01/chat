"use client";
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Toggle } from '@workspace/ui/components/toggle';
import { CiGlobe } from 'react-icons/ci';
import { FaArrowTurnUp } from 'react-icons/fa6';
import { SelectModel } from '@/components/select-model';
import { models, Models } from '@/lib/models';
import Upload from './upload';
import { useState } from 'react';
import ImageSquarePreview from './ImageSquarePreview';
import { FileUIPart } from 'ai';

interface ChatInputProps {
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
}

export function ChatInput({
  input,
  setInput,
  isSubmitting,
  toggleWebSearch,  
  setToggleWebSearch,
  selectedModel,
  setSelectedModel,
  onSubmit,
  fileParts,
  setFileParts
}: ChatInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState<string | null>(null);
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && !isUploading) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  }
  
  return (
    <>
    <div className="bg-muted/30 p-4 rounded-lg flex flex-col gap-5">
      <div className="max-w-4xl mx-auto w-full">
        {(uploadingPreview || fileParts) && (
      <div className="rounded-lg mb-3 flex flex-row gap-2 flex-wrap">
        {uploadingPreview && (
          <ImageSquarePreview 
            src={uploadingPreview} 
            loading 
            size={96}
            onRemove={() => setUploadingPreview(null)}
          />
        )}
        {fileParts?.map((part, index) => (
          <ImageSquarePreview 
            key={index} 
            src={part.url} 
            size={96} 
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
          className="py-3 text-base bg-muted/30 dark:bg-muted/30 focus:bg-background dark:focus:bg-background resize-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none focus:ring-offset-0 focus:ring-offset-transparent"
        />
      </div>
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row gap-2'>
          <Toggle pressed={toggleWebSearch} onPressedChange={setToggleWebSearch}>
            <CiGlobe />
          </Toggle>
          <Upload 
            fileParts={fileParts} 
            setFileParts={setFileParts} 
            setIsUploading={setIsUploading}
            setUploadingPreview={setUploadingPreview}
          />
          <SelectModel 
            models={models} 
            selectedModel={selectedModel!} 
            setSelectedModel={setSelectedModel} 
          />
        </div>
        <div>
          <Button 
            className="hover:cursor-pointer" 
            size={"icon"} 
            onClick={onSubmit}
            disabled={isSubmitting || isUploading}
          >
            <FaArrowTurnUp />
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
