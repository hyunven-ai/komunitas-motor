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

    return NextResponse.json({
      success: true,
      data: announcements,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/announcements catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    const body = await req.json();
    const { title, text, division, priority, badgeColor } = body;

    if (!title || !text) {
      return NextResponse.json(
        { success: false, message: "Judul dan isi pengumuman wajib diisi." },
        { status: 400 }
      );
    }

    const payloadContent = JSON.stringify({
      text: text.trim(),
      division: division?.trim() || "Sekretariat Pengurus",
      badgeColor: badgeColor || (priority === "high" || priority === "urgent" ? "gold" : "emerald"),
    });

    const defaultAdminId = "69b1ae80-facc-40e9-9b60-d08cb2152d28";

    const { data: inserted, error: insErr } = await adminSupabase
      .from("announcements")
      .insert({
        title: title.trim(),
        content: payloadContent,
        priority: priority || "normal",
        author_id: defaultAdminId,
      })
      .select("id, title, created_at")
      .single();

    if (insErr) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan pengumuman: " + insErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengumuman berhasil diterbitkan!",
      data: inserted,
    });
  } catch (err: unknown) {
    console.error("POST /api/admin/announcements catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    const body = await req.json();
    const { id, title, text, division, priority, badgeColor } = body;

    if (!id || !title || !text) {
      return NextResponse.json(
        { success: false, message: "ID, judul, dan isi pengumuman wajib diisi." },
        { status: 400 }
      );
    }

    const payloadContent = JSON.stringify({
      text: text.trim(),
      division: division?.trim() || "Sekretariat Pengurus",
      badgeColor: badgeColor || (priority === "high" || priority === "urgent" ? "gold" : "emerald"),
    });

    const { error: updErr } = await adminSupabase
      .from("announcements")
      .update({
        title: title.trim(),
        content: payloadContent,
        priority: priority || "normal",
      })
      .eq("id", id);

    if (updErr) {
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui pengumuman: " + updErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengumuman berhasil diperbarui!",
    });
  } catch (err: unknown) {
    console.error("PUT /api/admin/announcements catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID pengumuman tidak valid." },
        { status: 400 }
      );
    }

    const { error: delErr } = await adminSupabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus pengumuman: " + delErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengumuman berhasil dihapus.",
    });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/announcements catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}
