export type SectionMedia = {
  src: string;
  alt: string;
  fit: "cover" | "contain";
  background?: string;
  aspectRatio?: string;
};

export const homeCardMedia: Record<string, SectionMedia | undefined> = {
  "/community": {
    src: "/drive-assets/curated/community-group.jpg",
    alt: "קהילה מתאמנת יחד במרחב פתוח",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  "/events": {
    src: "/images/photo-hero.jpg",
    alt: "רגע גרפי מתוך עולם PushTakim",
    fit: "contain",
    background: "#070707",
    aspectRatio: "9 / 16"
  },
  "/workshops": {
    src: "/drive-assets/curated/workshops-session.jpg",
    alt: "רגע מתוך סשן תנועה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "16 / 9"
  },
  "/shows": {
    src: "/drive-assets/curated/shows-stage.jpg",
    alt: "רגע מתוך הופעה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  "/productions": {
    src: "/images/photo-manifesto.jpg",
    alt: "׳₪׳¨׳•׳™׳§׳˜ ׳׳•׳¨׳‘׳ ׳™ ׳©׳ PushTakim",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  "/store": {
    src: "/drive-assets/curated/store-lifestyle.jpg",
    alt: "ביגוד PushTakim על אתלט",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  "#guides": {
    src: "/drive-assets/guides/guides-action.jpg",
    alt: "אימון תנועה מול הים",
    fit: "contain",
    background: "#070707",
    aspectRatio: "16 / 9"
  },
  "#contact": {
    src: "/drive-assets/contact/contact-action.jpg",
    alt: "רגע תנועה חופשי מול הים",
    fit: "contain",
    background: "#070707",
    aspectRatio: "16 / 9"
  }
};

export const homeFeatureMedia = {
  why: {
    src: "/drive-assets/curated/community-group.jpg",
    alt: "מפגש קהילתי של PushTakim",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 3"
  },
  takeHome: {
    src: "/drive-assets/curated/homepage-community.jpg",
    alt: "רצף תנועה קבוצתי",
    fit: "cover",
    background: "#070707",
    aspectRatio: "16 / 9"
  },
  manifesto: {
    src: "/drive-assets/curated/homepage-manifesto.jpg",
    alt: "PushTakim על מבנה צבעוני",
    fit: "cover",
    background: "#070707",
    aspectRatio: "4 / 5"
  }
} satisfies Record<string, SectionMedia>;

export const pageMedia = {
  community: {
    src: "/drive-assets/curated/community-group.jpg",
    alt: "מפגש קהילתי באימון פתוח",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  events: {
    src: "/drive-assets/curated/events-night.jpg",
    alt: "רגע קהילתי באירוע לילה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  workshops: {
    src: "/images/photo-takehome.jpg",
    alt: "רצף תנועה קבוצתי בסדנה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "16 / 9"
  },
  shows: {
    src: "/drive-assets/shows/shows-crowd.jpg",
    alt: "אתלט בקפיצה מתוך הופעה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "9 / 16"
  },
  productions: {
    src: "/drive-assets/curated/production-commercial.jpg",
    alt: "צילום הפקה עם אקשן ותנועה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  guides: {
    src: "/images/photo-why.jpg",
    alt: "אתלט בתנועה באוויר",
    fit: "contain",
    background: "#070707",
    aspectRatio: "9 / 16"
  },
  contact: {
    src: "/images/photo-community.jpg",
    alt: "רגע אנושי של PushTakim",
    fit: "contain",
    background: "#070707",
    aspectRatio: "9 / 16"
  }
} satisfies Record<string, SectionMedia>;

export const showsGalleryMedia: SectionMedia[] = [
  {
    src: "/drive-assets/shows/shows-photo.jpg",
    alt: "אתלט בהופעה מול קהל",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  {
    src: "/drive-assets/shows/shows-rooftop-air.jpg",
    alt: "אתלט בקפיצה על סט הופעה עירוני",
    fit: "contain",
    background: "#070707",
    aspectRatio: "9 / 16"
  },
  {
    src: "/drive-assets/shows/shows-urban-motion.jpg",
    alt: "תנועת במה אורבנית",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 3"
  }
];

export const productionGalleryMedia: SectionMedia[] = [
  {
    src: "/drive-assets/productions/production-urban.jpg",
    alt: "צילום הפקה אורבני",
    fit: "contain",
    background: "#070707",
    aspectRatio: "9 / 16"
  },
  {
    src: "/drive-assets/productions/production-air.jpg",
    alt: "צילום אקשן מתוך פרויקט הפקה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "9 / 16"
  },
  {
    src: "/drive-assets/productions/production-dome.jpg",
    alt: "רגע תנועה מתוך הפקה",
    fit: "contain",
    background: "#070707",
    aspectRatio: "16 / 9"
  },
  {
    src: "/drive-assets/productions/production-color.jpg",
    alt: "קבוצת PushTakim על מבנה צבעוני",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  }
];

export const eventPosterMedia: SectionMedia[] = [
  {
    src: "/drive-assets/events-posters/mabuza-3-8.jpg",
    alt: "Mabuza 3.8",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  {
    src: "/drive-assets/events-posters/raiz-14-8.jpg",
    alt: "Raiz 14.8",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  {
    src: "/drive-assets/events-posters/pk-spot-16-8.jpg",
    alt: "PK Spot 16.8",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  },
  {
    src: "/drive-assets/events-posters/calima-28-8.jpg",
    alt: "Calima 28.8",
    fit: "contain",
    background: "#070707",
    aspectRatio: "4 / 5"
  }
];
