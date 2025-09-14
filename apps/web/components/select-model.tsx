"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { LuCpu, LuChevronDown } from "react-icons/lu";
import { Models } from "@/lib/models";

export function SelectModel({ models, selectedModel, setSelectedModel }: { models: Models[], selectedModel: Models, setSelectedModel: (model: Models) => void }) {
    const [open, setOpen] = useState(false);

    const handleModelSelect = (model: typeof models[0]) => {
        setSelectedModel(model);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between min-w-[200px]">
                    <div className="flex items-center gap-2">
                        <LuCpu className="w-4 h-4" />
                        <span className="truncate">{selectedModel?.model || "Select Model"}</span>
                    </div>
                    <LuChevronDown className="w-4 h-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
                        Select Model
                    </div>
                    <div className="space-y-1">
                        {models.map((model, index) => (
                            <Button
                                key={index}
                                variant={selectedModel?.model === model.model ? "secondary" : "ghost"}
                                className="w-full justify-start h-auto p-3"
                                onClick={() => handleModelSelect(model)}
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <div className="font-medium">{model.model}</div>
                                    <div className="text-xs text-muted-foreground">
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