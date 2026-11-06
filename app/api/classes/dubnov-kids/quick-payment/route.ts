import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { parseQuickPaymentInput, findQuickPaymentRegistration, quickPaymentQuote } from "@/lib/dubnov-quick-payment";
import { getGrowQuickPaymentConfig, createGrowQuickPayment } from "@/lib/grow-quick-payment";
import { getCentralStorageStatus, getSalesRecord, listSalesRecords, redisCommand, saveSalesRecord, type SalesRecord } from "@/lib/sales-db";
import { getQuickPaymentPrivate, quickPaymentFingerprint, quickPaymentIdempotencyKey, quickPaymentRateLimit, saveQuickPaymentPrivate, withQuickPaymentLock, type QuickPaymentPrivate } from "@/lib/dubnov-quick-payment-store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };

export async function POST(request: Request) {
  if (!getCentralStorageStatus().configured || !getGrowQuickPaymentConfig()) return NextResponse.json({ error: "התשלום המהיר עדיין אינו זמין. פנו לקן־גורו." }, { status: 503, headers });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "בקשה לא מורשית." }, { status: 403, headers });
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!await quickPaymentRateLimit("checkout:" + clientIp)) return NextResponse.json({ error: "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות." }, { status: 429, headers });
    const input = parseQuickPaymentInput(await request.json().catch(() => null));
    if (!input) return NextResponse.json({ error: "בדקו את פרטי הזיהוי, החודש, מספר האימונים ואישור הבריאות." }, { status: 400, headers });
    const records = await listSalesRecords();
    const original = findQuickPaymentRegistration(records, input);
    if (!original) return NextResponse.json({ error: "לא נמצאה הרשמה מלאה התואמת לפרטים. בדקו את הפרטים או פנו לקן־גורו." }, { status: 400, headers });
    const registrationId = original.checkoutReference;
    const identityKey = quickPaymentIdempotencyKey(registrationId, input.idempotencyKey);
    const quote = quickPaymentQuote(original.fullName, input.month, input.sessions);
    const fingerprint = quickPaymentFingerprint({ registrationId, month: input.month, sessions: input.sessions, healthStatus: input.healthStatus, healthUpdate: input.healthUpdate });
    return await withQuickPaymentLock(identityKey, async () => {
      const existingReference = await redisCommand<string | null>(["GET", identityKey]);
      if (existingReference) {
        const privateData = await getQuickPaymentPrivate(existingReference);
        const existing = await getSalesRecord(existingReference);
        if (!privateData || !existing || privateData.fingerprint !== fingerprint) return NextResponse.json({ error: "פרטי התשלום השתנו. פתחו את הטופס מחדש." }, { status: 409, headers });
        if (existing.status === "paid") return NextResponse.json({ error: "התשלום הזה כבר אושר. אין צורך לשלם שוב." }, { status: 409, headers });
        if (privateData.state !== "ready" || !privateData.paymentUrl || Date.parse(privateData.paymentUrlExpiresAt || "") <= Date.now()) return NextResponse.json({ error: "קישור התשלום אינו זמין או שפג תוקפו. פתחו את הטופס מחדש." }, { status: 409, headers });
        return NextResponse.json({ checkoutReference: existingReference, statusAccessToken: existing.statusAccessToken, paymentUrl: privateData.paymentUrl, amount: quote.total }, { headers });
      }
      const now = new Date().toISOString();
      const checkoutReference = "PT-DUBNOV-" + randomBytes(16).toString("hex");
      const statusAccessToken = randomBytes(24).toString("hex");
      const privateData: QuickPaymentPrivate = { registrationId, healthStatus: input.healthStatus, healthUpdate: input.healthUpdate, healthConfirmedAt: now, fingerprint, state: "creating", callbackKey: randomBytes(24).toString("hex") };
      const record: SalesRecord = {
        checkoutReference, registrationId, createdAt: now, updatedAt: now,
        fullName: original.fullName, phone: input.guardianPhone, email: original.email, dateOfBirth: original.dateOfBirth,
        ticketType: "dubnov-kids", ticketName: quote.description, price: quote.total,
        selectedEventIds: [], selectedEvents: [], status: "pending_payment", paymentProvider: "grow",
        productType: "dubnov_kids_class", classPlan: "single", classMonth: input.month,
        purchaseKind: "existing_single", sessionCount: input.sessions, unitPrice: quote.unitPrice,
        statusAccessToken, registrationSource: "Website Purchase",
        sourcePage: "/classes/dubnov-kids/quick-payment", ctaId: "dubnov-kids-quick-payment", utm: {}
      };
      // Keep the original declaration untouched; save the new confirmation/update before opening Grow.
      await saveQuickPaymentPrivate(checkoutReference, privateData);
      await saveSalesRecord(record);
      await redisCommand(["SET", identityKey, checkoutReference]);
      try {
        const payment = await createGrowQuickPayment(record, original.compliance?.guardianName || "", privateData.callbackKey);
        await saveQuickPaymentPrivate(checkoutReference, { ...privateData, state: "ready", paymentUrl: payment.url, processId: payment.processId, processToken: payment.processToken, paymentUrlExpiresAt: new Date(Date.now() + 9 * 60 * 1000).toISOString() });
        return NextResponse.json({ checkoutReference, statusAccessToken, paymentUrl: payment.url, amount: quote.total }, { headers });
      } catch {
        // A network timeout may occur after Grow has created a process. Do not retry creating it silently.
        await saveQuickPaymentPrivate(checkoutReference, { ...privateData, state: "unknown" });
        return NextResponse.json({ error: "לא הצלחנו לפתוח את התשלום. לא התקבל אישור תשלום. נסו שוב מאוחר יותר או פנו לקן־גורו." }, { status: 502, headers });
      }
    });
  } catch {
    return NextResponse.json({ error: "לא הצלחנו לפתוח את התשלום. נסו שוב בעוד כמה דקות." }, { status: 503, headers });
  }
}
