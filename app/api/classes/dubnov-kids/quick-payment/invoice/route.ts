import { NextResponse } from "next/server";
import { getSalesRecord, redisCommand, verifySecret } from "@/lib/sales-db";
import { getQuickPaymentPrivate, quickPaymentRateLimit, withQuickPaymentLock } from "@/lib/dubnov-quick-payment-store";
import { verifyGrowQuickPayment } from "@/lib/verify-grow-quick-payment";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  const url = new URL(request.url), reference = url.searchParams.get("reference") || "";
  if (!/^PT-DUBNOV-[a-f0-9]{32}$/.test(reference)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const privateData = await getQuickPaymentPrivate(reference);
    if (!verifySecret(url.searchParams.get("key"), privateData?.callbackKey)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    if (!await quickPaymentRateLimit("invoice:" + reference)) return NextResponse.json({ error: "Retry later" }, { status: 429, headers });
    const payload: unknown = await request.json().catch(() => null);
    const invoices = Array.isArray(payload) ? payload : [payload];
    if (invoices.length !== 1 || !invoices[0] || typeof invoices[0] !== "object") return NextResponse.json({ error: "Invalid invoice" }, { status: 400, headers });
    const invoice = invoices[0] as Record<string, unknown>;
    const invoiceNumber = String(invoice.invoiceNumber || "");
    if (!/^[a-zA-Z0-9/-]{1,80}$/.test(invoiceNumber) || String(invoice.processId) !== privateData?.processId) return NextResponse.json({ error: "Invalid invoice" }, { status: 400, headers });
    // The receipt callback does not confirm payment. Verify the linked process with Grow first.
    if ((await verifyGrowQuickPayment(reference)).status !== "paid") return NextResponse.json({ error: "Payment not yet verified" }, { status: 503, headers });
    return await withQuickPaymentLock("settle:" + reference, async () => {
      const record = await getSalesRecord(reference);
      if (!record || record.growTransactionId !== String(invoice.transactionId)) return NextResponse.json({ error: "Transaction mismatch" }, { status: 409, headers });
      if (record.growReceiptNumber && record.growReceiptNumber !== invoiceNumber) return NextResponse.json({ error: "Receipt mismatch" }, { status: 409, headers });
      await redisCommand(["HSET", "pushtakim:checkout:" + reference, "growReceiptNumber", invoiceNumber]);
      return NextResponse.json({ ok: true }, { headers });
    });
  } catch { return NextResponse.json({ error: "Invoice verification unavailable" }, { status: 503, headers }); }
}
