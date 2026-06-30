export type EventListing = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  type: "event" | "workshop" | "show" | "production";
  description: string;
  ticketStatus: "available" | "soon" | "sold-out";
  ticketUrl?: string;
};

export type Feature = {
  title: string;
  description: string;
  meta?: string;
};
