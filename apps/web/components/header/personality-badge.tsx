"use client";

interface PersonalityBadgeProps {
  personality: string | null;
}

export function PersonalityBadge({ personality }: PersonalityBadgeProps) {
  if (!personality) return null;

  return (
    <span className="flex flex-row items-center gap-2 text-sm text-muted-foreground font-medium my-auto">
      {personality.charAt(0).toUpperCase() + personality.slice(1) || "Default"}
    </span>
  );
}

