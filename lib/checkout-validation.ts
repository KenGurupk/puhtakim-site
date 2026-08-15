import { checkoutConfig, getDefaultSelectedEventIds, type CheckoutTicket, type CheckoutTicketType } from "@/lib/checkout-config";
import type { CheckoutCompliance, CheckoutIntentCustomer, CheckoutIntentInput } from "@/lib/checkout-intents";

type ValidationResult =
  | {
      ok: true;
      ticket: CheckoutTicket;
      selectedEventIds: string[];
      selectedEvents: CheckoutIntentInput["selectedEvents"];
      customer: CheckoutIntentCustomer;
      compliance: CheckoutCompliance;
      sourcePage?: string;
      ctaId?: string;
      utm: Record<string, string>;
    }
  | {
      ok: false;
      error: string;
    };

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

function getTicket(type: CheckoutTicketType) {
  return checkoutConfig.tickets.find((ticket) => ticket.type === type);
}

export function validateCheckoutIntentPayload(payload: unknown): ValidationResult {
  const input = payload as Partial<CheckoutIntentInput> | null;

  if (!input || typeof input !== "object") {
    return { ok: false, error: "בקשת ההרשמה לא תקינה." };
  }

  const ticket = input.ticketType ? getTicket(input.ticketType) : undefined;

  if (!ticket) {
    return { ok: false, error: "סוג הכרטיס לא תקין." };
  }

  if (ticket.salesClosed) {
    return { ok: false, error: "הכרטיס הזה כבר לא זמין. אפשר לבחור כרטיס לבאר שבע או כרטיס לראשון לציון." };
  }

  const fullName = String(input.fullName ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const email = String(input.email ?? "").trim();
  const dateOfBirth = String(input.dateOfBirth ?? "").trim();
  const compliance = input.compliance && typeof input.compliance === "object" ? input.compliance : {};
  const healthDeclarationCompleted = compliance.healthDeclarationCompleted === true;
  const requiresMedicalApproval = compliance.requiresMedicalApproval === true;
  const healthDeclarationVersion = typeof compliance.healthDeclarationVersion === "string" ? compliance.healthDeclarationVersion.trim() : "";
  const healthDeclarationAcceptedAt =
    typeof compliance.healthDeclarationAcceptedAt === "string" ? compliance.healthDeclarationAcceptedAt.trim() : "";
  const healthDeclarationStatus = compliance.healthDeclarationStatus;
  const healthAnswers =
    compliance.healthAnswers && typeof compliance.healthAnswers === "object" ? (compliance.healthAnswers as Record<string, "yes" | "no">) : {};
  const termsAccepted = compliance.termsAccepted === true;
  const termsVersion = typeof compliance.termsVersion === "string" ? compliance.termsVersion.trim() : "";
  const termsAcceptedAt = typeof compliance.termsAcceptedAt === "string" ? compliance.termsAcceptedAt.trim() : "";
  const termsDocumentRead = compliance.termsDocumentRead === true;
  const participantName = typeof compliance.participantName === "string" ? compliance.participantName.trim() : "";
  const participantDateOfBirth =
    typeof compliance.participantDateOfBirth === "string" ? compliance.participantDateOfBirth.trim() : "";
  const isMinor = compliance.isMinor === true;
  const guardianConsent = compliance.guardianConsent === true;
  const guardianName = typeof compliance.guardianName === "string" ? compliance.guardianName.trim() : "";
  const guardianPhone = typeof compliance.guardianPhone === "string" ? compliance.guardianPhone.trim() : "";
  const approverRole = compliance.approverRole === "guardian" ? "guardian" : "participant";
  const photoConsent =
    compliance.photoConsent === "approved" || compliance.photoConsent === "declined" ? compliance.photoConsent : "not_selected";

  if (!fullName) {
    return { ok: false, error: "צריך למלא שם מלא." };
  }

  if (!isValidIsraeliMobile(phone)) {
    return { ok: false, error: "צריך מספר נייד ישראלי תקין." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "צריך אימייל תקין." };
  }

  if (!isValidPastDate(dateOfBirth)) {
    return { ok: false, error: "צריך להזין תאריך לידה תקין שאינו בעתיד." };
  }

  if (!healthDeclarationCompleted) {
    return { ok: false, error: "צריך להשלים את הצהרת הבריאות לפני שממשיכים." };
  }

  if (healthDeclarationVersion !== "2026-07-v1" || !healthDeclarationAcceptedAt || Object.keys(healthAnswers).length !== 10) {
    return { ok: false, error: "הצהרת הבריאות לא נשמרה בצורה תקינה. נסו למלא אותה שוב." };
  }

  const hasMedicalReviewAnswer = Object.values(healthAnswers).some((answer) => answer === "yes");
  const medicalReviewStatusIsValid =
    hasMedicalReviewAnswer &&
    requiresMedicalApproval &&
    healthDeclarationStatus === "medical-review-required";
  const completedHealthStatusIsValid =
    !hasMedicalReviewAnswer &&
    !requiresMedicalApproval &&
    healthDeclarationStatus === "completed";

  if (!medicalReviewStatusIsValid && !completedHealthStatusIsValid) {
    return { ok: false, error: "הצהרת הבריאות לא נשמרה בצורה תקינה. נסו למלא אותה שוב." };
  }

  if (!termsDocumentRead) {
    return { ok: false, error: "צריך לפתוח ולקרוא את תנאי ההשתתפות לפני האישור." };
  }

  if (!termsAccepted) {
    return { ok: false, error: "צריך לאשר את תנאי ההשתתפות לפני שממשיכים." };
  }

  if (termsVersion !== "2026-07-v1" || !termsAcceptedAt) {
    return { ok: false, error: "אישור תנאי ההשתתפות לא נשמר בצורה תקינה. נסו לאשר שוב." };
  }

  if (isMinor && !guardianConsent) {
    return { ok: false, error: "נדרש אישור הורה או אפוטרופוס להשתתפות קטין." };
  }

  if (isMinor && (!guardianName || !isValidIsraeliMobile(guardianPhone))) {
    return { ok: false, error: "צריך למלא שם וטלפון תקין של הורה או אפוטרופוס." };
  }

  const requestedIds = Array.isArray(input.selectedEventIds) ? input.selectedEventIds.map(String) : [];
  const selectionMode = String(ticket.selectionMode) as CheckoutTicket["selectionMode"];
  const selectedEventIds =
    selectionMode === "opening" || selectionMode === "fixed" || selectionMode === "all"
      ? getDefaultSelectedEventIds(ticket)
      : requestedIds;
  const uniqueIds = Array.from(new Set(selectedEventIds));
  const validEvents = checkoutConfig.events.filter((event) => uniqueIds.includes(event.id));

  if (uniqueIds.length !== selectedEventIds.length || validEvents.length !== ticket.requiredEventCount) {
    return {
      ok: false,
      error: ticket.requiredEventCount === 1 ? "צריך לבחור אירוע אחד תקין." : `צריך לבחור בדיוק ${ticket.requiredEventCount} אירועים תקינים.`
    };
  }

  if (selectionMode === "opening" && uniqueIds[0] !== getDefaultSelectedEventIds(ticket)[0]) {
    return { ok: false, error: "כרטיס הפתיחה משויך רק לאירוע הפתיחה." };
  }

  if (selectionMode === "fixed" && uniqueIds.join(",") !== getDefaultSelectedEventIds(ticket).join(",")) {
    return { ok: false, error: "הכרטיס הזה משויך לאירוע קבוע בלבד." };
  }

  return {
    ok: true,
    ticket,
    selectedEventIds: uniqueIds,
    selectedEvents: validEvents.map((event) => ({
      id: event.id,
      name: event.name,
      venue: event.venue,
      city: event.city,
      date: event.date
    })),
    customer: {
      fullName,
      phone,
      email,
      dateOfBirth
    },
    compliance: {
      healthDeclarationCompleted,
      requiresMedicalApproval,
      healthDeclarationVersion,
      healthDeclarationAcceptedAt,
      healthDeclarationStatus: medicalReviewStatusIsValid ? "medical-review-required" : "completed",
      healthAnswers,
      termsAccepted,
      termsVersion,
      termsAcceptedAt,
      termsDocumentRead,
      participantName: participantName || fullName,
      participantDateOfBirth: participantDateOfBirth || dateOfBirth,
      isMinor,
      guardianConsent: isMinor ? guardianConsent : false,
      guardianName: isMinor ? guardianName : undefined,
      guardianPhone: isMinor ? guardianPhone : undefined,
      approverRole: isMinor ? "guardian" : approverRole,
      photoConsent
    },
    sourcePage: typeof input.sourcePage === "string" ? input.sourcePage : undefined,
    ctaId: ticket.ctaId,
    utm: input.utm && typeof input.utm === "object" ? (input.utm as Record<string, string>) : {}
  };
}
