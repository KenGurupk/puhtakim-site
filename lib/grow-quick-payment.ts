import "server-only";

import type { SalesRecord } from "@/lib/sales-db";
import { quickPaymentQuote } from "@/lib/dubnov-quick-payment";
import { parseGrowQuickPaymentConfig, validateGrowHostedPaymentUrl } from "@/lib/grow-quick-payment-config";

type GrowResult = { status?: number | string; data?: Record<string, unknown> };

export function getGrowQuickPaymentConfig() {
  return parseGrowQuickPaymentConfig(process.env);
}

export async function callGrowQuickPayment(method: "createPaymentProcess" | "getPaymentProcessInfo" | "approveTransaction", values: Record<string, string>): Promise<Record<string, unknown>> {
  const config = getGrowQuickPaymentConfig();
  if (!config) throw new Error("GROW_QUICK_PAYMENT_NOT_CONFIGURED");
  const form = new FormData();
  form.set("pageCode", config.pageCode);
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  const response = await fetch(config.origin + "/api/light/server/1.0/" + method, {
    method: "POST", body: form, cache: "no-store", signal: AbortSignal.timeout(15000), redirect: "error"
  });
  const result = await response.json().catch(() => null) as GrowResult | null;
  // Provider error bodies may contain sensitive fields; do not log or return them.
  if (!response.ok || String(result?.status) !== "1") throw new Error("GROW_REQUEST_FAILED");
  if (method === "approveTransaction") return result?.data || {};
  if (!result?.data || typeof result.data !== "object") throw new Error("GROW_REQUEST_FAILED");
  return result.data;
}

export function validGrowPaymentUrl(value: unknown) {
  const config = getGrowQuickPaymentConfig();
  return Boolean(config && validateGrowHostedPaymentUrl(value, config.mode));
}

export async function createGrowQuickPayment(record: SalesRecord, guardianName: string, callbackKey: string) {
  const config = getGrowQuickPaymentConfig();
  if (!config || !record.classMonth || !record.sessionCount) throw new Error("GROW_QUICK_PAYMENT_NOT_CONFIGURED");
  const quote = quickPaymentQuote(record.fullName, record.classMonth, record.sessionCount);
  if (quote.total !== record.price) throw new Error("QUICK_PAYMENT_AMOUNT_MISMATCH");
  // This is a new process on the existing merchant's Grow account, not a mutable price in a shared link.
  const origin = config.callbackOrigin;
  const result = await callGrowQuickPayment("createPaymentProcess", {
    userId: config.userId, chargeType: "1", sum: String(quote.total), paymentNum: "1",
    description: quote.description, "pageField[fullName]": guardianName,
    "pageField[phone]": record.phone, "pageField[email]": record.email,
    "pageField[invoiceName]": guardianName, cField1: record.checkoutReference,
    "productData[0][quantity]": String(quote.sessions), "productData[0][price]": String(quote.unitPrice),
    "productData[0][itemDescription]": quote.description, "productData[0][vatType]": config.vatType,
    successUrl: origin + "/classes/dubnov-kids/quick-payment/complete?reference=" + record.checkoutReference,
    cancelUrl: origin + "/classes/dubnov-kids/quick-payment/complete?cancelled=1&reference=" + record.checkoutReference,
    notifyUrl: origin + "/api/classes/dubnov-kids/quick-payment/notify?reference=" + record.checkoutReference + "&key=" + callbackKey,
    invoiceNotifyUrl: origin + "/api/classes/dubnov-kids/quick-payment/invoice?reference=" + record.checkoutReference + "&key=" + callbackKey
  });
  if (!validGrowPaymentUrl(result.url) || !result.processId || typeof result.processToken !== "string") throw new Error("GROW_INVALID_RESPONSE");
  return { url: String(result.url), processId: String(result.processId), processToken: result.processToken };
}

export async function getGrowQuickPaymentInfo(processId: string, processToken: string) {
  const result = await callGrowQuickPayment("getPaymentProcessInfo", { processId, processToken });
  if (String(result.processId) !== processId || result.processToken !== processToken || !Array.isArray(result.transactions)) throw new Error("GROW_PROCESS_MISMATCH");
  return result.transactions as Array<Record<string, unknown>>;
}

// Grow requires an acknowledgement after a successful server notification.
// The verified provider response is forwarded only to Grow; card fields are never persisted or exported.
export async function acknowledgeGrowQuickPayment(transaction: Record<string, unknown>, processId: string, processToken: string) {
  const fields = ["transactionId", "transactionToken", "transactionTypeId", "paymentType", "sum", "firstPaymentSum", "periodicalPaymentSum", "paymentsNum", "allPaymentsNum", "paymentDate", "asmachta", "description", "fullName", "payerPhone", "payerEmail", "cardSuffix", "cardType", "cardTypeCode", "cardBrand", "cardBrandCode", "cardExp"];
  const values: Record<string, string> = { processId, processToken };
  for (const field of fields) if (transaction[field] !== undefined) values[field] = String(transaction[field]);
  await callGrowQuickPayment("approveTransaction", values);
}
