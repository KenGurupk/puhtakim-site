import "server-only";

import { getSalesRecord, redisCommand } from "@/lib/sales-db";
import { quickPaymentQuote } from "@/lib/dubnov-quick-payment";
import { getQuickPaymentPrivate, saveQuickPaymentPrivate, withQuickPaymentLock } from "@/lib/dubnov-quick-payment-store";
import { acknowledgeGrowQuickPayment, getGrowQuickPaymentInfo } from "@/lib/grow-quick-payment";

function amountInAgorot(value: unknown) {
  const text = String(value ?? "");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, decimal = ""] = text.split(".");
  const amount = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? amount : null;
}

export async function verifyGrowQuickPayment(reference: string) {
  return withQuickPaymentLock("settle:" + reference, async () => {
    const record = await getSalesRecord(reference), privateData = await getQuickPaymentPrivate(reference);
    if (!record || record.purchaseKind !== "existing_single" || !privateData?.processId || !privateData.processToken) throw new Error("QUICK_PAYMENT_NOT_READY");
    const quote = quickPaymentQuote(record.fullName, record.classMonth || "", record.sessionCount || 0);
    if (quote.total !== record.price) throw new Error("QUICK_PAYMENT_AMOUNT_MISMATCH");
    // Callback payloads and thank-you pages never establish payment. Query Grow with server-held process credentials.
    const transactions = await getGrowQuickPaymentInfo(privateData.processId, privateData.processToken);
    const paid = transactions.filter(t => String(t.statusCode) === "2" && t.status === "שולם");
    if (!paid.length) return { status: record.status };
    if (paid.length !== 1) throw new Error("GROW_AMBIGUOUS_TRANSACTION");
    const transaction = paid[0], transactionId = String(transaction.transactionId || "");
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(transactionId) || amountInAgorot(transaction.sum) !== quote.total * 100) throw new Error("GROW_AMOUNT_MISMATCH");
    if (record.status === "paid" && record.growTransactionId !== transactionId) throw new Error("GROW_TRANSACTION_MISMATCH");
    const now = new Date().toISOString();
    // Atomically bind the transaction to this purchase. Retries neither duplicate sales nor overwrite the declaration.
    const result = await redisCommand<number>(["EVAL", `
      local claimed=redis.call('GET',KEYS[1])
      if claimed and claimed~=ARGV[1] then return -1 end
      local state=redis.call('HGET',KEYS[2],'status')
      if state=='paid' then
        if redis.call('HGET',KEYS[2],'growTransactionId')~=ARGV[2] then return -2 end
        return 1
      end
      redis.call('SET',KEYS[1],ARGV[1])
      redis.call('HSET',KEYS[2],'status','paid','growTransactionId',ARGV[2],'growPaymentAmount',ARGV[3],'growPaymentStatus','שולם','paymentVerifiedAt',ARGV[4],'updatedAt',ARGV[4],'paymentMatchMethod','grow-api-process')
      return 1
    `, 2, "pushtakim:grow:transaction:" + transactionId, "pushtakim:checkout:" + reference, reference, transactionId, String(quote.total), now]);
    if (result !== 1) throw new Error("GROW_DUPLICATE_TRANSACTION");
    if (!privateData.acknowledgedAt) {
      await acknowledgeGrowQuickPayment(transaction, privateData.processId, privateData.processToken);
      await saveQuickPaymentPrivate(reference, { ...privateData, acknowledgedAt: new Date().toISOString() });
    }
    return { status: "paid" };
  });
}
