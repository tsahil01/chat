"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { LuBrain, LuChevronDown } from "react-icons/lu";
import { Personality } from "@/lib/prompts/personality";

export function SelectPersonality({
  personalities,
  selectedPersonality,
  setSelectedPersonality,
  disabled,
}: {
  personalities: Personality[];
  selectedPersonality: Personality;
  setSelectedPersonality: (personality: Personality) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handlePersonalitySelect = (personality: Personality) => {
    setSelectedPersonality(personality);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              disabled={disabled}
              variant="ghost"
              className="max-w-[120px] min-w-0 justify-between sm:max-w-[150px] md:min-w-[100px]"
            >
              <div className="flex items-center gap-1 truncate sm:gap-2">
                <LuBrain className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                <span className="hidden truncate text-xs sm:block">
                  {selectedPersonality?.name.charAt(0).toUpperCase() +
                    selectedPersonality?.name.slice(1) || "Default"}
                </span>
              </div>
              <LuChevronDown className="h-3 w-3 flex-shrink-0 opacity-50 sm:h-4 sm:w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{selectedPersonality?.description || "Default personality"}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-72 p-0 sm:w-80" align="start">
        <div className="p-2">
          <div className="text-muted-foreground mb-2 px-2 text-xs font-medium sm:text-sm">
            Select Personality
          </div>
          <div className="space-y-1">
            {personalities.map((personality, index) => (
              <Button
                key={index}
                variant={
                  selectedPersonality?.name === personality.name
                    ? "secondary"
                    : "ghost"
                }
                className="h-auto w-full justify-start p-2 sm:p-3"
                onClick={() => handlePersonalitySelect(personality)}
              >
                <div className="flex w-full flex-col justify-between gap-1">
                  <div className="flex flex-row items-start justify-between gap-1">
                    <div className="truncate text-sm font-medium sm:text-base">
                      {personality.name.charAt(0).toUpperCase() +
                        personality.name.slice(1)}
                    </div>
                  </div>
                  <div className="text-muted-foreground truncate text-start text-xs">
                    {personality.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
