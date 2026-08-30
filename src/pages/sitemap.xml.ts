import type { APIRoute } from "astro";

// ponytail: one page, so a literal sitemap. Swap in @astrojs/sitemap when there are more.
export const GET: APIRoute = ({ site }) =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${new URL("/", site).href}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
