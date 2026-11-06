import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";

import { createRequestContext } from "@/lib/api-logging";
import { getCentralStorageStatus, listSalesRecords } from "@/lib/sales-db";

export async function GET(request: NextRequest) {
  if (!await hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  const context = createRequestContext("/api/admin/purchases");

  if (!getCentralStorageStatus().configured) {
    context.log(503, { reason: "central_storage_not_configured" });
    return NextResponse.json(
      { error: "Central sales database is not configured.", purchases: [], requestId: context.requestId },
      { status: 503 }
    );
  }

  try {
    const purchases = (await listSalesRecords()).map((purchase) => ({
      ...purchase,
      growToken: undefined,
      statusAccessToken: undefined,
      compliance: purchase.compliance ? { ...purchase.compliance, healthAnswers: undefined, guardianPhone: undefined } : undefined
    }));
    context.log(200, { count: purchases.length });
    return NextResponse.json({ purchases, requestId: context.requestId }, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
  } catch {
    context.log(503, { reason: "central_storage_unavailable" });
    return NextResponse.json({ error: "מאגר ההרשמות אינו זמין." }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
