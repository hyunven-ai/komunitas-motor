import { describe, it, expect } from "vitest";
import { constructMetadata, SEO_CONFIG } from "@/lib/seo/config";
import {
  generateOrganizationSchema,
  generateEventSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schema-generator";
import robots from "@/app/robots";

describe("Technical SEO - Metadata Configuration", () => {
  it("generates correct base metadata targeting borneobikers.com", () => {
    const meta = constructMetadata({
      title: "Komunitas Motor Borneo",
      description: "Portal resmi bikers Kalimantan",
      path: "/tentang-kami",
    });

    expect(meta.title).toBe("Komunitas Motor Borneo");
    expect(meta.description).toBe("Portal resmi bikers Kalimantan");
    expect(meta.metadataBase?.toString()).toContain("borneobikers.com");
    expect(meta.alternates?.canonical).toBe("https://borneobikers.com/tentang-kami");
  });

  it("handles multi-locale OpenGraph with ID (id_ID) and alternate EN (en_US)", () => {
    const metaId = constructMetadata({
      title: "Jelajah Borneo",
      titleEn: "Explore Borneo",
      description: "Ekspedisi lintas batas",
      descriptionEn: "Cross-border expedition",
      path: "/events/jelajah-borneo",
      locale: "id",
    });

    const openGraphId = metaId.openGraph as Record<string, any>;
    expect(openGraphId.locale).toBe("id_ID");
    expect(openGraphId.alternateLocale).toContain("en_US");
    expect(openGraphId.title).toBe("Jelajah Borneo");
  });

  it("handles multi-locale OpenGraph with EN (en_US) and alternate ID (id_ID)", () => {
    const metaEn = constructMetadata({
      title: "Jelajah Borneo",
      titleEn: "Explore Borneo",
      description: "Ekspedisi lintas batas",
      descriptionEn: "Cross-border expedition",
      path: "/events/jelajah-borneo",
      locale: "en",
    });

    const openGraphEn = metaEn.openGraph as Record<string, any>;
    expect(openGraphEn.locale).toBe("en_US");
    expect(openGraphEn.alternateLocale).toContain("id_ID");
    expect(openGraphEn.title).toBe("Explore Borneo");
    expect(openGraphEn.description).toBe("Cross-border expedition");
  });

  it("embeds Kalimantan local SEO geo tags & indexing directives", () => {
    const meta = constructMetadata({
      path: "/kontak",
    });

    const other = meta.other as Record<string, string>;
    expect(other["geo.region"]).toBe("ID-KB");
    expect(other["geo.placename"]).toBe("Pontianak, Kalimantan Barat");
    expect(other["geo.position"]).toBe("-0.0263;109.3425");
    expect(other["ICBM"]).toBe("-0.0263, 109.3425");

    const robotsMeta = meta.robots as Record<string, any>;
    expect(robotsMeta.index).toBe(true);
    expect(robotsMeta.follow).toBe(true);
    expect(robotsMeta.googleBot.index).toBe(true);
  });
});

describe("Structured Data (JSON-LD) for Google AI Overviews & Schema.org", () => {
  it("generates valid Organization and SportsClub schema with Kalimantan coordinates", () => {
    const schema = generateOrganizationSchema({
      siteName: "Borneo Brotherhood Portal",
      siteUrl: "https://borneobikers.com",
      address: "Jl. Ahmad Yani No. 12, Pontianak",
    });

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toContain("Organization");
    expect(schema["@type"]).toContain("SportsClub");
    expect(schema.url).toBe("https://borneobikers.com");
    expect(schema.address.streetAddress).toBe("Jl. Ahmad Yani No. 12, Pontianak");
    expect(schema.geo.latitude).toBeCloseTo(-0.02633, 4);
    expect(schema.geo.longitude).toBeCloseTo(109.3425, 4);
    expect(schema.areaServed.length).toBeGreaterThanOrEqual(5);
  });

  it("generates valid Event schema for touring agenda", () => {
    const eventSchema = generateEventSchema({
      title: "Trans Kalimantan Endurance Ride 2026",
      description: "Touring 1500KM melintasi 3 provinsi pulau Borneo.",
      slug: "trans-kalimantan-2026",
      startTime: "2026-08-17T06:00:00+07:00",
      endTime: "2026-08-20T18:00:00+07:00",
      locationName: "Tugu Khatulistiwa Pontianak",
      fee: 450000,
      capacity: 100,
    });

    expect(eventSchema["@context"]).toBe("https://schema.org");
    expect(eventSchema["@type"]).toBe("Event");
    expect(eventSchema.name).toBe("Trans Kalimantan Endurance Ride 2026");
    expect(eventSchema.startDate).toBe("2026-08-17T06:00:00+07:00");
    expect(eventSchema.offers.price).toBe(450000);
    expect(eventSchema.offers.priceCurrency).toBe("IDR");
    expect(eventSchema.location.name).toBe("Tugu Khatulistiwa Pontianak");
  });

  it("generates valid NewsArticle schema for community articles", () => {
    const articleSchema = generateArticleSchema({
      title: "Tips Persiapan Riding Lintas Borneo Musim Hujan",
      summary: "Panduan teknis dan gear esensial menghadapi aspal basah Borneo.",
      slug: "tips-riding-lintas-borneo",
      authorName: "Divisi Humas Borneo Brotherhood",
      publishedAt: "2026-11-01T10:00:00Z",
    });

    expect(articleSchema["@context"]).toBe("https://schema.org");
    expect(articleSchema["@type"]).toBe("NewsArticle");
    expect(articleSchema.headline).toBe("Tips Persiapan Riding Lintas Borneo Musim Hujan");
    expect(articleSchema.author.name).toBe("Divisi Humas Borneo Brotherhood");
    expect(articleSchema.mainEntityOfPage["@id"]).toBe("https://borneobikers.com/news/tips-riding-lintas-borneo");
  });

  it("generates valid BreadcrumbList schema with sequential positions", () => {
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Beranda", path: "/" },
      { name: "Agenda Touring", path: "/events" },
      { name: "Trans Borneo 2026", path: "/events/trans-borneo-2026" },
    ]);

    expect(breadcrumbSchema["@context"]).toBe("https://schema.org");
    expect(breadcrumbSchema["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbSchema.itemListElement).toHaveLength(3);
    expect(breadcrumbSchema.itemListElement[0].position).toBe(1);
    expect(breadcrumbSchema.itemListElement[0].name).toBe("Beranda");
    expect(breadcrumbSchema.itemListElement[2].position).toBe(3);
    expect(breadcrumbSchema.itemListElement[2].item).toBe("https://borneobikers.com/events/trans-borneo-2026");
  });
});

describe("Technical SEO - Robots Directive", () => {
  it("points robots.txt sitemap to borneobikers.com/sitemap.xml and disallows private admin routes", () => {
    const robotsConfig = robots();
    expect(robotsConfig.sitemap).toBe("https://borneobikers.com/sitemap.xml");

    const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
    expect(rules.userAgent).toBe("*");
    expect(rules.disallow).toContain("/admin/*");
    expect(rules.disallow).toContain("/api/*");
  });
});
