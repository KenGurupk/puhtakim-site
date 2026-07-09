import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";

import "@/app/globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CursorTrail } from "@/components/motion/cursor-trail";
import { SoundInteractions } from "@/components/motion/sound-interactions";
import { siteCopy } from "@/content/site-copy";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  variable: "--font-hebrew",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pushtakim.co.il";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PushTakim",
    template: "%s | PushTakim"
  },
  description: siteCopy.metadata.defaultDescription,
  openGraph: {
    title: "PushTakim",
    description: siteCopy.metadata.openGraphDescription,
    url: siteUrl,
    siteName: "PushTakim",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={notoSansHebrew.variable}>
      <body className="font-sans antialiased">
        <div className="noise" aria-hidden="true" />
        <CursorTrail />
        <SoundInteractions />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
