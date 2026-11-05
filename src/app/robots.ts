import { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SEO_CONFIG.canonicalBase;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/member",
          "/member/*",
          "/api/*",
          "/verify/*",
        ],
      },
      {
        userAgent: ["Googlebot", "Googlebot-Image", "Bingbot"],
        allow: ["/", "/events", "/news", "/gallery", "/about"],
        disallow: ["/admin/*", "/member/*", "/api/*"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

