import { NextResponse } from "next/server";
import { getSystemSettings } from "@/features/settings/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({
      success: true,
      data: {
        siteName: settings.siteName,
        siteUrl: settings.siteUrl || "https://borneobikers.com",
        logoUrl: settings.logoUrl || "/icon.png",
        faviconUrl: settings.faviconUrl || "/favicon.ico",
        siteDescription: settings.siteDescription,
        siteDescriptionEn: settings.siteDescriptionEn,
        adminWhatsApp: settings.adminWhatsApp,
        hotlinePhone: settings.hotlinePhone,
        basecampAddress: settings.basecampAddress,
        secretariatEmail: settings.secretariatEmail,
        whatsAppGreeting: settings.whatsAppGreeting,
        googleVerificationToken: settings.googleVerificationToken,
        gaMeasurementId: settings.gaMeasurementId,
        latitude: settings.latitude,
        longitude: settings.longitude,
        defaultLocale: settings.defaultLocale || "id",
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memuat pengaturan publik.",
      },
      { status: 500 }
    );
  }
}
