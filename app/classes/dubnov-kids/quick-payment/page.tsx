import type { Metadata } from "next";
import { QuickPaymentForm } from "@/components/classes/dubnov-quick-payment";
import { currentQuickPaymentMonth, quickPaymentMaxSessions } from "@/lib/dubnov-quick-payment";
import { getGrowQuickPaymentConfig } from "@/lib/grow-quick-payment";
import { getCentralStorageStatus } from "@/lib/sales-db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "תשלום מהיר למתאמנים קיימים בדובנוב | PushTakim", robots: { index: false, follow: false } };

export default async function QuickPaymentPage({ searchParams }: { searchParams: Promise<{ month?: string; sessions?: string }> }) {
  const params = await searchParams;
  const month = params.month && /^20\d{2}-(0[1-9]|1[0-2])$/.test(params.month) ? params.month : currentQuickPaymentMonth();
  const sessions = Number(params.sessions);
  return <QuickPaymentForm available={Boolean(getGrowQuickPaymentConfig()) && getCentralStorageStatus().configured} initialMonth={month} initialSessions={Number.isInteger(sessions) && sessions >= 1 && sessions <= quickPaymentMaxSessions ? sessions : 1} />;
}
