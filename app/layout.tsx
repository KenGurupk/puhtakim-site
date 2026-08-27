import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";

import "@/app/globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FinalEventAnnouncement } from "@/components/events/final-event-announcement";
import { CursorTrail } from "@/components/motion/cursor-trail";
import { SoundInteractions } from "@/components/motion/sound-interactions";
import { siteCopy } from "@/content/site-copy";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  variable: "--font-hebrew",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pushtakim.co.il";
const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PushTakim",
  alternateName: "פושטקים",
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  sameAs: ["https://www.instagram.com/_pushtakim_", "https://youtube.com/@pushtakim692"],
  description: "פושטקים היא קהילת הפארקור והתנועה בישראל."
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PushTakim",
    template: "%s | PushTakim"
  },
  description: siteCopy.metadata.defaultDescription,
  applicationName: "PushTakim",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  },
  openGraph: {
    title: "PushTakim",
    description: siteCopy.metadata.openGraphDescription,
    url: siteUrl,
    siteName: "PushTakim",
    locale: "he_IL",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "PushTakim",
    description: siteCopy.metadata.openGraphDescription
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <div className="noise" aria-hidden="true" />
        <CursorTrail />
        <SoundInteractions />
        <FinalEventAnnouncement />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
