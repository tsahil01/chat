"use client";

import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { CryptoWidget } from "@/components/widgets/CryptoWidget";
import { DemoPromptWidget } from "@/components/widgets/DemoPromptWidget";

interface WelcomeScreenProps {
  className?: string;
}

export function WelcomeScreen({ className = "" }: WelcomeScreenProps) {
  return (
    <div className={`h-full w-full ${className}`}>
      <div className="mb-4 sm:mb-6 px-3 sm:px-0">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
          Welcome to Chat
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Start a conversation by typing a message below.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-0">
        <ClockWidget className="sm:col-span-1 bg-muted/30 dark:bg-muted/10" />
        <WeatherWidget className="sm:col-span-2" />
        <CryptoWidget />
        <DemoPromptWidget className="sm:col-span-1 bg-muted/30 dark:bg-muted/10" />
        <NewsWidget className="sm:col-span-2 lg:col-span-3 bg-muted/30 dark:bg-muted/10" />
      </div>
    </div>
  );
}
