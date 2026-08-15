import { NextResponse } from "next/server";

import { createRequestContext } from "@/lib/api-logging";
import { getCentralStorageStatus, markSalesRecordCashPaid } from "@/lib/sales-db";

export async function POST(request: Request) {
  const context = createRequestContext("/api/admin/cash-paid");

  if (!getCentralStorageStatus().configured) {
    context.log(503, { reason: "central_storage_not_configured" });
    return NextResponse.json({ error: "Central sales database is not configured.", requestId: context.requestId }, { status: 503 });
  }

  const payload = (await request.json().catch(() => null)) as { checkoutReference?: string } | null;
  const checkoutReference = String(payload?.checkoutReference ?? "").trim();

  if (!checkoutReference) {
    context.log(400, { reason: "missing_checkout_reference" });
    return NextResponse.json({ error: "Missing checkout reference.", requestId: context.requestId }, { status: 400 });
  }

  const updated = await markSalesRecordCashPaid(checkoutReference);

  if (!updated) {
    context.log(404, { checkoutReference, reason: "pending_cash_record_not_found" });
    return NextResponse.json({ error: "Pending cash registration was not found.", requestId: context.requestId }, { status: 404 });
  }

  context.log(200, { checkoutReference, status: updated.status, paymentProvider: updated.paymentProvider });
  return NextResponse.json({ purchase: updated, requestId: context.requestId });
}
