import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, userId, newPassword, action = "set_password" } = body;

    if (!memberId && !userId) {
      return NextResponse.json(
        { success: false, message: "ID anggota atau ID pengguna wajib disertakan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Resolve target member & user_id
    let targetUserId = userId;
    let memberNumber = "";
    let memberName = "";

    if (memberId) {
      const { data: member, error: memErr } = await supabase
        .from("members")
        .select("id, user_id, member_number")
        .eq("id", memberId)
        .single();

      if (memErr || !member) {
        return NextResponse.json(
          { success: false, message: "Data anggota tidak ditemukan." },
          { status: 404 }
        );
      }

      targetUserId = member.user_id;
      memberNumber = member.member_number;

      // Fetch profile name
      if (targetUserId) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", targetUserId)
          .maybeSingle();
        memberName = prof?.full_name || "";
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Pengguna akun auth tidak terhubung dengan anggota ini." },
        { status: 400 }
      );
    }

    // 2. Fetch user's auth info
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(targetUserId);
    if (userErr || !userData.user) {
      return NextResponse.json(
        { success: false, message: "Akun login auth pengguna tidak ditemukan di sistem: " + (userErr?.message || "") },
        { status: 404 }
      );
    }

    const userEmail = userData.user.email;

    if (action === "send_email") {
      if (!userEmail) {
        return NextResponse.json(
          { success: false, message: "Email tidak terdaftar untuk pengguna ini." },
          { status: 400 }
        );
      }

      // Generate password recovery link or send reset email
      const origin = req.nextUrl.origin || "http://localhost:3000";
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${origin}/member`,
      });

      if (resetErr) {
        return NextResponse.json(
          { success: false, message: "Gagal mengirim email reset: " + resetErr.message },
          { status: 500 }
        );
      }

      // Insert audit log
      try {
        await supabase.from("audit_logs").insert({
          action: "RESET_PASSWORD_EMAIL_SENT",
          entity_type: "members",
          entity_id: memberId || targetUserId,
          details: {
            member_number: memberNumber,
            email: userEmail,
            action_type: "send_email_link",
          },
          created_at: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn("Audit log insert warning:", logErr);
      }

      return NextResponse.json({
        success: true,
        message: `Instruksi tautan reset kata sandi berhasil dikirim ke email ${userEmail}.`,
      });
    }

    // action === "set_password"
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Kata sandi baru minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Update user password directly
    const { error: updateErr } = await supabase.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });

    if (updateErr) {
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui kata sandi: " + updateErr.message },
        { status: 500 }
      );
    }

    // Insert audit log
    try {
      await supabase.from("audit_logs").insert({
        action: "RESET_PASSWORD_DIRECT",
        entity_type: "members",
        entity_id: memberId || targetUserId,
        details: {
          member_number: memberNumber,
          member_name: memberName,
          email: userEmail,
          action_type: "set_password_by_admin",
        },
        created_at: new Date().toISOString(),
      });
    } catch (logErr) {
      console.warn("Audit log insert warning:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Kata sandi untuk ${memberName || memberNumber || "anggota"} berhasil diubah!`,
      email: userEmail,
    });
  } catch (err: unknown) {
    console.error("POST /api/admin/members/reset-password error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal sistem.",
      },
      { status: 500 }
    );
  }
}
