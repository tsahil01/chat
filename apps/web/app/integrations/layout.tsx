import { Metadata } from "next";
import { appConfig } from "@workspace/config";

export const metadata: Metadata = {
  title: `Integrations - ${appConfig.appName}`,
  description:
    "Connect your accounts to unlock powerful features and streamline your workflow.",
};

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
