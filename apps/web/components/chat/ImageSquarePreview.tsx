"use client";

import Image from "next/image";
import { Spinner } from "@workspace/ui/components/ui/shadcn-io/spinner";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";

export default function ImageSquarePreview({
  src,
  loading = false,
  size = 96,
  onRemove,
}: {
  src: string;
  loading?: boolean;
  size?: number;
  onRemove?: () => void;
}) {
  return (
    <div
      className="relative rounded-lg overflow-hidden bg-muted"
      style={{ width: size, height: size }}
    >
      {/* Maintain perfect square with object-cover */}
      <Image
        src={src}
        alt="File"
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
      {loading && (
        <div className="absolute inset-0 bg-black/30 grid place-items-center">
          <Spinner variant="circle-filled" size={28} className="text-white" />
        </div>
      )}
      {onRemove && (
        <div className="absolute top-1 right-1">
          <Button
            variant="secondary"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
