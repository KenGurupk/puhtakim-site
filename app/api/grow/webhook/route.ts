import { NextResponse } from "next/server";

import { findPendingRecordForGrowPayment, markSalesRecordPaid, verifySecret } from "@/lib/sales-db";

type GrowWebhookPayload = Record<string, unknown>;

function getStringFromValue(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function getNestedValue(payload: GrowWebhookPayload, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, payload);
}

function getString(payload: GrowWebhookPayload, searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const searchValue = searchParams.get(key);

    if (searchValue?.trim()) {
      return searchValue.trim();
    }

    const value = getStringFromValue(getNestedValue(payload, key));

    if (value) {
      return value;
    }
  }

  return undefined;
}

function getNumber(payload: GrowWebhookPayload, searchParams: URLSearchParams, keys: string[]) {
  const raw = getString(payload, searchParams, keys);

  if (!raw) {
    return undefined;
  }

  const normalized = raw.replace(/[^\d.]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function isPaidStatus(status: string | undefined) {
  const normalized = String(status ?? "").trim().toLowerCase();
  return (
    !normalized ||
    ["paid", "success", "successful", "approved", "completed", "captured", "charged"].includes(normalized) ||
    normalized.includes("חוייב") ||
    normalized.includes("חויב") ||
    normalized.includes("שולם")
  );
}

function safeWebhookLog(event: string, data: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      event,
      route: "/api/grow/webhook",
      ...data
    })
  );
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);
  const providedSecret = request.headers.get("x-grow-webhook-secret") ?? url.searchParams.get("secret");

  if (!verifySecret(providedSecret, process.env.GROW_WEBHOOK_SECRET)) {
    safeWebhookLog("grow_webhook_rejected", {
      requestId,
      status: 401,
      durationMs: Date.now() - startedAt,
      reason: "secret_mismatch",
      providedSecretPresent: Boolean(providedSecret),
      expectedSecretPresent: Boolean(process.env.GROW_WEBHOOK_SECRET),
      providedSecretLength: providedSecret?.trim().length ?? 0,
      expectedSecretLength: process.env.GROW_WEBHOOK_SECRET?.trim().length ?? 0
    });
    return NextResponse.json({ error: "Unauthorized webhook.", requestId }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? ((await request.json().catch(() => ({}))) as GrowWebhookPayload)
      : Object.fromEntries((await request.formData()).entries());

  let checkoutReference = getString(payload, url.searchParams, [
    "checkoutReference",
    "checkout_reference",
    "externalReference",
    "external_reference",
    "clientReference",
    "client_reference",
    "orderId",
    "order_id",
    "metadata.checkoutReference",
    "data.checkoutReference"
  ]);
  const paymentStatus = getString(payload, url.searchParams, [
    "status",
    "paymentStatus",
    "transactionStatus",
    "dealStatus",
    "data.status",
    "סטטוס"
  ]);
  const growTransactionId = getString(payload, url.searchParams, [
    "transactionId",
    "transaction_id",
    "dealId",
    "deal_id",
    "paymentId",
    "payment_id",
    "authorizationNumber",
    "authorization_number",
    "data.transactionId",
    "data.paymentId",
    "אסמכתא"
  ]);
  const growToken = getString(payload, url.searchParams, ["token", "growToken", "grow_token", "data.token"]);
  const growPaymentLinkId = getString(payload, url.searchParams, [
    "paymentLink",
    "payment_link",
    "paymentLinkId",
    "payment_link_id",
    "productId",
    "product_id",
    "linkId",
    "link_id",
    "data.paymentLinkId",
    "שם עמוד פנימי",
    "תיאור עסקה"
  ]);
  const growPaymentAmount = getNumber(payload, url.searchParams, [
    "amount",
    "sum",
    "total",
    "price",
    "transactionAmount",
    "transaction_amount",
    "paidAmount",
    "paid_amount",
    "data.amount",
    "שולם",
    "תשלומים",
    "סהכ שולם",
    "סהכ – 1",
    "קוד מוצר – 1"
  ]);
  const buyerEmail = getString(payload, url.searchParams, ["email", "buyerEmail", "customerEmail", "customer.email", "data.email", "כתובת מייל"]);
  const buyerPhone = getString(payload, url.searchParams, ["phone", "buyerPhone", "customerPhone", "customer.phone", "data.phone", "טלפון"]);
  const paidAt = getString(payload, url.searchParams, [
    "paidAt",
    "paid_at",
    "transactionDate",
    "transaction_date",
    "createdAt",
    "created_at",
    "data.paidAt",
    "תאריך חיוב"
  ]);
  let paymentMatchMethod = "checkoutReference";

  if (!checkoutReference) {
    const matchedRecord = await findPendingRecordForGrowPayment({
      amount: growPaymentAmount,
      email: buyerEmail,
      phone: buyerPhone,
      growPaymentLinkId,
      paidAt
    });

    if (matchedRecord) {
      checkoutReference = matchedRecord.checkoutReference;
      paymentMatchMethod = growPaymentLinkId ? "paymentLink+contact+amount+time" : "contact+amount+time";
    }
  }

  if (!checkoutReference) {
    safeWebhookLog("grow_webhook_rejected", {
      requestId,
      status: 400,
      durationMs: Date.now() - startedAt,
      reason: "missing_checkout_reference_or_unique_match",
      payloadKeys: Object.keys(payload).sort()
    });
    return NextResponse.json({ error: "Missing checkout reference.", requestId }, { status: 400 });
  }

  if (!isPaidStatus(paymentStatus)) {
    safeWebhookLog("grow_webhook_ignored", {
      requestId,
      status: 200,
      durationMs: Date.now() - startedAt,
      checkoutReference,
      paymentStatus,
      reason: "non_paid_status"
    });
    return NextResponse.json({ ok: true, ignored: "non_paid_status", requestId });
  }

  let record;

  try {
    record = await markSalesRecordPaid({
      checkoutReference,
      growTransactionId,
      growToken,
      growPaymentLinkId,
      growPaymentAmount,
      growPaymentStatus: paymentStatus,
      paymentMatchMethod
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "EARLY_BIRD_SOLD_OUT" || message === "DUPLICATE_GROW_TRANSACTION" ? 409 : message === "GROW_AMOUNT_MISMATCH" ? 422 : 500;

    safeWebhookLog("grow_webhook_error", {
      requestId,
      status,
      durationMs: Date.now() - startedAt,
      checkoutReference,
      growTransactionId: growTransactionId ? "present" : "missing",
      growPaymentAmount,
      reason: message
    });

    return NextResponse.json({ error: message, requestId }, { status });
  }

  if (!record) {
    safeWebhookLog("grow_webhook_rejected", {
      requestId,
      status: 404,
      durationMs: Date.now() - startedAt,
      checkoutReference,
      growTransactionId: growTransactionId ? "present" : "missing",
      reason: "checkout_reference_not_found"
    });
    return NextResponse.json({ error: "Checkout reference not found.", requestId }, { status: 404 });
  }

  safeWebhookLog("grow_webhook_paid", {
    requestId,
    status: 200,
    durationMs: Date.now() - startedAt,
    checkoutReference: record.checkoutReference,
    growTransactionId: growTransactionId ? "present" : "missing",
    growPaymentAmount,
    ticketType: record.ticketType
  });

  return NextResponse.json({
    ok: true,
    checkoutReference: record.checkoutReference,
    status: record.status,
    requestId
  });
}
