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
              className="justify-between min-w-[80px] max-w-[120px] sm:min-w-[100px] sm:max-w-[150px]"
            >
              <div className="flex items-center gap-1 sm:gap-2 truncate">
                <LuBrain className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 hidden sm:block" />
                <span className="truncate text-xs">
                  {selectedPersonality?.name.charAt(0).toUpperCase() +
                    selectedPersonality?.name.slice(1) || "Default"}
                </span>
              </div>
              <LuChevronDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{selectedPersonality?.description || "Default personality"}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-72 sm:w-80 p-0" align="start">
        <div className="p-2">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 px-2">
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
                className="w-full justify-start h-auto p-2 sm:p-3"
                onClick={() => handlePersonalitySelect(personality)}
              >
                <div className="flex flex-col justify-between gap-1 w-full">
                  <div className="flex flex-row justify-between items-start gap-1">
                    <div className="font-medium text-sm sm:text-base truncate">
                      {personality.name.charAt(0).toUpperCase() +
                        personality.name.slice(1)}
                    </div>
                  </div>
                  <div className="text-xs text-start text-muted-foreground truncate">
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
