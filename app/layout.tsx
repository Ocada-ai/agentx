import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

import { AI } from './action';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';
import { SidebarDesktop } from '@/components/sidebar-desktop'
import RightSidebar from '@/components/right-sidebar';

const meta = {
  title: 'AI RSC Demo',
  description:
    'Demo of an interactive financial assistant built using Next.js and Vercel AI SDK.',
};
export const metadata: Metadata = {
  ...meta,
  title: {
    default: 'AI RSC Demo',
    template: `%s - AI RSC Demo`,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  twitter: {
    ...meta,
    card: 'summary_large_image',
    site: '@vercel',
  },
  openGraph: {
    ...meta,
    locale: 'en-US',
    type: 'website',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Toaster />
        <AI>
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex h-screen overflow-hidden">
              {/* <Header /> */}
              <SidebarDesktop />
              {/* <main className="flex flex-col flex-1 bg-muted/50 dark:bg-background">
                {children}
              </main> */}
              <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:ml-[220px] peer-[[data-state=open]]:xl:ml-[220px]">
                <article className="md:grid grid-cols-16 gap-1 mx-auto">
                  <main className="col-start-1 col-end-12 relative">{children}</main>
                  <aside className="col-span-5 col-start-12 overflow-y-scroll">
                    <RightSidebar />
                  </aside>
                </article>
              </div>
            </div>
          </Providers>
        </AI>
        <Analytics />
      </body>
    </html>
  );
}

export const runtime = 'edge';
