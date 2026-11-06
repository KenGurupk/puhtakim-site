import { NextResponse } from "next/server";
import { verifySecret } from "@/lib/sales-db";
import { getQuickPaymentPrivate, quickPaymentRateLimit } from "@/lib/dubnov-quick-payment-store";
import { verifyGrowQuickPayment } from "@/lib/verify-grow-quick-payment";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  const url = new URL(request.url), reference = url.searchParams.get("reference") || "";
  if (!/^PT-DUBNOV-[a-f0-9]{32}$/.test(reference)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const privateData = await getQuickPaymentPrivate(reference);
    if (!verifySecret(url.searchParams.get("key"), privateData?.callbackKey)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    if (!await quickPaymentRateLimit("notify:" + reference)) return NextResponse.json({ error: "Retry later" }, { status: 429, headers });
    // Deliberately ignore incoming card details and status fields.
    const result = await verifyGrowQuickPayment(reference);
    return NextResponse.json({ ok: true, status: result.status }, { headers });
  } catch {
    // A 503 lets Grow retry its notification. Never log provider payloads or medical data.
    return NextResponse.json({ error: "Payment verification unavailable" }, { status: 503, headers });
  }
}
