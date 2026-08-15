import { checkoutConfig, type CheckoutEvent, type CheckoutTicketType } from "@/lib/checkout-config";

export type CheckoutIntentCustomer = {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth?: string;
};

export type CheckoutCompliance = {
  healthDeclarationCompleted?: boolean;
  requiresMedicalApproval?: boolean;
  healthDeclarationVersion?: string;
  healthDeclarationAcceptedAt?: string;
  healthDeclarationStatus?: "completed" | "medical-review-required" | "incomplete";
  healthAnswers?: Record<string, "yes" | "no">;
  termsAccepted?: boolean;
  termsVersion?: string;
  termsAcceptedAt?: string;
  termsDocumentRead?: boolean;
  participantName?: string;
  participantDateOfBirth?: string;
  isMinor?: boolean;
  guardianConsent?: boolean;
  guardianName?: string;
  guardianPhone?: string;
  approverRole?: "participant" | "guardian";
  photoConsent?: "approved" | "declined" | "not_selected";
};

export type CheckoutIntent = CheckoutIntentCustomer & {
  checkoutReference: string;
  createdAt: string;
  updatedAt?: string;
  ticketType: CheckoutTicketType;
  ticketName: string;
  price: number;
  selectedEventIds: string[];
  selectedEvents: Array<Pick<CheckoutEvent, "id" | "name" | "venue" | "city" | "date">>;
  status: "pending_payment" | "pending_cash" | "paid" | "failed" | "cancelled";
  paymentProvider: "grow" | "cash";
  paymentMethod?: "Grow" | "Cash";
  checkinFormCompleted?: boolean;
  registrationSource?: "Website Purchase" | "Manual Check-in" | "Cash / Walk-in" | "Missing Forms Completion";
  notes?: string;
  growTransactionId?: string;
  growToken?: string;
  growPaymentLinkId?: string;
  growPaymentAmount?: number;
  growPaymentStatus?: string;
  paymentVerifiedAt?: string;
  paymentMatchMethod?: string;
  inventoryHoldExpiresAt?: string;
  compliance?: CheckoutCompliance;
  sourcePage?: string;
  ctaId?: string;
  utm: Record<string, string>;
};

export type CheckoutIntentInput = Omit<CheckoutIntent, "checkoutReference" | "createdAt" | "status" | "paymentProvider">;

export interface CheckoutIntentService {
  save(input: CheckoutIntentInput): Promise<CheckoutIntent>;
  getLatest(): CheckoutIntent | null;
  getAll(): CheckoutIntent[];
  rememberLatest(intent: CheckoutIntent): void;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function sanitizeLocalCheckoutData<T extends CheckoutIntentInput | CheckoutIntent>(input: T): T {
  if (!input.compliance?.healthAnswers) {
    return input;
  }

  return {
    ...input,
    compliance: {
      ...input.compliance,
      healthAnswers: undefined
    }
  };
}

export function createCheckoutReference() {
  const bytes = new Uint8Array(4);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return `PT-2026-${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

export function getUtmParams(search = typeof window !== "undefined" ? window.location.search : "") {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
    }
  });

  return utm;
}

class LocalStorageCheckoutIntentService implements CheckoutIntentService {
  async save(input: CheckoutIntentInput) {
    const response = await fetch("/api/checkout-intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    const payload = (await response.json().catch(() => null)) as { intent?: CheckoutIntent; error?: string } | null;

    if (!response.ok || !payload?.intent) {
      this.saveDraftBackup(input);
      throw new Error(payload?.error ?? "Failed to save checkout intent");
    }

    this.rememberLatest(payload.intent);
    return payload.intent;
  }

  private saveDraftBackup(input: CheckoutIntentInput) {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(`${checkoutConfig.latestIntentKey}.draft`, JSON.stringify(sanitizeLocalCheckoutData(input)));
    } catch {
      // UX backup only. The server remains the source of truth.
    }
  }

  rememberLatest(intent: CheckoutIntent) {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(checkoutConfig.latestIntentKey, JSON.stringify(sanitizeLocalCheckoutData(intent)));
    } catch {
      // The central database remains the source of truth.
    }
  }

  saveLocalOnly(input: CheckoutIntentInput) {
    return new Promise<CheckoutIntent>((resolve, reject) => {
      try {
        const intent: CheckoutIntent = {
          ...input,
          checkoutReference: createCheckoutReference(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "pending_payment",
          paymentProvider: "grow"
        };

        const existingRaw = window.localStorage.getItem(checkoutConfig.storageKey);
        const existing = existingRaw ? (JSON.parse(existingRaw) as CheckoutIntent[]) : [];
        const next = [intent, ...existing].slice(0, 50);

        window.localStorage.setItem(checkoutConfig.storageKey, JSON.stringify(next.map(sanitizeLocalCheckoutData)));
        window.localStorage.setItem(checkoutConfig.latestIntentKey, JSON.stringify(sanitizeLocalCheckoutData(intent)));
        resolve(intent);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to save checkout intent"));
      }
    });
  }

  getLatest() {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(checkoutConfig.latestIntentKey);
      return raw ? (JSON.parse(raw) as CheckoutIntent) : null;
    } catch {
      return null;
    }
  }

  getAll() {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(checkoutConfig.storageKey);
      const intents = raw ? (JSON.parse(raw) as CheckoutIntent[]) : [];
      return Array.isArray(intents) ? intents : [];
    } catch {
      return [];
    }
  }
}

export const checkoutIntentService: CheckoutIntentService = new LocalStorageCheckoutIntentService();

export function trackCheckoutEvent(
  eventName: "ticket_modal_open" | "ticket_event_selected" | "ticket_checkout_intent_saved" | "ticket_checkout_click",
  payload: {
    ticket_type?: string;
    price?: number;
    selected_event_ids?: string[];
    checkout_reference?: string;
  }
) {
  if (typeof window === "undefined") {
    return;
  }

  const maybeWindow = window as typeof window & {
    dataLayer?: unknown[];
    gtag?: (event: "event", name: string, data: Record<string, unknown>) => void;
  };

  if (typeof maybeWindow.gtag === "function") {
    maybeWindow.gtag("event", eventName, payload);
  } else if (Array.isArray(maybeWindow.dataLayer)) {
    maybeWindow.dataLayer.push({ event: eventName, ...payload });
  }
}
