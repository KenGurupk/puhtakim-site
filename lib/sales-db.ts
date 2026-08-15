import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { checkoutConfig, type CheckoutTicketType } from "@/lib/checkout-config";
import type { CheckoutIntent } from "@/lib/checkout-intents";

const refsKey = "pushtakim:checkout:refs";
const refKeyPrefix = "pushtakim:checkout:";
const earlyBirdTicketType: CheckoutTicketType = "opening";
const earlyBirdLimit = 15;
const earlyBirdSalesClosed = true;
const earlyBirdHoldMs = 15 * 60 * 1000;
const earlyBirdLockKey = "pushtakim:inventory:early-bird-mabuza:lock";
const manualCheckinLockPrefix = "pushtakim:checkin:lock:";

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

export type SalesRecord = CheckoutIntent;

export type EarlyBirdAvailability = {
  total: number;
  sold: number;
  remaining: number;
  status: "available" | "sold_out";
  isSoldOut: boolean;
  source: "database" | "override";
};

function getKvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN are required for central sales storage.");
  }

  return {
    url: url.replace(/\/$/, ""),
    token
  };
}

async function redisCommand<T>(command: unknown[]) {
  const config = getKvConfig();
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });
  const payload = (await response.json()) as RedisResponse<T>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? `Redis command failed with ${response.status}`);
  }

  return payload.result as T;
}

async function redisPipeline<T>(commands: unknown[][]) {
  const config = getKvConfig();
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands),
    cache: "no-store"
  });
  const payload = (await response.json()) as Array<RedisResponse<T>>;

  if (!response.ok) {
    throw new Error(`Redis pipeline failed with ${response.status}`);
  }

  const failed = payload.find((item) => item.error);
  if (failed?.error) {
    throw new Error(failed.error);
  }

  return payload.map((item) => item.result as T);
}

async function acquireInventoryLock() {
  const token = randomBytes(8).toString("hex");
  const result = await redisCommand<string | null>(["SET", earlyBirdLockKey, token, "NX", "PX", 5000]);
  return result === "OK" ? token : null;
}

async function releaseInventoryLock(token: string) {
  const current = await redisCommand<string | null>(["GET", earlyBirdLockKey]).catch(() => null);

  if (current === token) {
    await redisCommand(["DEL", earlyBirdLockKey]).catch(() => undefined);
  }
}

function participantLockKey(input: { fullName: string; phone: string; email?: string }) {
  const identity = [compactPhone(input.phone), normalizedEmail(input.email), input.fullName.trim().toLowerCase()]
    .filter(Boolean)
    .join("|");
  const hash = createHash("sha256").update(identity).digest("hex").slice(0, 32);
  return `${manualCheckinLockPrefix}${hash}`;
}

export async function acquireManualCheckinLock(input: { fullName: string; phone: string; email?: string }) {
  const key = participantLockKey(input);
  const token = randomBytes(8).toString("hex");
  const result = await redisCommand<string | null>(["SET", key, token, "NX", "PX", 8000]);
  return result === "OK" ? { key, token } : null;
}

export async function releaseManualCheckinLock(lock: { key: string; token: string }) {
  const current = await redisCommand<string | null>(["GET", lock.key]).catch(() => null);

  if (current === lock.token) {
    await redisCommand(["DEL", lock.key]).catch(() => undefined);
  }
}

function recordKey(checkoutReference: string) {
  return `${refKeyPrefix}${checkoutReference}`;
}

function isOpeningTicket(record: Pick<SalesRecord, "ticketType">) {
  return record.ticketType === earlyBirdTicketType;
}

function getOpeningTicketsSoldOverride() {
  const raw = process.env.OPENING_TICKETS_SOLD_OVERRIDE;

  if (!raw?.trim()) {
    return undefined;
  }

  const value = Number(raw.trim());

  if (!Number.isInteger(value) || value < 0) {
    return undefined;
  }

  return Math.min(value, earlyBirdLimit);
}

