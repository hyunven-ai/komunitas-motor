import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GlobalStateProvider } from "@/components/states";
import { getSystemSettings } from "@/features/settings/queries";
import { generateOrganizationSchema } from "@/lib/seo/schema-generator";
import { JsonLd } from "@/components/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswaldDisplay = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0D12",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  const siteUrl = settings.siteUrl || "https://borneobikers.com";
  const siteName = settings.siteName || "Borneo Brotherhood — Motorcycle Touring & Brotherhood Portal";
  const description =
    settings.siteDescription ||
    "Portal resmi manajemen komunitas motor touring Borneo Brotherhood. Info touring, pendaftaran anggota, KTA digital dengan verifikasi QR, dan forum anggota.";
  const favicon = settings.faviconUrl || "/favicon.ico";
  const logo = settings.logoUrl || "/icon.png";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: "%s | Borneo Brotherhood",
    },
    description,
    icons: {
      icon: [{ url: favicon }],
      apple: [{ url: logo }],
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        "id-ID": siteUrl,
        "en-US": `${siteUrl}?lang=en`,
      },
    },
    openGraph: {
      title: siteName,
      description,
      url: siteUrl,
      siteName: "Borneo Brotherhood",
      locale: "id_ID",
      alternateLocale: ["en_US"],
      type: "website",
      images: [
        {
          url: logo.startsWith("http") ? logo : `${siteUrl}${logo.startsWith("/") ? logo : `/${logo}`}`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [logo.startsWith("http") ? logo : `${siteUrl}${logo.startsWith("/") ? logo : `/${logo}`}`],
    },
    verification: settings.googleVerificationToken
      ? { google: settings.googleVerificationToken }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSystemSettings();
  const orgSchema = generateOrganizationSchema({
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    logoUrl: settings.logoUrl,
    address: settings.basecampAddress,
    phone: settings.hotlinePhone,
  });

  return (
    <html
      lang={settings.defaultLocale || "id"}
      className={`${geistSans.variable} ${geistMono.variable} ${oswaldDisplay.variable} h-full antialiased dark`}
    >
      <head>
        <JsonLd data={orgSchema} />
        {/* Google Analytics 4 (GA4) Integration */}
        {settings.gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.gaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-charcoal text-bone selection:bg-muted-gold selection:text-charcoal font-sans overflow-x-hidden">
        <GlobalStateProvider>{children}</GlobalStateProvider>
      </body>
    </html>
  );
}
