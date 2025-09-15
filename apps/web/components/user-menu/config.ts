import { MdLanguage, MdHelp } from "react-icons/md";
import { IoBugOutline, IoLogoGithub } from "react-icons/io5";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  rightText?: string;
};

export type { MenuItem };

export const settingsItems: MenuItem[] = [
  {
    id: "language",
    label: "Language",
    icon: MdLanguage,
    action: () => (window.location.href = "/language"),
    rightText: "→",
  },
];

export const helpItems: MenuItem[] = [
  {
    id: "help",
    label: "Get help",
    icon: MdHelp,
    action: () => window.open("mailto:sahiltiwaskar2003@gmail.com", "_blank"),
  },
  {
    id: "issues",
    label: "Facing issues?",
    icon: IoBugOutline,
    action: () => window.open("https://github.com/tsahil01/chat/issues/new", "_blank"),
    rightText: "→",
  },
  {
    id: "github",
    label: "Github",
    icon: IoLogoGithub,
    action: () => window.open("https://github.com/tsahil01/chat", "_blank"),
  },
];


