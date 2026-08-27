import { NextResponse } from "next/server";

import { createRequestContext } from "@/lib/api-logging";
import { getSalesRecord } from "@/lib/sales-db";

export async function GET(_request: Request, { params }: { params: Promise<{ checkoutReference: string }> }) {
  const context = createRequestContext("/api/admin/purchases/:checkoutReference");
  const { checkoutReference } = await params;
  const purchase = await getSalesRecord(checkoutReference);

  if (!purchase) {
    context.log(404, { checkoutReference });
    return NextResponse.json({ error: "ההרשמה לא נמצאה.", requestId: context.requestId }, { status: 404 });
  }

  context.log(200, { checkoutReference });
  return NextResponse.json({ purchase, requestId: context.requestId }, { headers: { "Cache-Control": "no-store" } });
}