function getEffectiveOpeningSold(databasePaidCount: number) {
  const override = getOpeningTicketsSoldOverride();

  if (override === undefined) {
    return {
      sold: databasePaidCount,
      source: "database" as const
    };
  }

  return {
    sold: Math.max(databasePaidCount, override),
    source: "override" as const
  };
}

function isActiveOpeningHold(record: SalesRecord, now = Date.now()) {
  if (!isOpeningTicket(record) || record.status !== "pending_payment" || !record.inventoryHoldExpiresAt) {
    return false;
  }

  const expiresAt = Date.parse(record.inventoryHoldExpiresAt);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

function compactPhone(value: string | undefined) {
  return String(value ?? "").replace(/[\s-]/g, "");
}

function normalizedEmail(value: string | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function ticketMatchesPaymentLink(record: SalesRecord, growPaymentLinkId: string | undefined) {
  if (!growPaymentLinkId) {
    return true;
  }

  const normalized = growPaymentLinkId.toLowerCase();

  if (record.ticketType === "opening" && /opening|mabuza|פתיחה|מוזל|100/.test(normalized)) {
    return true;
  }

  if (record.ticketType === "single" && /single|אולם אחד|אירוע אחד|200/.test(normalized)) {
    return true;
  }

  if (record.ticketType === "triple" && /3|three|triple|משולב|450/.test(normalized)) {
    return true;
  }

  if (record.ticketType === "full" && /full|4 מתוך 4|מלא|550/.test(normalized)) {
    return true;
  }

  const ticket = checkoutConfig.tickets.find((item) => item.type === record.ticketType);
  return Boolean(ticket?.growUrl.includes(growPaymentLinkId));
}

function isWithinPaymentWindow(record: SalesRecord, paidAt: string | undefined) {
  if (!paidAt) {
    return true;
  }

  const createdAt = Date.parse(record.createdAt);
  const transactionAt = Date.parse(paidAt);

  if (!Number.isFinite(createdAt) || !Number.isFinite(transactionAt)) {
    return true;
  }

  const diff = transactionAt - createdAt;
  return diff >= -10 * 60 * 1000 && diff <= 24 * 60 * 60 * 1000;
}

function parseHash(hash: string[] | Record<string, string> | null): SalesRecord | null {
  if (!hash) {
    return null;
  }

  const object = Array.isArray(hash)
    ? hash.reduce<Record<string, string>>((current, value, index, array) => {
        if (index % 2 === 0) {
          current[value] = array[index + 1] ?? "";
        }
        return current;
      }, {})
    : hash;

  if (!object.checkoutReference) {
    return null;
  }

  const hasComplianceFields = [
    object.healthDeclarationCompleted,
    object.requiresMedicalApproval,
    object.healthDeclarationVersion,
    object.healthDeclarationAcceptedAt,
    object.healthDeclarationStatus,
    object.healthAnswers,
    object.termsAccepted,
    object.termsVersion,
    object.termsAcceptedAt,
    object.termsDocumentRead,
    object.participantName,
    object.participantDateOfBirth,
    object.isMinor,
    object.guardianConsent,
    object.guardianName,
    object.guardianPhone,
    object.approverRole,
    object.photoConsent
  ].some((value) => value !== undefined && value !== "");

  return {
    checkoutReference: object.checkoutReference,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
    ticketType: object.ticketType as CheckoutTicketType,
    ticketName: object.ticketName,
    price: Number(object.price),
    selectedEventIds: JSON.parse(object.selectedEventIds || "[]") as string[],
    selectedEvents: JSON.parse(object.selectedEvents || "[]") as SalesRecord["selectedEvents"],
    fullName: object.fullName,
    phone: object.phone,
    email: object.email,
    dateOfBirth: object.dateOfBirth || undefined,
    status: object.status as SalesRecord["status"],
    paymentProvider: object.paymentProvider === "cash" ? "cash" : "grow",
    paymentMethod: object.paymentMethod === "Cash" ? "Cash" : object.paymentMethod === "Grow" ? "Grow" : undefined,
    checkinFormCompleted: object.checkinFormCompleted === "true",
    registrationSource:
      object.registrationSource === "Manual Check-in" ||
      object.registrationSource === "Cash / Walk-in" ||
      object.registrationSource === "Missing Forms Completion"
        ? object.registrationSource
        : object.registrationSource === "Website Purchase"
          ? "Website Purchase"
          : undefined,
    notes: object.notes || undefined,
    growTransactionId: object.growTransactionId || undefined,
    growToken: object.growToken || undefined,
    growPaymentLinkId: object.growPaymentLinkId || undefined,
    growPaymentAmount: object.growPaymentAmount ? Number(object.growPaymentAmount) : undefined,
    growPaymentStatus: object.growPaymentStatus || undefined,
    paymentVerifiedAt: object.paymentVerifiedAt || undefined,
    paymentMatchMethod: object.paymentMatchMethod || undefined,
    inventoryHoldExpiresAt: object.inventoryHoldExpiresAt || undefined,
    compliance: hasComplianceFields
      ? {
          healthDeclarationCompleted: object.healthDeclarationCompleted === "true",
          requiresMedicalApproval: object.requiresMedicalApproval === "true",
          healthDeclarationVersion: object.healthDeclarationVersion || undefined,
          healthDeclarationAcceptedAt: object.healthDeclarationAcceptedAt || undefined,
          healthDeclarationStatus:
            object.healthDeclarationStatus === "medical-review-required" || object.healthDeclarationStatus === "completed"
              ? object.healthDeclarationStatus
              : object.healthDeclarationCompleted === "true"
                ? "completed"
                : "incomplete",
          healthAnswers: JSON.parse(object.healthAnswers || "{}") as Record<string, "yes" | "no">,
          termsAccepted: object.termsAccepted === "true",
          termsVersion: object.termsVersion || undefined,
          termsAcceptedAt: object.termsAcceptedAt || undefined,
          termsDocumentRead: object.termsDocumentRead === "true",
          participantName: object.participantName || undefined,
          participantDateOfBirth: object.participantDateOfBirth || undefined,
          isMinor: object.isMinor === "true",
          guardianConsent: object.guardianConsent === "true",
          guardianName: object.guardianName || undefined,
          guardianPhone: object.guardianPhone || undefined,
          approverRole: object.approverRole === "guardian" ? "guardian" : "participant",
          photoConsent:
            object.photoConsent === "approved" || object.photoConsent === "declined" ? object.photoConsent : "not_selected"
        }
      : undefined,
    sourcePage: object.sourcePage || undefined,
    ctaId: object.ctaId || undefined,
    utm: JSON.parse(object.utm || "{}") as Record<string, string>
  };
}

function serializeRecord(record: SalesRecord) {
  return {
    checkoutReference: record.checkoutReference,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt ?? record.createdAt,
    ticketType: record.ticketType,
    ticketName: record.ticketName,
    price: String(record.price),
    selectedEventIds: JSON.stringify(record.selectedEventIds),
    selectedEvents: JSON.stringify(record.selectedEvents),
    fullName: record.fullName,
    phone: record.phone,
    email: record.email,
    dateOfBirth: record.dateOfBirth ?? "",
    status: record.status,
    paymentProvider: record.paymentProvider,
    paymentMethod: record.paymentMethod ?? "",
    checkinFormCompleted: String(record.checkinFormCompleted ?? false),
    registrationSource: record.registrationSource ?? "",
    notes: record.notes ?? "",
    growTransactionId: record.growTransactionId ?? "",
    growToken: record.growToken ?? "",
    growPaymentLinkId: record.growPaymentLinkId ?? "",
    growPaymentAmount: record.growPaymentAmount === undefined ? "" : String(record.growPaymentAmount),
    growPaymentStatus: record.growPaymentStatus ?? "",
    paymentVerifiedAt: record.paymentVerifiedAt ?? "",
    paymentMatchMethod: record.paymentMatchMethod ?? "",
    inventoryHoldExpiresAt: record.inventoryHoldExpiresAt ?? "",
    healthDeclarationCompleted: String(record.compliance?.healthDeclarationCompleted ?? false),
    requiresMedicalApproval: String(record.compliance?.requiresMedicalApproval ?? false),
    healthDeclarationVersion: record.compliance?.healthDeclarationVersion ?? "",
    healthDeclarationAcceptedAt: record.compliance?.healthDeclarationAcceptedAt ?? "",
    healthDeclarationStatus: record.compliance?.healthDeclarationStatus ?? "",
    healthAnswers: JSON.stringify(record.compliance?.healthAnswers ?? {}),
    termsAccepted: String(record.compliance?.termsAccepted ?? false),
    termsVersion: record.compliance?.termsVersion ?? "",
    termsAcceptedAt: record.compliance?.termsAcceptedAt ?? "",
    termsDocumentRead: String(record.compliance?.termsDocumentRead ?? false),
    participantName: record.compliance?.participantName ?? "",
    participantDateOfBirth: record.compliance?.participantDateOfBirth ?? "",
    isMinor: String(record.compliance?.isMinor ?? false),
    guardianConsent: String(record.compliance?.guardianConsent ?? false),
    guardianName: record.compliance?.guardianName ?? "",
    guardianPhone: record.compliance?.guardianPhone ?? "",
    approverRole: record.compliance?.approverRole ?? "",
    photoConsent: record.compliance?.photoConsent ?? "",
    sourcePage: record.sourcePage ?? "",
    ctaId: record.ctaId ?? "",
    utm: JSON.stringify(record.utm ?? {})
  };
}

export function createServerCheckoutReference() {
  return `PT-2026-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function saveSalesRecord(record: SalesRecord) {
  const serialized = serializeRecord(record);
  await redisPipeline([
    ["HSET", recordKey(record.checkoutReference), ...Object.entries(serialized).flat()],
    ["LPUSH", refsKey, record.checkoutReference]
  ]);
  return record;
}

export async function updateSalesRecord(record: SalesRecord) {
  await redisCommand(["HSET", recordKey(record.checkoutReference), ...Object.entries(serializeRecord(record)).flat()]);
  return record;
}

export async function getEarlyBirdAvailability(): Promise<EarlyBirdAvailability> {
  const records = await listSalesRecords();
  const databasePaidCount = records.filter((record) => isOpeningTicket(record) && record.status === "paid").length;
  const { sold, source } = getEffectiveOpeningSold(databasePaidCount);

  return {
    total: earlyBirdLimit,
    sold: Math.max(sold, earlyBirdLimit),
    remaining: 0,
    status: "sold_out",
    isSoldOut: true,
    source
  };
}

export async function saveSalesRecordWithInventoryGuard(record: SalesRecord) {
  if (!isOpeningTicket(record)) {
    return saveSalesRecord(record);
  }

  if (earlyBirdSalesClosed) {
    throw new Error("EARLY_BIRD_SOLD_OUT");
  }

  const lock = await acquireInventoryLock();

  if (!lock) {
    throw new Error("EARLY_BIRD_INVENTORY_BUSY");
  }

  try {
    const now = Date.now();
    const records = await listSalesRecords();
    const databasePaidCount = records.filter((existing) => isOpeningTicket(existing) && existing.status === "paid").length;
    const paidCount = getEffectiveOpeningSold(databasePaidCount).sold;
    const activeHoldCount = records.filter((existing) => isActiveOpeningHold(existing, now)).length;

    if (paidCount >= earlyBirdLimit || paidCount + activeHoldCount >= earlyBirdLimit) {
      throw new Error("EARLY_BIRD_SOLD_OUT");
    }

    return saveSalesRecord({
      ...record,
      inventoryHoldExpiresAt: new Date(now + earlyBirdHoldMs).toISOString()
    });
  } finally {
    await releaseInventoryLock(lock);
  }
}

export async function getSalesRecord(checkoutReference: string) {
  const hash = await redisCommand<string[] | Record<string, string> | null>(["HGETALL", recordKey(checkoutReference)]);
  return parseHash(hash);
}

export async function findPendingRecordForGrowPayment(input: {
  amount?: number;
  email?: string;
  phone?: string;
  growPaymentLinkId?: string;
  paidAt?: string;
}) {
  if (typeof input.amount !== "number") {
    return null;
  }

  const email = normalizedEmail(input.email);
  const phone = compactPhone(input.phone);

  if (!email && !phone) {
    return null;
  }

  const records = await listSalesRecords();
  const matches = records.filter((record) => {
    const emailMatches = email && normalizedEmail(record.email) === email;
    const phoneMatches = phone && compactPhone(record.phone) === phone;

    return (
      record.status === "pending_payment" &&
      record.price === input.amount &&
      Boolean(emailMatches || phoneMatches) &&
      ticketMatchesPaymentLink(record, input.growPaymentLinkId) &&
      isWithinPaymentWindow(record, input.paidAt)
    );
  });

  return matches.length === 1 ? matches[0] : null;
}

export async function findPaidRecordForCheckin(input: {
  fullName: string;
  phone: string;
  email?: string;
}) {
  const phone = compactPhone(input.phone);
  const email = normalizedEmail(input.email);
  const fullName = input.fullName.trim().toLowerCase();

  if (!phone && !email && !fullName) {
    return null;
  }

  const records = await listSalesRecords();
  const matches = records.filter((record) => {
    if (record.status !== "paid") {
      return false;
    }

    const phoneMatches = phone && compactPhone(record.phone) === phone;
    const emailMatches = email && normalizedEmail(record.email) === email;
    const nameMatches = fullName && record.fullName.trim().toLowerCase() === fullName;

    return Boolean(phoneMatches || (emailMatches && nameMatches));
  });

  return matches.length === 1 ? matches[0] : null;
}

export async function findExistingManualCheckinRecord(input: {
  fullName: string;
  phone: string;
  email?: string;
  selectedEventId?: string;
}) {
  const phone = compactPhone(input.phone);
  const email = normalizedEmail(input.email);
  const fullName = input.fullName.trim().toLowerCase();

  if (!phone && !email && !fullName) {
    return null;
  }

  const records = await listSalesRecords();
  const matches = records.filter((record) => {
    if (record.registrationSource !== "Cash / Walk-in" && record.registrationSource !== "Manual Check-in") {
      return false;
    }

    if (record.paymentProvider !== "cash" || record.status !== "pending_cash") {
      return false;
    }

    if (input.selectedEventId && !record.selectedEventIds.includes(input.selectedEventId)) {
      return false;
    }

    const phoneMatches = phone && compactPhone(record.phone) === phone;
    const emailMatches = email && normalizedEmail(record.email) === email;
    const nameMatches = fullName && record.fullName.trim().toLowerCase() === fullName;

    return Boolean(phoneMatches || (emailMatches && nameMatches));
  });

  return matches.length === 1 ? matches[0] : null;
}

export async function listSalesRecords() {
  const refs = await redisCommand<string[]>(["LRANGE", refsKey, 0, 999]);
  const uniqueRefs = Array.from(new Set(refs));

  if (!uniqueRefs.length) {
    return [];
  }

  const hashes = await redisPipeline<string[] | Record<string, string> | null>(
    uniqueRefs.map((reference) => ["HGETALL", recordKey(reference)])
  );

  return hashes
    .map(parseHash)
    .filter((record): record is SalesRecord => Boolean(record))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markSalesRecordPaid(input: {
  checkoutReference: string;
  growTransactionId?: string;
  growToken?: string;
  growPaymentLinkId?: string;
  growPaymentAmount?: number;
  growPaymentStatus?: string;
  paymentMatchMethod?: string;
}) {
  const existing = await getSalesRecord(input.checkoutReference);

  if (!existing) {
    return null;
  }

  if (typeof input.growPaymentAmount === "number" && input.growPaymentAmount !== existing.price) {
    throw new Error("GROW_AMOUNT_MISMATCH");
  }

  if (existing.status === "paid") {
    return existing;
  }

  const records = await listSalesRecords();

  if (input.growTransactionId) {
    const duplicateTransaction = records.find(
      (record) =>
        record.growTransactionId === input.growTransactionId &&
        record.checkoutReference !== existing.checkoutReference
    );

    if (duplicateTransaction) {
      throw new Error("DUPLICATE_GROW_TRANSACTION");
    }
  }

  if (isOpeningTicket(existing)) {
    const lock = await acquireInventoryLock();

    if (!lock) {
      throw new Error("EARLY_BIRD_INVENTORY_BUSY");
    }

    try {
      const freshRecords = await listSalesRecords();
      const databasePaidCount = freshRecords.filter(
        (record) =>
          isOpeningTicket(record) &&
          record.status === "paid" &&
          record.checkoutReference !== existing.checkoutReference
      ).length;
      const paidCount = getEffectiveOpeningSold(databasePaidCount).sold;

      if (paidCount >= earlyBirdLimit) {
        throw new Error("EARLY_BIRD_SOLD_OUT");
      }
    } finally {
      await releaseInventoryLock(lock);
    }
  }

  const updated: SalesRecord = {
    ...existing,
    status: "paid",
    updatedAt: new Date().toISOString(),
    growTransactionId: input.growTransactionId ?? existing.growTransactionId,
    growToken: input.growToken ?? existing.growToken,
    growPaymentLinkId: input.growPaymentLinkId ?? existing.growPaymentLinkId,
    growPaymentAmount: input.growPaymentAmount ?? existing.growPaymentAmount,
    growPaymentStatus: input.growPaymentStatus ?? existing.growPaymentStatus,
    paymentVerifiedAt: new Date().toISOString(),
    paymentMatchMethod: input.paymentMatchMethod ?? existing.paymentMatchMethod ?? "checkoutReference"
  };

  await redisCommand(["HSET", recordKey(updated.checkoutReference), ...Object.entries(serializeRecord(updated)).flat()]);
  return updated;
}

export async function markSalesRecordCashPaid(checkoutReference: string) {
  const existing = await getSalesRecord(checkoutReference);

  if (!existing || existing.status !== "pending_cash") {
    return null;
  }

  const updated: SalesRecord = {
    ...existing,
    status: "paid",
    updatedAt: new Date().toISOString(),
    paymentMethod: "Cash",
    paymentProvider: "cash",
    paymentVerifiedAt: new Date().toISOString(),
    paymentMatchMethod: "cash-admin-confirmation",
    notes: [existing.notes, "Cash payment confirmed by admin"].filter(Boolean).join(" | ")
  };

  await redisCommand(["HSET", recordKey(updated.checkoutReference), ...Object.entries(serializeRecord(updated)).flat()]);
  return updated;
}

export function verifySecret(value: string | null | undefined, expected: string | undefined) {
  const normalizedValue = normalizeSecret(value);
  const normalizedExpected = normalizeSecret(expected);

  if (!normalizedValue || !normalizedExpected) {
    return false;
  }

  const valueBuffer = Buffer.from(normalizedValue);
  const expectedBuffer = Buffer.from(normalizedExpected);

  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

function normalizeSecret(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  const first = trimmed.at(0);
  const last = trimmed.at(-1);

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function getCentralStorageStatus() {
  return {
    configured: Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    provider: "Vercel KV / Upstash Redis REST"
  };
}

export { checkoutConfig };
