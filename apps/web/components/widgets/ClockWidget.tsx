"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { SlidingNumber } from "@workspace/ui/components/sliding-number";

function formatTime(date: Date, timeZone?: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function ClockWidget({ className }: { className?: string }) {
  const browserTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [now, setNow] = useState<Date>(new Date());
  const [coords, setCoords] = useState<string>("");
  const [denied, setDenied] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");
  const regionFallback = useMemo(() => {
    if (!browserTimeZone) return "";
    const seg = browserTimeZone.split("/").pop() || browserTimeZone;
    return seg.replace(/_/g, " ");
  }, [browserTimeZone]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        try {
          const res = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            setCity(json.city || json.state || json.country || "");
          }
        } catch { }
      },
      () => setDenied(true),
      { enableHighAccuracy: false, timeout: 3000 }
    );
  }, []);

  const timeText = formatTime(now, browserTimeZone);
  const [hourStr = "00", minuteStr = "00", secondStr = "00"] = timeText.split(":");
  const hour = parseInt(hourStr, 10) || 0;
  const minute = parseInt(minuteStr, 10) || 0;
  const second = parseInt(secondStr, 10) || 0;
  const dayDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "short",
        day: "2-digit",
      }).format(now);
    } catch {
      return now.toDateString();
    }
  }, [now]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-baseline gap-1.5 sm:gap-2">
          <div className="text-sm text-muted-foreground">{city || regionFallback}</div>
          <div className="text-2xl sm:text-3xl font-semibold tabular-nums flex items-center gap-1">
            <SlidingNumber value={hour} padStart />
            <span>:</span>
            <SlidingNumber value={minute} padStart />
            <span>:</span>
            <SlidingNumber value={second} padStart />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">{dayDate}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClockWidget;


