export type MediaFocalPoint = {
  objectPosition: string;
  fit?: "cover" | "contain";
};

const mediaFocalPoints: Record<string, MediaFocalPoint> = {
  "/drive-assets/shows/shows-action.jpg": { objectPosition: "50% 18%" },
  "/drive-assets/shows/shows-crowd.jpg": { objectPosition: "50% 42%" },
  "/drive-assets/shows/shows-rooftop-air.jpg": { objectPosition: "50% 18%" },
  "/drive-assets/shows/shows-urban-motion.jpg": { objectPosition: "50% 38%" },
  "/images/shows-source.jpg": { objectPosition: "50% 18%" },

  "/drive-assets/store/store-worn-01.jpg": { objectPosition: "50% 28%" },
  "/drive-assets/store/store-cover.jpg": { objectPosition: "50% 38%" },
  "/drive-assets/store/store-worn-02.jpg": { objectPosition: "50% 24%" },
  "/drive-assets/store/store-worn-03.jpg": { objectPosition: "50% 24%" },
  "/drive-assets/store/store-detail.jpg": { objectPosition: "50% 50%" },

  "/drive-assets/curated/production-commercial.jpg": { objectPosition: "50% 36%" },
  "/drive-assets/productions/production-urban.jpg": { objectPosition: "50% 18%" },
  "/drive-assets/productions/production-air.jpg": { objectPosition: "50% 16%" },
  "/drive-assets/productions/production-dome.jpg": { objectPosition: "50% 24%" },
  "/drive-assets/productions/production-color.jpg": { objectPosition: "50% 22%" },

  "/images/photo-why.jpg": { objectPosition: "50% 16%" },
  "/images/photo-community.jpg": { objectPosition: "50% 22%" },
  "/drive-assets/curated/community-group.jpg": { objectPosition: "50% 35%" },
  "/drive-assets/curated/homepage-community.jpg": { objectPosition: "50% 34%" },
  "/drive-assets/curated/homepage-manifesto.jpg": { objectPosition: "50% 58%" },
  "/drive-assets/curated/workshops-session.jpg": { objectPosition: "50% 32%" }
};

export function getMediaFocalPoint(src?: string, fallback = "center center") {
  if (!src) {
    return { objectPosition: fallback, fit: "cover" as const };
  }

  return {
    objectPosition: mediaFocalPoints[src]?.objectPosition ?? fallback,
    fit: mediaFocalPoints[src]?.fit ?? "cover"
  };
}
