import type { MetadataRoute } from "next";
import { slugs } from "@/lib/content";
import { site } from "@/lib/site";
import { db } from "@/lib/db";
import { locales, localePath } from "@/i18n/config";

// Blog posts live in the database; always build the sitemap on request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.blog
    .findMany({ select: { slug: true, date: true }, orderBy: { date: "desc" } })
    .catch(() => []);

  const entry = (path: string, extra: { priority: number; changeFrequency?: "monthly"; lastModified?: string }) => ({
    url: `${site.url}${localePath("en", path)}`,
    ...extra,
    // hreflang alternates for every language version of this page
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${site.url}${localePath(l, path)}`])),
    },
  });

  const entries = [
    ...["/", "/about", "/services", "/blog", "/gallery", "/contact", "/appointment"].map((p) =>
      entry(p, { changeFrequency: "monthly", priority: p === "/" ? 1 : 0.8 })
    ),
    ...slugs.categories.map((slug) => entry(`/services/${slug}`, { priority: 0.9 })),
    ...slugs.services.map((s) => entry(`/services/${s.category}/${s.service}`, { priority: 0.8 })),
    ...posts.map((p) => entry(`/blog/${encodeURIComponent(p.slug)}`, { lastModified: p.date.toISOString(), priority: 0.6 })),
  ];

  // List the Bangla URL as its own entry too, so both versions are crawled.
  const bn = entries.map((e) => ({
    ...e,
    url: e.url.replace(site.url, `${site.url}/bn`).replace(/\/bn\/$/, "/bn"),
  }));

  return [...entries, ...bn];
}
