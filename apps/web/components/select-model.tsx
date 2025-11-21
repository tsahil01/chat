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
              className="max-w-[120px] min-w-0 justify-between sm:max-w-[150px] md:min-w-[100px]"
            >
              <div className="flex items-center gap-1 truncate sm:gap-2">
                <LuCpu className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                <span className="hidden truncate text-xs sm:block">
                  {selectedModel?.displayName || "Model"}
                </span>
              </div>
              <LuChevronDown className="h-3 w-3 flex-shrink-0 opacity-50 sm:h-4 sm:w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{selectedModel?.displayName}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-72 p-0 sm:w-80" align="start">
        <div className="p-2">
          <div className="text-muted-foreground mb-2 px-2 text-xs font-medium sm:text-sm">
            Select Model
          </div>
          <div className="space-y-1">
            {models.map((model, index) => (
              <Button
                key={index}
                variant={
                  selectedModel?.model === model.model ? "secondary" : "ghost"
                }
                className="h-auto w-full justify-start p-2 sm:p-3"
                onClick={() => handleModelSelect(model)}
              >
                <div className="flex w-full flex-col justify-between gap-1">
                  <div className="flex flex-row items-start justify-between gap-1">
                    <div className="text-sm font-medium sm:text-base">
                      {model.displayName}
                    </div>
                    {model.fileSupport && (
                      <Badge className="text-xs">File Upload</Badge>
                    )}
                    {model.thinking && (
                      <Badge className="text-xs">Reasoning</Badge>
                    )}
                    {model.tags?.map((tag) => (
                      <Badge key={tag} className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="truncate text-start text-xs">
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
