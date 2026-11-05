import { NextResponse } from "next/server";
import { SEO_CONFIG } from "@/lib/seo/config";
import { fetchNewsArticlesList } from "@/features/cms/queries";
import { fetchEventsList } from "@/features/events/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SEO_CONFIG.canonicalBase;

  let articles: Array<{
    title: string;
    slug: string;
    summary: string;
    publishedAt?: string;
  }> = [];

  let events: Array<{
    title: string;
    slug: string;
    description: string;
    start_time: string;
  }> = [];

  try {
    articles = await fetchNewsArticlesList("published");
  } catch {
    // ignore
  }

  try {
    const allEvents = await fetchEventsList();
    events = allEvents.filter((e) => e.status === "published");
  } catch {
    // ignore
  }

  const itemsXml = [
    ...articles.map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${base}/news/${a.slug}</link>
      <guid>${base}/news/${a.slug}</guid>
      <description><![CDATA[${a.summary}]]></description>
      <pubDate>${a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`
    ),
    ...events.map(
      (e) => `
    <item>
      <title><![CDATA[Touring: ${e.title}]]></title>
      <link>${base}/events/${e.slug}</link>
      <guid>${base}/events/${e.slug}</guid>
      <description><![CDATA[${e.description}]]></description>
      <pubDate>${e.start_time ? new Date(e.start_time).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`
    ),
  ].join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Borneo Brotherhood — Warta & Agenda Ekspedisi</title>
    <link>${base}</link>
    <description>${SEO_CONFIG.defaultDescription}</description>
    <language>id-ID</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

