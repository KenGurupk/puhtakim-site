import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";

import { createRequestContext } from "@/lib/api-logging";
import { getSalesRecord } from "@/lib/sales-db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ checkoutReference: string }> }) {
  if (!await hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const context = createRequestContext("/api/admin/purchases/:checkoutReference");
  const { checkoutReference } = await params;
  const purchase = await getSalesRecord(checkoutReference);

  if (!purchase) {
    context.log(404, { checkoutReference });
    return NextResponse.json({ error: "ההרשמה לא נמצאה.", requestId: context.requestId }, { status: 404 });
  }

  context.log(200, { checkoutReference });
  return NextResponse.json({ purchase: { ...purchase, growToken: undefined, statusAccessToken: undefined }, requestId: context.requestId }, { headers: { "Cache-Control": "no-store" } });
}
