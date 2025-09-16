"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

type Coin = "bitcoin" | "ethereum" | "solana";

type PriceResponse = Record<
  Coin,
  {
    usd: number;
    usd_24h_change?: number;
  }
>;

export function CryptoWidget({ className }: { className?: string }) {
  const [data, setData] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCoin, setSelectedCoin] = useState<Coin>("bitcoin");


  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/crypto?ids=bitcoin,ethereum,solana`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setData(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function formatUsd(n?: number) {
    if (typeof n !== "number") return "—";
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
  }

  function sentimentBg(change?: number): string {
    if (typeof change !== "number") return "bg-muted/30 dark:bg-muted/10";
    if (change > 2) return "bg-gradient-to-b from-emerald-100/60 to-emerald-50/30 dark:from-emerald-900/30 dark:to-emerald-900/10";
    if (change > 0) return "bg-gradient-to-b from-emerald-50/60 to-emerald-50/20 dark:from-emerald-900/20 dark:to-emerald-900/5";
    if (change < -2) return "bg-gradient-to-b from-rose-100/60 to-rose-50/30 dark:from-rose-900/30 dark:to-rose-900/10";
    return "bg-gradient-to-b from-rose-50/40 to-muted/30 dark:from-rose-900/10 dark:to-muted/10";
  }

  const coins: { key: Coin; label: string }[] = [
    { key: "bitcoin", label: "BTC" },
    { key: "ethereum", label: "ETH" },
    { key: "solana", label: "SOL" },
  ];

  // Auto-rotate selected coin every 5 seconds
  useEffect(() => {
    const order = ["bitcoin", "ethereum", "solana"] as const;
    const intervalId = setInterval(() => {
      setSelectedCoin((prev) => {
        const idx = order.indexOf(prev);
        const nextIdx = (idx + 1) % order.length;
        return order[nextIdx]!;
      });
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const bgClass = sentimentBg(data?.[selectedCoin]?.usd_24h_change);

  return (
    <Card className={`${className ?? ""} ${bgClass}`}>
      <CardHeader>
        <CardTitle>Crypto</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : !data ? (
          <div className="text-xs sm:text-sm text-muted-foreground">Data unavailable right now.</div>
        ) : (
          <div className="flex flex-col items-baseline gap-1.5 sm:gap-2">
            <div className="text-xs sm:text-sm text-muted-foreground">
              <div className="flex flex-row gap-1">
                {coins.map((coin, index) => (
                  <button key={coin.key} className={`hover:cursor-pointer hover:text-primary${selectedCoin === coin.key ? ' text-primary' : ''}`} onClick={() => {
                    setSelectedCoin(coin.key);
                  }}>
                    {index > 0 && <span className="text-xs sm:text-sm text-muted-foreground"> • </span>}
                    {coin.label}
                  </button>
                ))}
              </div>
              </div>
            <div className="text-2xl sm:text-2xl font-semibold tabular-nums">
              {formatUsd(data[selectedCoin]?.usd)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {`24h: ${typeof data[selectedCoin]?.usd_24h_change === 'number' ? data[selectedCoin].usd_24h_change.toFixed(2) + '%' : '—'}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CryptoWidget;


