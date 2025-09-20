'use client';

import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner variant="circle" size={32} />
    </div>
  );
}
