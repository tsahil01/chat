export type AppTheme = {
  id: string;
  label: string;
  mode: "light" | "dark";
  accent: string;
  previewColors?: [string, string];
  description?: string;
};

export const appThemes: AppTheme[] = [
  {
    id: "light",
    label: "Light",
    mode: "light",
    accent: "#2563eb",
    previewColors: ["#2563eb", "#f9fafb"],
    description: "Bright default theme",
  },
  {
    id: "dark",
    label: "Dark",
    mode: "dark",
    accent: "#7dd3fc",
    previewColors: ["#7dd3fc", "#0b1221"],
    description: "Dark default theme",
  },
  {
    id: "classic",
    label: "Classic",
    mode: "light",
    accent: "#1d4ed8",
    previewColors: ["#1d4ed8", "#f7f4ef"],
    description: "Billingsdk-inspired classic light",
  },
  {
    id: "minimal",
    label: "Minimal",
    mode: "light",
    accent: "#0f172a",
    previewColors: ["#0f172a", "#f9fafb"],
    description: "Low-chrome neutral variant",
  },
  {
    id: "midnight",
    label: "Midnight",
    mode: "dark",
    accent: "#7c3aed",
    previewColors: ["#7c3aed", "#0b1221"],
    description: "High-contrast purple dark",
  },
  {
    id: "sunset",
    label: "Sunset",
    mode: "light",
    accent: "#f97316",
    previewColors: ["#f97316", "#fff7ed"],
    description: "Warm orange glow with soft contrast",
  },
  {
    id: "ocean",
    label: "Ocean",
    mode: "light",
    accent: "#0ea5e9",
    previewColors: ["#0ea5e9", "#f1f5f9"],
    description: "Crisp blues with airy spacing",
  },
  {
    id: "forest",
    label: "Forest",
    mode: "dark",
    accent: "#22c55e",
    previewColors: ["#22c55e", "#0b1611"],
    description: "Deep greens with calm contrast",
  },
  {
    id: "pastel",
    label: "Pastel",
    mode: "light",
    accent: "#c084fc",
    previewColors: ["#c084fc", "#fdf4ff"],
    description: "Soft playful pastel mix",
  },
  {
    id: "mono",
    label: "Mono",
    mode: "dark",
    accent: "#9ca3af",
    previewColors: ["#9ca3af", "#0f1115"],
    description: "Minimal monochrome dark",
  },
];

export const themeIds = appThemes.map((theme) => theme.id);
export const themeOptions = ["system", ...themeIds];

export function getThemeMode(theme?: string): "light" | "dark" {
  if (!theme || theme === "system") return "light";
  return appThemes.find((item) => item.id === theme)?.mode ?? "light";
}
