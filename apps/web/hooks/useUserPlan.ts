"use client";

import { useEffect, useState } from "react";
import { isProUser } from "@/lib/payments/client";

export function useUserPlan() {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pro = await isProUser();
        if (!cancelled) setIsPro(!!pro);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isPro, loading };
}
