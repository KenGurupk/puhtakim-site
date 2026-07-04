import { siteCopy } from "@/content/site-copy";
import type { EventListing, Feature } from "@/types/content";

export const pillars: Feature[] = [...siteCopy.data.pillars];
export const events: EventListing[] = [...siteCopy.data.events];
export const workshops: Feature[] = [...siteCopy.data.workshops];
export const shows: Feature[] = [...siteCopy.data.shows];
export const productionServices: Feature[] = [...siteCopy.data.productionServices];
export const storeItems: Feature[] = [...siteCopy.data.storeItems];
