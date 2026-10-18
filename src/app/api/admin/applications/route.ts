import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApplicationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "pending" | "history" | null

    const supabase = createAdminClient();
    let query = supabase
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (scope === "pending") {
      query = query.in("status", ["pending", "revision_requested"]);
    } else if (scope === "history") {
      query = query.in("status", ["approved", "rejected"]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/admin/applications error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data pendaftaran: " + error.message },
        { status: 500 }
      );
    }

    let result = data || [];

    // If history, lookup members table to attach member_number for approved applicants
    if (scope === "history" && result.length > 0) {
      const userIds = result.map((r) => r.user_id).filter(Boolean);
      if (userIds.length > 0) {
        const { data: members } = await supabase
          .from("members")
          .select("user_id, member_number")
          .in("user_id", userIds);

        const memberMap = new Map((members || []).map((m) => [m.user_id, m.member_number]));
        result = result.map((item) => ({
          ...item,
          member_number: item.user_id ? memberMap.get(item.user_id) || null : null,
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/applications catch:", err);
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
    const body = await req.json();
    const { id, status, rejection_reason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status aplikasi wajib diisi." },
        { status: 400 }
      );
    }

    const validStatuses: ApplicationStatus[] = ["pending", "approved", "rejected", "revision_requested"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid." },
        { status: 400 }
      );
    }

    // Jika disetujui, otomatis buat akun user, profil, dan record anggota resmi
    if (status === "approved") {
      const { approveApplicationAndCreateMember } = await import("@/features/members/actions");
      const result = await approveApplicationAndCreateMember(id);
      return NextResponse.json({
        success: true,
        message: `Pendaftaran disetujui! KTA resmi ${result.member?.member_number || ""} telah diterbitkan dan data otomatis masuk ke Database Anggota.`,
        data: result.member,
      });
    }

    const supabase = createAdminClient();
    const updatePayload: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (rejection_reason !== undefined) {
      updatePayload.rejection_reason = rejection_reason;
    }

    const { data, error } = await supabase
      .from("membership_applications")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/admin/applications error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui status pendaftaran: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status pendaftaran berhasil diperbarui.",
      data,
    });
  } catch (err: unknown) {
    console.error("PUT /api/admin/applications catch:", err);
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
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => null);
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID aplikasi wajib disertakan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("membership_applications")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus pendaftaran: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data pendaftaran berhasil dihapus.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}
