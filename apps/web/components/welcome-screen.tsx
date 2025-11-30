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
    <div className={`flex mx-2 flex-col ${className}`}>
      <div className="grid grid-cols-1 gap-2 px-3 sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
        <ClockWidget className="bg-muted/30 dark:bg-muted/10 sm:col-span-1" />
        <WeatherWidget className="sm:col-span-2" />
        <DemoPromptWidget className="bg-muted/30 dark:bg-muted/10 sm:col-span-1" />
        {/* <CryptoWidget />
        <NewsWidget className="bg-muted/30 dark:bg-muted/10 sm:col-span-2 lg:col-span-3" /> */}
      </div>
    </div>
  );
}
