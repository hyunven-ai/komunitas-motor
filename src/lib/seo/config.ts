/**
 * Core SEO Configuration & Localized Metadata Engine
 * Handles canonical URLs, OpenGraph multi-locale (ID & EN), and Twitter Cards
 */

export const SEO_CONFIG = {
  canonicalBase: "https://borneobikers.com",
  siteName: "Borneo Brotherhood — Motorcycle Touring & Brotherhood Portal",
  defaultTitle: "Borneo Brotherhood — Motorcycle Touring & Brotherhood Portal",
  defaultTitleEn: "Borneo Brotherhood — Premier Motorcycle Touring & Community Portal",
  defaultDescription:
    "Portal resmi komunitas motor touring Borneo Brotherhood. Kalender ekspedisi touring, pendaftaran anggota baru, KTA digital resmi QR verifikasi, dan jejaring bikers se-Borneo.",
  defaultDescriptionEn:
    "Official Borneo Brotherhood motorcycle touring community portal. Expedition calendar, online membership registration, QR-verified digital club card, and Borneo riders network.",
  defaultOgImage: "https://borneobikers.com/icon.png",
  socialLinks: {
    instagram: "https://instagram.com/bb1percentmc_westborneo",
    whatsapp: "https://wa.me/6281299887711",
    youtube: "https://youtube.com/@borneobrotherhood",
  },
  geo: {
    region: "ID-KB",
    placename: "Pontianak, Kalimantan Barat",
    latitude: -0.0263,
    longitude: 109.3425,
  },
  locales: {
    id: "id_ID",
    en: "en_US",
  },
};

export interface LocalizedMetadataParams {
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  locale?: "id" | "en";
}

export function constructMetadata({
  title,
  titleEn,
  description,
  descriptionEn,
  path = "",
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authorName = "Dewan Pengurus Borneo Brotherhood",
  locale = "id",
}: LocalizedMetadataParams = {}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SEO_CONFIG.canonicalBase;
  const canonicalUrl = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImageUrl = image || SEO_CONFIG.defaultOgImage;

  const resolvedTitle =
    locale === "en"
      ? titleEn || title || SEO_CONFIG.defaultTitleEn
      : title || SEO_CONFIG.defaultTitle;

  const resolvedDescription =
    locale === "en"
      ? descriptionEn || description || SEO_CONFIG.defaultDescriptionEn
      : description || SEO_CONFIG.defaultDescription;

  const currentLocale = locale === "en" ? SEO_CONFIG.locales.en : SEO_CONFIG.locales.id;
  const alternateLocale = locale === "en" ? SEO_CONFIG.locales.id : SEO_CONFIG.locales.en;

  return {
    metadataBase: new URL(base),
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "id-ID": canonicalUrl,
        "en-US": `${canonicalUrl}?lang=en`,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      locale: currentLocale,
      alternateLocale: [alternateLocale],
      type,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(type === "article" && authorName ? { authors: [authorName] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImageUrl],
      creator: "@borneobrotherhood",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
    other: {
      "geo.region": SEO_CONFIG.geo.region,
      "geo.placename": SEO_CONFIG.geo.placename,
      "geo.position": `${SEO_CONFIG.geo.latitude};${SEO_CONFIG.geo.longitude}`,
      ICBM: `${SEO_CONFIG.geo.latitude}, ${SEO_CONFIG.geo.longitude}`,
    },
  };
}
