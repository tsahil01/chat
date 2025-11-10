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
import { LuCpu, LuChevronDown } from "react-icons/lu";
import { Models } from "@/lib/models";
import { Badge } from "@workspace/ui/components/badge";

export function SelectModel({
  models,
  selectedModel,
  setSelectedModel,
}: {
  models: Models[];
  selectedModel: Models;
  setSelectedModel: (model: Models) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleModelSelect = (model: Models) => {
    setSelectedModel(model);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="justify-between min-w-[80px] max-w-[120px] sm:min-w-[100px] sm:max-w-[150px]"
            >
              <div className="flex items-center gap-1 sm:gap-2 truncate">
                <LuCpu className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 hidden sm:block" />
                <span className="truncate text-xs">
                  {selectedModel?.displayName || "Model"}
                </span>
              </div>
              <LuChevronDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{selectedModel?.displayName}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-72 sm:w-80 p-0" align="start">
        <div className="p-2">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 px-2">
            Select Model
          </div>
          <div className="space-y-1">
            {models.map((model, index) => (
              <Button
                key={index}
                variant={
                  selectedModel?.model === model.model ? "secondary" : "ghost"
                }
                className="w-full justify-start h-auto p-2 sm:p-3"
                onClick={() => handleModelSelect(model)}
              >
                <div className="flex flex-col justify-between gap-1 w-full">
                  <div className="flex flex-row justify-between items-start gap-1">
                    <div className="font-medium text-sm sm:text-base">
                      {model.displayName}
                    </div>
                    {model.fileSupport && (
                      <Badge className="text-xs">File Upload</Badge>
                    )}
                    {model.thinking && (
                      <Badge className="text-xs">Reasoning</Badge>
                    )}
                    {model.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant={"secondary"}
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-start text-muted-foreground truncate">
                    Provider: {model.provider}
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
