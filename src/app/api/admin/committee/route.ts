import { NextRequest, NextResponse } from "next/server";
import { getCommitteePageData } from "@/features/committee/queries";
import { saveCommitteeDataAction } from "@/features/committee/actions";
import { CommitteePageData } from "@/features/committee/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCommitteePageData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/committee error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memuat data pengurus.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as CommitteePageData;
    if (!body || !Array.isArray(body.members)) {
      return NextResponse.json(
        { success: false, message: "Format data pengurus tidak valid." },
        { status: 400 }
      );
    }

    const result = await saveCommitteeDataAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error("PUT /api/admin/committee error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menyimpan perubahan data pengurus.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
