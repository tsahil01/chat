"use client";

import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { CryptoWidget } from "@/components/widgets/CryptoWidget";
import { DemoPromptWidget } from "@/components/widgets/DemoPromptWidget";

interface WelcomeScreenProps {
  className?: string;
}

export function WelcomeScreen({ className }: WelcomeScreenProps) {
  return (
    <div className={`flex h-full w-full flex-col justify-center ${className}`}>
      <div className="mb-4 px-3 text-left sm:mb-6 sm:px-0">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Welcome to Chat
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Start a conversation by typing a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 px-3 sm:grid-cols-2 sm:gap-3 sm:px-0 lg:grid-cols-4 lg:gap-4">
        <ClockWidget className="bg-muted/30 dark:bg-muted/10 sm:col-span-1" />
        <WeatherWidget className="sm:col-span-2" />
        <CryptoWidget />
        <DemoPromptWidget className="bg-muted/30 dark:bg-muted/10 sm:col-span-1" />
        <NewsWidget className="bg-muted/30 dark:bg-muted/10 sm:col-span-2 lg:col-span-3" />
      </div>
    </div>
  );
}
