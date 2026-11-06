import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { redisCommand } from "@/lib/sales-db";

export type QuickPaymentPrivate = {
  registrationId: string;
  healthStatus: "unchanged" | "changed";
  healthUpdate: string;
  healthConfirmedAt: string;
  fingerprint: string;
  callbackKey: string;
  state: "creating" | "ready" | "unknown";
  paymentUrl?: string;
  paymentUrlExpiresAt?: string;
  processId?: string;
  processToken?: string;
  acknowledgedAt?: string;
};

const privatePrefix = "pushtakim:dubnov:quick:private:";

export async function getQuickPaymentPrivate(reference: string) {
  const value = await redisCommand<string | null>(["GET", privatePrefix + reference]);
  return value ? JSON.parse(value) as QuickPaymentPrivate : null;
}

export async function saveQuickPaymentPrivate(reference: string, value: QuickPaymentPrivate) {
  await redisCommand(["SET", privatePrefix + reference, JSON.stringify(value)]);
}

export async function quickPaymentRateLimit(identity: string) {
  const hash = createHash("sha256").update(identity).digest("hex");
  const minute = Math.floor(Date.now() / 60000);
  const key = "pushtakim:dubnov:quick:rate:" + hash + ":" + minute;
  const result = await redisCommand<number>(["EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],120) end; return n", 1, key]);
  return result <= 15;
}

export async function withQuickPaymentLock<T>(identity: string, callback: () => Promise<T>) {
  const key = "pushtakim:dubnov:quick:lock:" + createHash("sha256").update(identity).digest("hex");
  const token = randomBytes(16).toString("hex");
  if (await redisCommand(["SET", key, token, "NX", "PX", 60000]) !== "OK") throw new Error("QUICK_PAYMENT_BUSY");
  try { return await callback(); }
  finally {
    await redisCommand(["EVAL", "if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end", 1, key, token]);
  }
}

export function quickPaymentFingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function quickPaymentIdempotencyKey(registrationId: string, idempotencyKey: string) {
  return "pushtakim:dubnov:quick:attempt:" + quickPaymentFingerprint([registrationId, idempotencyKey]);
}
