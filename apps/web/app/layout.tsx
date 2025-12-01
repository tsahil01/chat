import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import { appConfig } from "@workspace/config";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const metadata: Metadata = {
  title: appConfig.appName,
  description: appConfig.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
