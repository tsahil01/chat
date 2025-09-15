'use client';

import { Spinner } from '@workspace/ui/components/ui/shadcn-io/spinner';

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <div className="rounded-lg p-3">
          <Spinner variant="bars" size={16} />
        </div>
      </div>
    </div>
  );
}


