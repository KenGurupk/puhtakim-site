import { NextResponse } from "next/server";

import { checkoutConfig } from "@/lib/checkout-config";
import type { CheckoutCompliance } from "@/lib/checkout-intents";
import { createRequestContext } from "@/lib/api-logging";
import {
  acquireManualCheckinLock,
  createServerCheckoutReference,
  findExistingManualCheckinRecord,
  findPaidRecordForCheckin,
  getCentralStorageStatus,
  releaseManualCheckinLock,
  saveSalesRecord,
  updateSalesRecord
} from "@/lib/sales-db";

const termsVersion = "2026-07-v1";
const healthDeclarationVersion = "2026-07-v1";

function isValidIsraeliMobile(phone: string) {
  const compact = phone.replace(/[\s-]/g, "");
  return /^(05\d{8}|\+9725\d{8}|9725\d{8})$/.test(compact);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isValidPastDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= getTodayDateString();
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export async function POST(request: Request) {
  const context = createRequestContext("/api/checkin");
  const dryRunEnabled =
    process.env.CHECKIN_DRY_RUN_ENABLED === "true" && new URL(request.url).searchParams.get("dryRun") === "1";

  if (!dryRunEnabled && !getCentralStorageStatus().configured) {
    context.log(503, { reason: "central_storage_not_configured" });
    return NextResponse.json({ error: "מערכת ההרשמה המרכזית אינה זמינה כרגע.", requestId: context.requestId }, { status: 503 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        fullName?: string;
        phone?: string;
        email?: string;
        dateOfBirth?: string;
        healthAnswers?: Record<string, "yes" | "no">;
        healthDeclarationAccepted?: boolean;
        termsAccepted?: boolean;
        guardianName?: string;
        guardianPhone?: string;
        guardianConsent?: boolean;
      }
    | null;

  if (!payload) {
    return NextResponse.json({ error: "בקשת ההרשמה לא תקינה.", requestId: context.requestId }, { status: 400 });
  }

  const fullName = String(payload.fullName ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const dateOfBirth = String(payload.dateOfBirth ?? "").trim();
  const healthAnswers = payload.healthAnswers && typeof payload.healthAnswers === "object" ? payload.healthAnswers : {};
  const guardianName = String(payload.guardianName ?? "").trim();
  const guardianPhone = String(payload.guardianPhone ?? "").trim();

  if (!fullName) {
    return NextResponse.json({ error: "צריך למלא שם מלא.", requestId: context.requestId }, { status: 400 });
  }

  if (!isValidIsraeliMobile(phone)) {
    return NextResponse.json({ error: "צריך למלא מספר נייד ישראלי תקין.", requestId: context.requestId }, { status: 400 });
  }

  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "כתובת האימייל לא תקינה.", requestId: context.requestId }, { status: 400 });
  }

  if (!isValidPastDate(dateOfBirth)) {
    return NextResponse.json({ error: "צריך להזין תאריך לידה תקין שאינו בעתיד.", requestId: context.requestId }, { status: 400 });
  }

  if (Object.keys(healthAnswers).length !== 10 || Object.values(healthAnswers).some((answer) => answer !== "yes" && answer !== "no")) {
    return NextResponse.json({ error: "צריך להשלים את הצהרת הבריאות.", requestId: context.requestId }, { status: 400 });
  }

  if (payload.healthDeclarationAccepted !== true) {
    return NextResponse.json({ error: "צריך לאשר שהמידע בהצהרת הבריאות נכון ומלא.", requestId: context.requestId }, { status: 400 });
  }

  if (payload.termsAccepted !== true) {
    return NextResponse.json({ error: "צריך לאשר את תנאי ההשתתפות.", requestId: context.requestId }, { status: 400 });
  }

  const isMinor = calculateAge(dateOfBirth) < 18;

  if (isMinor && (!guardianName || !isValidIsraeliMobile(guardianPhone) || payload.guardianConsent !== true)) {
    return NextResponse.json({ error: "משתתף קטין חייב אישור הורה או אפוטרופוס ופרטי קשר תקינים.", requestId: context.requestId }, { status: 400 });
  }

  const openingEvent = checkoutConfig.events[0];
  const now = new Date().toISOString();
  const requiresMedicalApproval = Object.values(healthAnswers).some((answer) => answer === "yes");
  const compliance: CheckoutCompliance = {
    healthDeclarationCompleted: true,
    requiresMedicalApproval,
    healthDeclarationVersion,
    healthDeclarationAcceptedAt: now,
    healthDeclarationStatus: requiresMedicalApproval ? "medical-review-required" : "completed",
    healthAnswers,
    termsAccepted: true,
    termsVersion,
    termsAcceptedAt: now,
    termsDocumentRead: true,
    participantName: fullName,
    participantDateOfBirth: dateOfBirth,
    isMinor,
    guardianConsent: isMinor ? true : false,
    guardianName: isMinor ? guardianName : undefined,
    guardianPhone: isMinor ? guardianPhone : undefined,
    approverRole: isMinor ? "guardian" : "participant",
    photoConsent: "not_selected"
  };

  if (dryRunEnabled) {
    context.log(200, { dryRun: true, requiresMedicalApproval });
    return NextResponse.json({
      ok: true,
      checkoutReference: "DRY-RUN-CHECKIN",
      requiresMedicalApproval,
      dryRun: true,
      requestId: context.requestId
    });
  }

  const manualCheckinLock = await acquireManualCheckinLock({ fullName, phone, email });

  if (!manualCheckinLock) {
    context.log(409, { reason: "manual_checkin_busy" });
    return NextResponse.json(
      { error: "ההרשמה הזו כבר נשמרת כרגע. חכו רגע ונסו שוב.", requestId: context.requestId },
      { status: 409 }
    );
  }

  try {
  const paidMatch = await findPaidRecordForCheckin({ fullName, phone, email });

  if (paidMatch) {
    const updated = await updateSalesRecord({
      ...paidMatch,
      updatedAt: now,
      fullName: paidMatch.fullName || fullName,
      phone: paidMatch.phone || phone,
      email: paidMatch.email || email,
      dateOfBirth: paidMatch.dateOfBirth || dateOfBirth,
      checkinFormCompleted: true,
      registrationSource: "Missing Forms Completion",
      compliance: {
        ...paidMatch.compliance,
        ...compliance,
        photoConsent: paidMatch.compliance?.photoConsent ?? compliance.photoConsent
      },
      notes: [paidMatch.notes, "Forms completed at event check-in"].filter(Boolean).join(" | ")
    });

    context.log(200, {
      checkoutReference: updated.checkoutReference,
      status: updated.status,
      paymentProvider: updated.paymentProvider,
      mergedWithPaidRecord: true
    });

    return NextResponse.json({
      ok: true,
      checkoutReference: updated.checkoutReference,
      requiresMedicalApproval,
      matchedExistingPaidRegistration: true,
      requestId: context.requestId
    });
  }

  const existingManualCheckin = await findExistingManualCheckinRecord({
    fullName,
    phone,
    email,
    selectedEventId: openingEvent?.id
  });

  if (existingManualCheckin) {
    context.log(200, {
      checkoutReference: existingManualCheckin.checkoutReference,
      status: existingManualCheckin.status,
      paymentProvider: existingManualCheckin.paymentProvider,
      duplicateManualCheckinPrevented: true
    });

    return NextResponse.json({
      ok: true,
      checkoutReference: existingManualCheckin.checkoutReference,
      requiresMedicalApproval,
      duplicatePrevented: true,
      requestId: context.requestId
    });
  }

  const record = await saveSalesRecord({
    checkoutReference: createServerCheckoutReference(),
    createdAt: now,
    updatedAt: now,
    ticketType: "single",
    ticketName: "הרשמת צ׳ק-אין במקום",
    price: 0,
    selectedEventIds: openingEvent ? [openingEvent.id] : [],
    selectedEvents: openingEvent
      ? [
          {
            id: openingEvent.id,
            name: openingEvent.name,
            venue: openingEvent.venue,
            city: openingEvent.city,
            date: openingEvent.date
          }
        ]
      : [],
    fullName,
    phone,
    email,
    dateOfBirth,
    status: "pending_cash",
    paymentProvider: "cash",
    paymentMethod: "Cash",
    checkinFormCompleted: true,
    registrationSource: "Cash / Walk-in",
    notes: "Created from event QR check-in form",
    compliance,
    sourcePage: "/checkin",
    ctaId: "event-checkin",
    utm: {}
  });

  context.log(200, {
    checkoutReference: record.checkoutReference,
    status: record.status,
    paymentProvider: record.paymentProvider
  });

  return NextResponse.json({
    ok: true,
    checkoutReference: record.checkoutReference,
    requiresMedicalApproval,
    requestId: context.requestId
  });
  } finally {
    await releaseManualCheckinLock(manualCheckinLock);
  }
}
