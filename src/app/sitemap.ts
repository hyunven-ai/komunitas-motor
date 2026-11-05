import { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/lib/seo/config";
import { fetchEventsList } from "@/features/events/queries";
import { fetchNewsArticlesList } from "@/features/cms/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SEO_CONFIG.canonicalBase;
  const now = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/committee`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/partners`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/join`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Dynamic Event routes
  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const events = await fetchEventsList();
    eventRoutes = events
      .filter((e) => e.status === "published" && e.slug)
      .map((event) => ({
        url: `${base}/events/${event.slug}`,
        lastModified: event.created_at ? new Date(event.created_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (err) {
    console.warn("[sitemap] Failed to fetch events for sitemap:", err);
  }

  // Dynamic News routes
  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await fetchNewsArticlesList("published");
    newsRoutes = articles
      .filter((a) => a.slug)
      .map((article) => ({
        url: `${base}/news/${article.slug}`,
        lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      }));
  } catch (err) {
    console.warn("[sitemap] Failed to fetch articles for sitemap:", err);
  }

  return [...staticRoutes, ...eventRoutes, ...newsRoutes];
}
