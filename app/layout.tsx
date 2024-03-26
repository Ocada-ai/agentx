import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";

import { AI } from "./action";
import { Providers } from "@/components/providers";

import "./globals.scss";

const meta = {
  title: "OCADA AI (beta)",
  description: "Beta version of the OCADA AI Blockchain Agent",
};
export const metadata: Metadata = {
  ...meta,
  title: {
    default: "OCADA AI (beta)",
    template: `%s - OCADA AI (beta)`,
  },
  icons: {
    icon: "/OCADA.svg",
    shortcut: "/OCADA.svg",
    apple: "/OCADA.svg",
  },
  twitter: {
    ...meta,
    card: "summary_large_image",
    site: "@ocada",
  },
  openGraph: {
    ...meta,
    locale: "en-US",
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const Gabarito = localFont({
  src: [
    {
      path: "../public/fonts/Gabarito-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Gabarito-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Gabarito-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-gabarito",
});

const Rethink_Sans = localFont({
  src: [
    {
      path: "../public/fonts/RethinkSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/RethinkSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-rethink_sans",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans antialiased ${Gabarito.variable} ${Rethink_Sans.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Toaster />
        <AI>
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex flex-col flex-1 h-screen bg-[#121212]">
              {children}
            </main>
          </Providers>
        </AI>
        <Analytics />
      </body>
    </html>
  );
}

export const runtime = "edge";
