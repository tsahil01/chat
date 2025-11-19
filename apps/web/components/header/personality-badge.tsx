"use client";

interface PersonalityBadgeProps {
  personality: string | null;
}

export function PersonalityBadge({ personality }: PersonalityBadgeProps) {
  if (!personality) return null;

  return (
    <span className="text-muted-foreground my-auto flex flex-row items-center gap-2 text-sm font-medium">
      {personality.charAt(0).toUpperCase() + personality.slice(1) || "Default"}
    </span>
  );
}
