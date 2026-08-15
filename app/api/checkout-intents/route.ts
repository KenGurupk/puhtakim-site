import { NextResponse } from "next/server";

import { createRequestContext } from "@/lib/api-logging";
import { validateCheckoutIntentPayload } from "@/lib/checkout-validation";
import { createServerCheckoutReference, getCentralStorageStatus, saveSalesRecordWithInventoryGuard } from "@/lib/sales-db";

export async function POST(request: Request) {
  const context = createRequestContext("/api/checkout-intents");

  if (!getCentralStorageStatus().configured) {
    context.log(503, { reason: "central_storage_not_configured" });
    return NextResponse.json(
      { error: "מערכת המכירות המרכזית עדיין לא מוגדרת. חסרים משתני סביבה של Database.", requestId: context.requestId },
      { status: 503 }
    );
  }

  const payload = await request.json().catch(() => null);
  const validation = validateCheckoutIntentPayload(payload);

  if (!validation.ok) {
    context.log(400, { reason: "validation_failed" });
    return NextResponse.json({ error: validation.error, requestId: context.requestId }, { status: 400 });
  }

  const now = new Date().toISOString();

  try {
    const intent = await saveSalesRecordWithInventoryGuard({
      checkoutReference: createServerCheckoutReference(),
      createdAt: now,
      updatedAt: now,
      ticketType: validation.ticket.type,
      ticketName: validation.ticket.name,
      price: validation.ticket.price,
      selectedEventIds: validation.selectedEventIds,
      selectedEvents: validation.selectedEvents,
      fullName: validation.customer.fullName,
      phone: validation.customer.phone,
      email: validation.customer.email,
      dateOfBirth: validation.customer.dateOfBirth,
      compliance: validation.compliance,
      status: "pending_payment",
      paymentProvider: "grow",
      sourcePage: validation.sourcePage,
      ctaId: validation.ctaId,
      utm: validation.utm
    });

    context.log(200, {
      checkoutReference: intent.checkoutReference,
      ticketType: intent.ticketType,
      status: intent.status
    });

    return NextResponse.json({ intent, requestId: context.requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "EARLY_BIRD_SOLD_OUT") {
      context.log(409, { reason: message });
      return NextResponse.json(
        { error: "המלאי המוזל אזל. אפשר עדיין לשמור כרטיס רגיל.", requestId: context.requestId },
        { status: 409 }
      );
    }

    if (message === "EARLY_BIRD_INVENTORY_BUSY") {
      context.log(409, { reason: message });
      return NextResponse.json(
        { error: "הרבה אנשים מנסים לשמור כרטיס עכשיו. נסו שוב בעוד רגע.", requestId: context.requestId },
        { status: 409 }
      );
    }

    context.log(500, { reason: message || "unknown_error" });
    throw error;
  }
}
