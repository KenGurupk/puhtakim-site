import { siteCopy } from "@/content/site-copy";

export type CheckoutTicketType = "opening" | "beer-sheva-special" | "single" | "triple" | "full";

export type CheckoutEvent = {
  id: string;
  name: string;
  stop: string;
  city: string;
  venue: string;
  date: string;
  time: string;
};

export type CheckoutTicket = {
  type: CheckoutTicketType;
  planId: string;
  name: string;
  price: number;
  priceLabel: string;
  growUrl: string;
  salesClosed?: boolean;
  selectionMode: "opening" | "fixed" | "single" | "triple" | "all";
  fixedEventIds?: readonly string[];
  requiredEventCount: number;
  ctaId: string;
  note?: string;
};

const tourEvents: CheckoutEvent[] = siteCopy.home.tourStops.map((event) => ({
  id: event.id,
  name: `${event.city} / ${event.venue}`,
  stop: event.stop,
  city: event.city,
  venue: event.venue,
  date: event.date,
  time: event.time
}));

const openingEvent = tourEvents[0];
const remainingTourEvents = tourEvents.filter((event) => event.id !== openingEvent?.id);

export const checkoutConfig = {
  paymentProvider: "grow",
  storageKey: "pushtakim.checkoutIntents.v1",
  latestIntentKey: "pushtakim.latestCheckoutIntent.v1",
  events: remainingTourEvents,
  tickets: [
    {
      type: "opening",
      planId: "mabuza-early-bird",
      name: "כרטיס פתיחה מוקדם - סגור",
      price: 100,
      priceLabel: "100₪",
      growUrl: "",
      salesClosed: true,
      selectionMode: "opening",
      requiredEventCount: 1,
      ctaId: "mabuza-early-bird",
      note: "מבצע הפתיחה הסתיים."
    },
    {
      type: "beer-sheva-special",
      planId: "beer-sheva-special",
      name: "כרטיס באר שבע / PK Spot",
      price: 120,
      priceLabel: "120₪",
      growUrl: "https://pay.grow.link/MTAzMDM2~f45480feaafd8e59b5b61157647c4be2-Mzg0MjEyOA",
      selectionMode: "fixed",
      fixedEventIds: ["push-tour-pk-spot"],
      requiredEventCount: 1,
      ctaId: "beer-sheva-special"
    },
    {
      type: "single",
      planId: "calima-single",
      name: "כרטיס ראשון לציון / Calima",
      price: 200,
      priceLabel: "200₪",
      growUrl: "https://pay.grow.link/MTAzMDM2~d4d4ec74c912f0b39e809eb04a0ec5f4-MzY4NTI4MA",
      selectionMode: "fixed",
      fixedEventIds: ["push-tour-calima"],
      requiredEventCount: 1,
      ctaId: "calima-single"
    },
    {
      type: "triple",
      planId: "three-halls",
      name: "כרטיס משולב ל־3 אולמות - סגור",
      price: 450,
      priceLabel: "450₪",
      growUrl: "",
      salesClosed: true,
      selectionMode: "triple",
      requiredEventCount: 3,
      ctaId: "three-halls"
    },
    {
      type: "full",
      planId: "ultimate",
      name: "הכרטיס האולטימטיבי - סגור",
      price: 550,
      priceLabel: "550₪",
      growUrl: "",
      salesClosed: true,
      selectionMode: "all",
      requiredEventCount: 4,
      ctaId: "ultimate"
    }
  ] satisfies CheckoutTicket[]
} as const;

export function getCheckoutTicketByPlanId(planId: string) {
  return checkoutConfig.tickets.find((ticket) => ticket.planId === planId);
}

export function getDefaultSelectedEventIds(ticket: CheckoutTicket) {
  if (ticket.selectionMode === "opening") {
    return openingEvent ? [openingEvent.id] : [];
  }

  if (ticket.selectionMode === "fixed") {
    return [...(ticket.fixedEventIds ?? [])];
  }

  if (ticket.selectionMode === "all") {
    return tourEvents.map((event) => event.id);
  }

  return [];
}

export function getCheckoutEventsByIds(eventIds: readonly string[]) {
  const ids = new Set(eventIds);
  return checkoutConfig.events.filter((event) => ids.has(event.id));
}
