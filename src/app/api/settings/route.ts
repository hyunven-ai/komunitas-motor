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
        adminWhatsApp: settings.adminWhatsApp,
        hotlinePhone: settings.hotlinePhone,
        basecampAddress: settings.basecampAddress,
        whatsAppGreeting: settings.whatsAppGreeting,
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
