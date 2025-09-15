"use client";

import { useEffect, useState } from "react";
import { getUsagePercentage, getUserUsage } from "@/lib/usage/client";
import { type UsageData } from "@/lib/usage";

export function useUserUsage() {
  const [percentage, setPercentage] = useState<number>(0);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [percent, usageData] = await Promise.all([
          getUsagePercentage(),
          getUserUsage(),
        ]);
        if (!cancelled) {
          setPercentage(Math.round(percent));
          setUsage(usageData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { percentage, usage, loading };
}
