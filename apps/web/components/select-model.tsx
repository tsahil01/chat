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
import { LuCpu, LuChevronDown, LuSearch } from "react-icons/lu";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;
    const query = searchQuery.toLowerCase();
    return models.filter(
      (model) =>
        model.displayName.toLowerCase().includes(query) ||
        model.model.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [models, searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleModelSelect = (model: Models) => {
    setSelectedModel(model);
    setOpen(false);
    setSearchQuery("");
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
            Select Model
          </div>
          <div className="relative mb-2">
            <LuSearch className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
          <div className="max-h-[300px] space-y-1 overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No models found
              </div>
            ) : (
              filteredModels.map((model, index) => (
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
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
