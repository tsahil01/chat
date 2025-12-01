import { Metadata } from "next";
import { appConfig } from "@workspace/config";

export const metadata: Metadata = {
  title: `Your Chats - ${appConfig.appName}`,
  description:
    "View your conversations and manage your chat history.",
};

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
