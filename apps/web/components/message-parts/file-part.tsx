'use client';

import { FileUIPart } from 'ai';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { FileText, Image as ImageIcon, File, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface FilePartProps {
  attachment: FileUIPart;
  messageId: string;
  partIndex: number;
}

export function FilePart({ attachment, messageId, partIndex }: FilePartProps) {
  const isImage = attachment.mediaType?.startsWith('image/');
  const isPdf = attachment.mediaType === 'application/pdf';
  
  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4" />;
    if (isPdf) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileName = () => {
    try {
      const filename = attachment.filename;
      return filename || 'file';
    } catch {
      return 'file';
    }
  };

  const handleOpen = () => {
    window.open(attachment.url, '_blank');
  };

  if (isImage) {
    return (
      <div key={`${messageId}-${partIndex}`} className="max-w-md">
        <div className="relative group">
          <Image
            src={attachment.url}
            alt={getFileName()}
            className="max-w-full h-auto rounded-lg shadow-sm border"
            width={300}
            height={300}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card key={`${messageId}-${partIndex}`} className="p-3 max-w-xs">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {getFileName()}
          </p>
          <p className="text-xs text-muted-foreground">
            {attachment.mediaType || 'Unknown type'}
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
