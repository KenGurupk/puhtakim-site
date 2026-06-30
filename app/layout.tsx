import type { Metadata } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";
import "@/app/globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  variable: "--font-hebrew",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pushtakim.com"),
  title: {
    default: "PushTakim",
    template: "%s | PushTakim"
  },
  description:
    "האתר הרשמי של PushTakim, קהילת תרבות התנועה בישראל לפארקור, קליסטניקס, טריקינג, ברייקדאנס, קרקס ועוד.",
  openGraph: {
    title: "PushTakim",
    description:
      "הבית של תרבות התנועה בישראל.",
    url: "https://pushtakim.com",
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
