import { SEO_CONFIG } from "./config";

/**
 * Structured Data (JSON-LD) Generator for Google Knowledge Graph,
 * Rich Snippets, and Google AI Overviews.
 */

export function generateOrganizationSchema(options?: {
  siteName?: string;
  siteUrl?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
}) {
  const base = options?.siteUrl || SEO_CONFIG.canonicalBase;
  const name = options?.siteName || "Borneo Brotherhood Motorcycle Community";
  const logo = options?.logoUrl || `${base}/icon.png`;

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "SportsClub"],
    "@id": `${base}/#organization`,
    name,
    alternateName: ["Borneo Brotherhood", "Borneo Bikers", "Brotherhood Portal"],
    url: base,
    logo: {
      "@type": "ImageObject",
      url: logo,
      caption: "Borneo Brotherhood Emblem",
    },
    image: logo,
    description: SEO_CONFIG.defaultDescription,
    telephone: options?.phone || "+6281299887711",
    email: "sekretariat@borneobikers.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: options?.address || "Jl. Trans Kalimantan No. 88",
      addressLocality: "Pontianak",
      addressRegion: "Kalimantan Barat",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SEO_CONFIG.geo.latitude,
      longitude: SEO_CONFIG.geo.longitude,
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Kalimantan Barat" },
      { "@type": "AdministrativeArea", name: "Kalimantan Timur" },
      { "@type": "AdministrativeArea", name: "Kalimantan Selatan" },
      { "@type": "AdministrativeArea", name: "Kalimantan Tengah" },
      { "@type": "AdministrativeArea", name: "Kalimantan Utara" },
      { "@type": "Country", name: "Indonesia" },
      { "@type": "Country", name: "Malaysia" },
      { "@type": "Country", name: "Brunei" },
    ],
    sameAs: [
      SEO_CONFIG.socialLinks.instagram,
      SEO_CONFIG.socialLinks.youtube,
      SEO_CONFIG.socialLinks.whatsapp,
    ],
  };
}

export function generateEventSchema(event: {
  title: string;
  description: string;
  slug: string;
  startTime: string;
  endTime?: string;
  locationName: string;
  coverImageUrl?: string | null;
  fee?: number;
  capacity?: number;
}) {
  const base = SEO_CONFIG.canonicalBase;
  const eventUrl = `${base}/events/${event.slug}`;
  const imageUrl = event.coverImageUrl || `${base}/icon.png`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${eventUrl}#event`,
    name: event.title,
    description: event.description,
    image: [imageUrl],
    startDate: event.startTime,
    endDate: event.endTime || event.startTime,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.locationName,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.locationName,
        addressRegion: "Kalimantan",
        addressCountry: "ID",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Borneo Brotherhood",
      url: base,
    },
    offers: {
      "@type": "Offer",
      url: eventUrl,
      price: event.fee || 0,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      validFrom: event.startTime,
    },
  };
}

export function generateArticleSchema(article: {
  title: string;
  summary: string;
  slug: string;
  content?: string;
  coverImageUrl?: string | null;
  authorName?: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  const base = SEO_CONFIG.canonicalBase;
  const articleUrl = `${base}/news/${article.slug}`;
  const imageUrl = article.coverImageUrl || `${base}/icon.png`;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl}#article`,
    headline: article.title,
    description: article.summary,
    image: [imageUrl],
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.updatedAt || article.publishedAt || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: article.authorName || "Divisi Humas Borneo Brotherhood",
      jobTitle: "Redaksi Komunitas",
    },
    publisher: {
      "@type": "Organization",
      name: "Borneo Brotherhood",
      logo: {
        "@type": "ImageObject",
        url: `${base}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  const base = SEO_CONFIG.canonicalBase;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

