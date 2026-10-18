import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminSupabase = createAdminClient();

    const { data: rows, error } = await adminSupabase
      .from("announcements")
      .select("id, title, content, priority, created_at")
      .not("title", "like", "\\_\\_%")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/member/announcements error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal memuat pengumuman: " + error.message },
        { status: 500 }
      );
    }

    const announcements = (rows || []).map((row: any) => {
      let text = row.content;
      let division = "Sekretariat Pengurus";
      let badgeColor = "gold";

      try {
        const parsed = JSON.parse(row.content);
        if (parsed && typeof parsed === "object") {
          text = parsed.text || row.content;
          division = parsed.division || division;
          badgeColor = parsed.badgeColor || (row.priority === "urgent" || row.priority === "high" ? "gold" : "emerald");
        }
      } catch {
        // Plain text fallback
        if (row.priority === "high" || row.priority === "urgent") {
          badgeColor = "gold";
        } else {
          badgeColor = "emerald";
        }
      }

      return {
        id: row.id,
        title: row.title,
        content: text,
        division,
        priority: row.priority || "normal",
        badgeColor,
        createdAt: row.created_at,
      };
    });

    const response = NextResponse.json({
      success: true,
      data: announcements,
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (err: unknown) {
    console.error("GET /api/member/announcements catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}
