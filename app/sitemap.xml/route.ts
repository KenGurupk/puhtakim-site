const siteUrl = "https://pushtakim.co.il";

const routes = [
  { path: "", changeFrequency: "weekly", priority: "1.0" },
  { path: "/community", changeFrequency: "monthly", priority: "0.8" },
  { path: "/events", changeFrequency: "monthly", priority: "0.8" },
  { path: "/workshops", changeFrequency: "monthly", priority: "0.8" },
  { path: "/shows", changeFrequency: "monthly", priority: "0.8" },
  { path: "/productions", changeFrequency: "monthly", priority: "0.8" },
  { path: "/store", changeFrequency: "monthly", priority: "0.8" },
  { path: "/guides", changeFrequency: "monthly", priority: "0.8" },
  { path: "/contact", changeFrequency: "monthly", priority: "0.8" }
];

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const lastModified = new Date().toISOString();
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${route.path}`)}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate"
    }
  });
}
