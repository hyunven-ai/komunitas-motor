import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings } from "@/features/settings/queries";
import { saveSystemSettingsAction } from "@/features/settings/actions";
import { SystemSettings } from "@/features/settings/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/settings error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memuat pengaturan sistem.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as SystemSettings;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Format payload pengaturan tidak valid." },
        { status: 400 }
      );
    }

    const result = await saveSystemSettingsAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error("PUT /api/admin/settings error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menyimpan pengaturan sistem.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
