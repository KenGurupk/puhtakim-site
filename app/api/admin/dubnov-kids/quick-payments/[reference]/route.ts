import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getQuickPaymentPrivate } from "@/lib/dubnov-quick-payment-store";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
  if (!await hasAdminSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const { reference } = await params;
  if (!/^PT-DUBNOV-[a-f0-9]{32}$/.test(reference)) return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  try {
    const data = await getQuickPaymentPrivate(reference);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404, headers });
    // An explicit whitelist prevents payment process credentials from entering the admin UI.
    return NextResponse.json({ registrationId: data.registrationId, healthStatus: data.healthStatus, healthUpdate: data.healthUpdate, healthConfirmedAt: data.healthConfirmedAt }, { headers });
  } catch { return NextResponse.json({ error: "המידע אינו זמין כרגע." }, { status: 503, headers }); }
}
