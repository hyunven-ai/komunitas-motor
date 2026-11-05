import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || "").trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Identifier (email atau username) wajib diisi." },
        { status: 400 }
      );
    }

    // 1. If it's already an email, return directly
    if (identifier.includes("@")) {
      return NextResponse.json({
        success: true,
        email: identifier,
      });
    }

    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

    if (isMock) {
      return NextResponse.json({
        success: true,
        email: `${identifier}@brotherhood.local`,
      });
    }

    const supabase = createAdminClient();

    // 2. Query profiles by username or display_name
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .or(`username.ilike.${identifier},display_name.ilike.${identifier}`)
        .limit(1)
        .maybeSingle();

      if (profile?.id) {
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        if (userData?.user?.email) {
          return NextResponse.json({
            success: true,
            email: userData.user.email,
          });
        }
      }
    } catch {
      // profiles column might not exist yet, continue to fallback
    }

    // 3. Query membership_applications by username
    try {
      const { data: application } = await supabase
        .from("membership_applications")
        .select("email, username")
        .ilike("username", identifier)
        .limit(1)
        .maybeSingle();

      if (application?.email) {
        return NextResponse.json({
          success: true,
          email: application.email,
        });
      }
    } catch {
      // continue
    }

    // 4. Query auth.users user_metadata by username
    try {
      const { data: userList } = await supabase.auth.admin.listUsers();
      const matched = userList?.users?.find((u) => {
        const metaUser = u.user_metadata?.username;
        return metaUser && String(metaUser).toLowerCase() === identifier;
      });

      if (matched?.email) {
        return NextResponse.json({
          success: true,
          email: matched.email,
        });
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: false,
        message: `Username "${identifier}" tidak terdaftar. Periksa kembali atau gunakan alamat email Anda.`,
      },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error("POST /api/auth/resolve-identifier error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memeriksa akun.",
      },
      { status: 500 }
    );
  }
}

