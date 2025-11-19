"use client";

import { Spinner } from "@workspace/ui/components/ui/shadcn-io/spinner";

export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner variant="circle" size={32} />
    </div>
  );
}
