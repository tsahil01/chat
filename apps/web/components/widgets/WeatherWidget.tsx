"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function WeatherWidget({ className }: { className?: string }) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    temperatureC: number | null;
    apparentC: number | null;
    windKph: number | null;
    condition: string;
    highC: number | null;
    lowC: number | null;
  } | null>(null);

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
      { timeout: 3000 }
    );
  }, []);

  useEffect(() => {
    (async () => {
      if (!coords) return;
      try {
        const res = await fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setData(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [coords]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Weather</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : data ? (
          <div className="flex flex-col items-baseline gap-1.5 sm:gap-2">
            <div className="text-xs sm:text-sm text-muted-foreground">{data.condition}</div>
            <div className="text-2xl sm:text-3xl font-semibold tabular-nums">
              {data.temperatureC != null ? `${Math.round(data.temperatureC)}°C` : "—"}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {data.highC != null && data.lowC != null ? `H ${Math.round(data.highC)}° / L ${Math.round(data.lowC)}°` : ""}
            </div>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-muted-foreground">Location permission needed to show local weather.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;


