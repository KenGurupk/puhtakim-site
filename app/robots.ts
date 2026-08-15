import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pushtakim.co.il";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/login", "/api/", "/payment-success", "/tickets/thanks"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
