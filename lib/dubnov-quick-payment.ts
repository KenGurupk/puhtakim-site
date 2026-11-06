import type { CheckoutIntent } from "@/lib/checkout-intents";
import { dubnovKidsConfig } from "@/lib/dubnov-kids";

export const quickPaymentUnitPrice = dubnovKidsConfig.plans.single.price;
export const quickPaymentMaxSessions = 31;

export type QuickPaymentInput = {
  childName: string;
  guardianPhone: string;
  dateOfBirth: string;
  month: string;
  sessions: number;
  healthStatus: "unchanged" | "changed";
  healthUpdate: string;
  healthConfirmed: true;
  idempotencyKey: string;
};

export function currentQuickPaymentMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit" }).formatToParts(date);
  return parts.find(p => p.type === "year")!.value + "-" + parts.find(p => p.type === "month")!.value;
}

export function quickPaymentMonthLabel(month: string) {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) return "";
  return new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(month + "-15T12:00:00Z"));
}

export function normalizeQuickPhone(value: string) {
  return value.replace(/\D/g, "").replace(/^972/, "0");
}

function normalizedName(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function parseQuickPaymentInput(body: unknown): QuickPaymentInput | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const childName = typeof b.childName === "string" ? normalizedName(b.childName) : "";
  const guardianPhone = typeof b.guardianPhone === "string" ? normalizeQuickPhone(b.guardianPhone) : "";
  const dateOfBirth = typeof b.dateOfBirth === "string" ? b.dateOfBirth : "";
  const month = typeof b.month === "string" ? b.month : "";
  const sessions = b.sessions;
  const healthUpdate = typeof b.healthUpdate === "string" ? b.healthUpdate.trim() : "";
  const idempotencyKey = typeof b.idempotencyKey === "string" ? b.idempotencyKey : "";
  if (!childName || childName.length > 150 || !/^05\d{8}$/.test(guardianPhone)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || !Number.isFinite(Date.parse(dateOfBirth)) || dateOfBirth > new Date().toISOString().slice(0, 10)) return null;
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) return null;
  if (typeof sessions !== "number" || !Number.isInteger(sessions) || sessions < 1 || sessions > quickPaymentMaxSessions) return null;
  if (b.healthConfirmed !== true || (b.healthStatus !== "unchanged" && b.healthStatus !== "changed")) return null;
  if (healthUpdate.length > 2000 || (b.healthStatus === "changed" && !healthUpdate) || (b.healthStatus === "unchanged" && healthUpdate)) return null;
  if (!/^[a-f0-9-]{36}$/i.test(idempotencyKey)) return null;
  return { childName, guardianPhone, dateOfBirth, month, sessions, healthStatus: b.healthStatus, healthUpdate, healthConfirmed: true, idempotencyKey };
}

export function quickPaymentQuote(childName: string, month: string, sessions: number) {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month) || !Number.isInteger(sessions) || sessions < 1 || sessions > quickPaymentMaxSessions) throw new Error("INVALID_QUICK_PAYMENT_QUOTE");
  const total = quickPaymentUnitPrice * sessions;
  // Grow copies these invoice items into the receipt; never send medical details.
  const safeName = childName.replace(new RegExp("[^\\p{L}\\p{N} ]", "gu"), " ").replace(/\s+/g, " ").trim();
  const description = safeName + " חוג דובנוב " + quickPaymentMonthLabel(month) + " " + sessions + " אימונים " + total + " שח";
  return { unitPrice: quickPaymentUnitPrice, sessions, total, month, description };
}

export function findQuickPaymentRegistration(records: CheckoutIntent[], input: Pick<QuickPaymentInput, "childName" | "guardianPhone" | "dateOfBirth">) {
  const matches = records.filter(r => {
    const c = r.compliance;
    return r.ticketType === "dubnov-kids" && c?.healthDeclarationCompleted === true && c.termsAccepted === true && c.guardianConsent === true
      && normalizedName(r.fullName) === normalizedName(input.childName) && r.dateOfBirth === input.dateOfBirth
      && normalizeQuickPhone(c.guardianPhone || r.phone) === input.guardianPhone
      && [1, 2, 3, 4, 5].every(i => c.healthAnswers?.["q" + i] === "yes" || c.healthAnswers?.["q" + i] === "no");
  }).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  // Older form retries with exactly the same identity refer to the earliest complete declaration.
  return matches[0] || null;
}
