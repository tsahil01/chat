"use client";

import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";

interface WelcomeScreenProps {
  className?: string;
}

export function WelcomeScreen({ className = "" }: WelcomeScreenProps) {
  return (
    <div className={`h-full w-full ${className}`}>
      <div className="mb-4 sm:mb-6 px-3 sm:px-0">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Welcome to Chat</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Start a conversation by typing a message below.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-0">
        <ClockWidget className="sm:col-span-2" />
        <WeatherWidget />

        <NewsWidget className="sm:col-span-2 lg:col-span-4" />
      </div>
    </div>
  );
}
