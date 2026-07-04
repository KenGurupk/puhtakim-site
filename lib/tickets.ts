import { siteCopy } from "@/content/site-copy";
import type { EventListing } from "@/types/content";

export type TicketAction = {
  label: string;
  href: string;
  enabled: boolean;
};

export interface TicketProvider {
  getAction(event: EventListing): TicketAction;
}

class StaticTicketProvider implements TicketProvider {
  getAction(event: EventListing): TicketAction {
    if (event.ticketStatus === "sold-out") {
      return { label: siteCopy.shared.ticketActions.soldOut, href: "/contact?topic=waitlist", enabled: false };
    }

    if (event.ticketStatus === "soon") {
      return { label: siteCopy.shared.ticketActions.notifyMe, href: `/contact?topic=${event.id}`, enabled: true };
    }

    return {
      label: siteCopy.shared.ticketActions.join,
      href: event.ticketUrl ?? `/contact?topic=${event.id}`,
      enabled: true
    };
  }
}

const ticketProvider: TicketProvider = new StaticTicketProvider();

export function getTicketAction(event: EventListing): TicketAction {
  return ticketProvider.getAction(event);
}
