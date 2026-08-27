import { NextResponse } from "next/server";

import { createRequestContext } from "@/lib/api-logging";
import { getCentralStorageStatus, listSalesRecords } from "@/lib/sales-db";

export async function GET() {
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
      compliance: purchase.compliance ? { ...purchase.compliance, healthAnswers: undefined, guardianPhone: undefined } : undefined
    }));
    context.log(200, { count: purchases.length });
    return NextResponse.json({ purchases, requestId: context.requestId });
  } catch (error) {
    context.log(500, { reason: error instanceof Error ? error.message : "unknown_error" });
    throw error;
  }
}
