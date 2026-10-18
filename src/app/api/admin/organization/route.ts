import { NextRequest, NextResponse } from "next/server";
import { getOrganizationProfile } from "@/features/organization/queries";
import { saveOrganizationProfileAction } from "@/features/organization/actions";
import { OrganizationProfile } from "@/features/organization/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getOrganizationProfile();
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/organization error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memuat profil organisasi.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as OrganizationProfile;
    if (!body || !body.visionText) {
      return NextResponse.json(
        { success: false, message: "Data profil organisasi tidak valid." },
        { status: 400 }
      );
    }

    const result = await saveOrganizationProfileAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error("PUT /api/admin/organization error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menyimpan perubahan profil organisasi.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
