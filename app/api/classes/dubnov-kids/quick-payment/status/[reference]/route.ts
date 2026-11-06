import { NextResponse } from "next/server";
import { getSalesRecord, verifySecret } from "@/lib/sales-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const headers = { "Cache-Control": "private, no-store", Vary: "Authorization" };
  const { reference } = await params;
  if (!/^PT-DUBNOV-[a-f0-9]{32}$/.test(reference)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  try {
    const record = await getSalesRecord(reference);
    const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
    if (record?.purchaseKind !== "existing_single" || !verifySecret(token, record.statusAccessToken)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    // Read only: reaching a return/thank-you URL never updates payment status.
    return NextResponse.json({ status: record.status, amount: record.price, month: record.classMonth, sessions: record.sessionCount, transactionId: record.growTransactionId, receiptNumber: record.growReceiptNumber }, { headers });
  } catch { return NextResponse.json({ error: "Status unavailable" }, { status: 503, headers }); }
}
