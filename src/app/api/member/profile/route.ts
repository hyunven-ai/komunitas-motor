import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function resolveUser(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) return user;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: tokenData } = await supabase.auth.getUser(token);
    if (tokenData?.user) return tokenData.user;
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Get profile from public.profiles
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // 2. Get member record from public.members
    const { data: member } = await adminSupabase
      .from("members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // 3. Fallback to membership_applications if needed
    const { data: app } = await adminSupabase
      .from("membership_applications")
      .select("*")
      .or(`user_id.eq.${user.id},email.ilike.${user.email}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const fullName =
      profile?.full_name ||
      app?.full_name ||
      user.user_metadata?.full_name ||
      "Anggota Brotherhood";

    const displayName =
      profile?.display_name ||
      fullName.split(" ")[0] ||
      "Bro";

    let qrToken = member?.qr_verification_token || "";
    if (member && !qrToken) {
      const crypto = await import("crypto");
      qrToken = `bmc_tok_${crypto.randomBytes(8).toString("hex")}`;
      await adminSupabase
        .from("members")
        .update({ qr_verification_token: qrToken, updated_at: new Date().toISOString() })
        .eq("id", member.id);
    }

    const memberData = {
      id: member?.id || user.id,
      userId: user.id,
      email: user.email || app?.email || "",
      fullName,
      displayName,
      phoneNumber: profile?.phone_number || app?.phone_number || "",
      city: profile?.city || app?.city || "",
      bloodType: profile?.blood_type || "",
      bio: profile?.bio || "",
      avatarUrl: profile?.avatar_url || null,
      emergencyContactName: profile?.emergency_contact_name || app?.emergency_contact_name || "",
      emergencyContactPhone: profile?.emergency_contact_phone || app?.emergency_contact_phone || "",
      memberNumber: member?.member_number || "BMC-MEMBER",
      status: member?.status || "active",
      motorcycleModel: member?.motorcycle_model || app?.motorcycle_model || "",
      motorcyclePlate: member?.motorcycle_plate || app?.motorcycle_plate || "",
      motorcycleYear: member?.motorcycle_year || app?.motorcycle_year || 2024,
      joinedDate: member?.joined_date || (app?.created_at ? app.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
      qrVerificationToken: qrToken,
    };

    return NextResponse.json({
      success: true,
      data: memberData,
    });
  } catch (err: unknown) {
    console.error("GET /api/member/profile catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem internal.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await resolveUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const adminSupabase = createAdminClient();

    // 1. Update Profile
    const { error: profErr } = await adminSupabase.from("profiles").upsert({
      id: user.id,
      full_name: body.fullName,
      display_name: body.displayName,
      phone_number: body.phoneNumber,
      city: body.city,
      blood_type: body.bloodType,
      bio: body.bio,
      emergency_contact_name: body.emergencyContactName,
      emergency_contact_phone: body.emergencyContactPhone,
      updated_at: new Date().toISOString(),
    });

    if (profErr) {
      console.error("PUT /api/member/profile profile upsert error:", profErr);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui profil: " + profErr.message },
        { status: 500 }
      );
    }

    // 2. Update Member Vehicle Info
    if (body.motorcycleModel !== undefined || body.motorcyclePlate !== undefined || body.motorcycleYear !== undefined) {
      const memberUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (body.motorcycleModel !== undefined) memberUpdate.motorcycle_model = body.motorcycleModel;
      if (body.motorcyclePlate !== undefined) memberUpdate.motorcycle_plate = body.motorcyclePlate;
      if (body.motorcycleYear !== undefined) memberUpdate.motorcycle_year = Number(body.motorcycleYear) || undefined;

      await adminSupabase
        .from("members")
        .update(memberUpdate)
        .eq("user_id", user.id);
    }

    // 3. Keep membership_applications in sync
    await adminSupabase
      .from("membership_applications")
      .update({
        full_name: body.fullName,
        phone_number: body.phoneNumber,
        city: body.city,
        motorcycle_model: body.motorcycleModel,
        motorcycle_plate: body.motorcyclePlate,
        motorcycle_year: Number(body.motorcycleYear) || undefined,
        emergency_contact_name: body.emergencyContactName,
        emergency_contact_phone: body.emergencyContactPhone,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      message: "Profil dan data rider berhasil disimpan!",
    });
  } catch (err: unknown) {
    console.error("PUT /api/member/profile catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem internal.",
      },
      { status: 500 }
    );
  }
}
