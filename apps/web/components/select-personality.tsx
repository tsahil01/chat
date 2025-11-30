"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Input } from "@workspace/ui/components/input";
import { LuBrain, LuChevronDown, LuSearch } from "react-icons/lu";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPersonalities = useMemo(() => {
    if (!searchQuery.trim()) return personalities;
    const query = searchQuery.toLowerCase();
    return personalities.filter(
      (personality) =>
        personality.name.toLowerCase().includes(query) ||
        personality.description.toLowerCase().includes(query)
    );
  }, [personalities, searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handlePersonalitySelect = (personality: Personality) => {
    setSelectedPersonality(personality);
    setOpen(false);
    setSearchQuery("");
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
      <PopoverContent
        className="w-72 p-0 sm:w-80"
        align="start"
        side="top"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={8}
      >
        <div className="p-2">
          <div className="text-muted-foreground mb-2 px-2 text-xs font-medium sm:text-sm">
            Select Personality
          </div>
          <div className="relative mb-2">
            <LuSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search personalities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filteredPersonalities.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No personalities found
              </div>
            ) : (
              filteredPersonalities.map((personality, index) => (
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
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
