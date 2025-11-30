"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function WeatherWidget({ className }: { className?: string }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    temperatureC: number | null;
    apparentC: number | null;
    windKph: number | null;
    condition: string;
    highC: number | null;
    lowC: number | null;
  } | null>(null);

  function backgroundForCondition(condition: string | undefined): string {
    const c = (condition || "").toLowerCase();
    // Map of condition -> Tailwind classes
    if (c.includes("thunder")) {
      return "bg-gradient-to-b from-indigo-200/60 to-slate-200/40 dark:from-indigo-900/40 dark:to-slate-900/30";
    }
    if (c.includes("snow")) {
      return "bg-gradient-to-b from-blue-50/70 to-white/60 dark:from-slate-800/50 dark:to-slate-900/40";
    }
    if (c.includes("shower") || c.includes("rain")) {
      return "bg-gradient-to-b from-sky-200/60 to-slate-200/40 dark:from-sky-900/40 dark:to-slate-900/30";
    }
    if (c.includes("drizzle")) {
      return "bg-gradient-to-b from-sky-100/70 to-sky-200/40 dark:from-sky-900/40 dark:to-sky-800/30";
    }
    if (c.includes("fog") || c.includes("overcast")) {
      return "bg-gradient-to-b from-slate-200/70 to-slate-100/50 dark:from-slate-800/60 dark:to-slate-900/40";
    }
    if (c.includes("cloud")) {
      return "bg-gradient-to-b from-slate-100/70 to-slate-200/40 dark:from-slate-800/50 dark:to-slate-900/40";
    }
    if (c.includes("clear") || c === "clear") {
      return "bg-gradient-to-b from-sky-200/50 to-amber-100/40 dark:from-sky-900/30 dark:to-amber-900/10";
    }
    // Default subtle background
    return "bg-muted/30 dark:bg-muted/10";
  }

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => setLoading(false),
      { timeout: 3000 },
    );
  }, []);

  useEffect(() => {
    (async () => {
      if (!coords) return;
      try {
        const res = await fetch(
          `/api/weather?lat=${coords.lat}&lon=${coords.lon}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = await res.json();
          setData(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [coords]);

  const bgClass = backgroundForCondition(data?.condition);

  return (
    <Card className={`${className ?? ""} ${bgClass}`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Weather</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-24 sm:h-9 sm:w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : data ? (
          <div className="flex flex-col items-baseline gap-1.5 sm:gap-2">
            <div className="text-muted-foreground text-xs">
              {data.condition}
            </div>
            <div className="text-xl font-semibold tabular-nums sm:text-2xl">
              {data.temperatureC != null
                ? `${Math.round(data.temperatureC)}°C`
                : "—"}
            </div>
            <div className="text-muted-foreground text-[10px] sm:text-xs">
              {data.highC != null && data.lowC != null
                ? `H ${Math.round(data.highC)}° / L ${Math.round(data.lowC)}°`
                : ""}
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-[10px] sm:text-xs">
            Location permission needed to show local weather.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
