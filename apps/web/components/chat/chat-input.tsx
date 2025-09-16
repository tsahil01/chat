import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Toggle } from '@workspace/ui/components/toggle';
import { CiGlobe } from 'react-icons/ci';
import { FaArrowTurnUp } from 'react-icons/fa6';
import { SelectModel } from '@/components/select-model';
import { models, Models } from '@/lib/models';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isSubmitting: boolean;
  toggleWebSearch: boolean;
  setToggleWebSearch: (value: boolean) => void;
  selectedModel: Models | null;
  setSelectedModel: (model: Models) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({
  input,
  setInput,
  isSubmitting,
  toggleWebSearch,
  setToggleWebSearch,
  selectedModel,
  setSelectedModel,
  onSubmit
}: ChatInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  }
  
  return (
    <div className="bg-muted/30 p-4 rounded-lg flex flex-col gap-5">
      <div className="max-w-4xl mx-auto w-full">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={isSubmitting}
          className="py-3 text-base bg-muted/30 focus:bg-background resize-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none focus:ring-offset-0 focus:ring-offset-transparent"
        />
      </div>
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row gap-2'>
          <Toggle pressed={toggleWebSearch} onPressedChange={setToggleWebSearch}>
            <CiGlobe />
          </Toggle>
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
            disabled={isSubmitting}
          >
            <FaArrowTurnUp />
          </Button>
        </div>
      </div>
    </div>
  );
}
