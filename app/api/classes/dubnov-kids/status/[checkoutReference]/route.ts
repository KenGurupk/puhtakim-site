import { NextResponse } from "next/server";

import { getSalesRecord, verifySecret } from "@/lib/sales-db";

export async function GET(request: Request, { params }: { params: Promise<{ checkoutReference: string }> }) {
  const { checkoutReference } = await params;
  const record = await getSalesRecord(checkoutReference);
  if (!record || record.productType !== "dubnov_kids_class") return NextResponse.json({ error: "ההרשמה לא נמצאה." }, { status: 404 });
  const token = new URL(request.url).searchParams.get("token");
  if (!verifySecret(token, record.statusAccessToken)) return NextResponse.json({ error: "אין הרשאה לצפות בסטטוס." }, { status: 401 });
  return NextResponse.json({ checkoutReference: record.checkoutReference, status: record.status, childFullName: record.fullName, plan: record.classPlan, amount: record.price, paidAmount: record.growPaymentAmount, paymentVerifiedAt: record.paymentVerifiedAt }, { headers: { "Cache-Control": "no-store" } });
}
