import type { Metadata } from "next";
import { QuickPaymentResult } from "@/components/classes/dubnov-quick-payment-result";

export const metadata: Metadata = { title: "מצב תשלום לחוג דובנוב | PushTakim", robots: { index: false, follow: false } };
export default async function QuickPaymentCompletePage({ searchParams }: { searchParams: Promise<{ reference?: string; cancelled?: string }> }) {
  const params = await searchParams;
  const reference = params.reference && /^PT-DUBNOV-[a-f0-9]{32}$/.test(params.reference) ? params.reference : "";
  return <QuickPaymentResult reference={reference} cancelled={params.cancelled === "1"} />;
}
