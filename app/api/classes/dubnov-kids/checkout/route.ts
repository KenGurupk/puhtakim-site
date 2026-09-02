import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { dubnovKidsConfig, getDubnovKidsPlan, type DubnovKidsPlan } from "@/lib/dubnov-kids";
import { getDubnovKidsGrowConfig } from "@/lib/dubnov-kids-server";
import { createServerCheckoutReference, getCentralStorageStatus, listSalesRecords, saveSalesRecord } from "@/lib/sales-db";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (!getCentralStorageStatus().configured) {
    return NextResponse.json({ error: "מערכת ההרשמה עדיין לא זמינה. נסו שוב בעוד כמה דקות." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const planId = text(body?.plan) as DubnovKidsPlan;
  const plan = getDubnovKidsPlan(planId);
  const fullName = text(body?.fullName);
  const phone = text(body?.phone);
  const email = text(body?.email);
  const dateOfBirth = text(body?.dateOfBirth);
  const guardianName = text(body?.guardianName);
  const guardianPhone = text(body?.guardianPhone);
  const emergencyContactName = text(body?.emergencyContactName);
  const emergencyContactPhone = text(body?.emergencyContactPhone);
  const medicalNotes = text(body?.medicalNotes);
  const compliance = body?.compliance as Record<string, unknown> | undefined;

  if (!plan || !fullName || !phone || !email || !dateOfBirth || !guardianName || !guardianPhone || !emergencyContactName || !emergencyContactPhone) {
    return NextResponse.json({ error: "חסרים פרטים בטופס. עברו שוב על השדות המסומנים." }, { status: 400 });
  }

  if (compliance?.termsAccepted !== true || compliance?.healthDeclarationCompleted !== true || compliance?.guardianConsent !== true) {
    return NextResponse.json({ error: "כדי להירשם צריך להשלים את הצהרת הבריאות, התנאים ואישור ההורה/אפוטרופוס." }, { status: 400 });
  }

  const grow = getDubnovKidsGrowConfig(planId);
  if (!grow.url) {
    return NextResponse.json({ error: "ההרשמה למסלול הזה תיפתח בקרוב." }, { status: 409 });
  }

  const records = await listSalesRecords();
  const sold = records.filter((record) => record.ticketType === "dubnov-kids" && record.status === "paid").length;
  if (sold >= dubnovKidsConfig.capacity) {
    return NextResponse.json({ error: "הקבוצה מלאה כרגע. דברו איתנו ונבדוק מה אפשר לעשות." }, { status: 409 });
  }
  if (planId !== "monthly" && dubnovKidsConfig.capacity - sold <= 1) {
    return NextResponse.json({ error: "המקום האחרון בקבוצה נשמר כרגע למנוי חודשי." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const checkoutReference = createServerCheckoutReference();
  const statusAccessToken = randomBytes(24).toString("hex");

  await saveSalesRecord({
    checkoutReference,
    createdAt: now,
    updatedAt: now,
    ticketType: "dubnov-kids",
    ticketName: plan.name,
    price: plan.price,
    selectedEventIds: [],
    selectedEvents: [],
    fullName,
    phone,
    email,
    dateOfBirth,
    status: "pending_payment",
    paymentProvider: "grow",
    productType: "dubnov_kids_class",
    classPlan: planId,
    classMonth: dubnovKidsConfig.month,
    emergencyContactName,
    emergencyContactPhone,
    medicalNotes: medicalNotes || undefined,
    statusAccessToken,
    growPaymentLinkId: grow.paymentLinkId || undefined,
    compliance: compliance as never,
    registrationSource: "Website Purchase",
    sourcePage: "/classes/dubnov-kids",
    ctaId: `dubnov-kids-${planId}`,
    utm: (body?.utm as Record<string, string>) ?? {}
  });

  const paymentUrl = new URL(grow.url);
  paymentUrl.searchParams.set("checkoutReference", checkoutReference);

  return NextResponse.json({ checkoutReference, statusAccessToken, paymentUrl: paymentUrl.toString() });
}
