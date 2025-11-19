"use client";

import { FileUIPart } from "ai";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { FileText, Image as ImageIcon, File, ExternalLink } from "lucide-react";

interface CustomFileUIPart {
  type: "file";
  file: {
    type: "file";
    mediaType: string;
    base64Data: string;
  };
}

interface FilePartProps {
  attachment: FileUIPart | CustomFileUIPart;
  messageId: string;
  partIndex: number;
}

export function FilePart({ attachment, messageId, partIndex }: FilePartProps) {
  const isImage =
    (attachment as FileUIPart).mediaType?.startsWith("image/") ||
    (attachment as CustomFileUIPart).file?.mediaType?.startsWith("image/");
  const isPdf =
    (attachment as FileUIPart).mediaType === "application/pdf" ||
    (attachment as CustomFileUIPart).file?.mediaType === "application/pdf";

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4" />;
    if (isPdf) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileName = () => {
    try {
      const filename = (attachment as FileUIPart).filename;
      return filename || "file";
    } catch {
      return "file";
    }
  };

  const handleOpen = () => {
    window.open((attachment as FileUIPart).url, "_blank");
  };

  if (isImage) {
    return (
      <div key={`${messageId}-${partIndex}`} className="max-w-md">
        <div className="group relative">
          <img
            src={
              (attachment as FileUIPart).url ||
              `data:${(attachment as CustomFileUIPart).file?.mediaType};base64,${(attachment as CustomFileUIPart).file?.base64Data}`
            }
            alt={getFileName()}
            className="h-auto max-h-80 w-auto max-w-full rounded-lg border shadow-sm"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card key={`${messageId}-${partIndex}`} className="max-w-xs p-3">
      {JSON.stringify(attachment)}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getFileIcon()}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{getFileName()}</p>
          <p className="text-muted-foreground text-xs">
            {(attachment as FileUIPart).mediaType ||
              (attachment as CustomFileUIPart)?.file?.mediaType ||
              "Unknown type"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpen}
            className="h-8 w-8"
            aria-label="Open file"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
