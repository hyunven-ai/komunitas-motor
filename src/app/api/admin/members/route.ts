import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Member, MemberStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch all members
    const { data: members, error: memErr } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (memErr) {
      console.error("GET /api/admin/members error:", memErr);
      return NextResponse.json(
        { success: false, message: "Gagal memuat database anggota: " + memErr.message },
        { status: 500 }
      );
    }

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // 2. Fetch profiles for user_ids
    const userIds = members.map((m) => m.user_id).filter(Boolean);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // 3. Also fetch applications to backfill emails if needed
    const { data: apps } = await supabase
      .from("membership_applications")
      .select("user_id, email, full_name, phone_number, city")
      .in("user_id", userIds);

    const appMap = new Map((apps || []).map((a) => [a.user_id, a]));

    // 4. Fetch auth users to get email directly from auth.users
    const authEmailMap = new Map<string, string>();
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      if (authUsers?.users) {
        for (const u of authUsers.users) {
          if (u.id && u.email) {
            authEmailMap.set(u.id, u.email);
          }
        }
      }
    } catch (e) {
      console.warn("Could not list auth users for email map:", e);
    }

    const combined: Member[] = members.map((m) => {
      const prof = profileMap.get(m.user_id);
      const app = appMap.get(m.user_id);
      const email = authEmailMap.get(m.user_id) || app?.email || null;

      return {
        ...m,
        email,
        profile: prof || {
          id: m.user_id,
          full_name: app?.full_name || "Anggota Brotherhood",
          display_name: app?.full_name?.split(" ")[0] || "Anggota",
          phone_number: app?.phone_number || null,
          city: app?.city || null,
          created_at: m.created_at,
          updated_at: m.updated_at,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: combined,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/members catch:", err);
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
    const {
      id,
      status,
      motorcycle_model,
      motorcycle_plate,
      motorcycle_year,
      joined_date,
      full_name,
      display_name,
      phone_number,
      city,
      blood_type,
      email,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID anggota wajib disertakan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch current member to find user_id
    const { data: currentMember, error: findErr } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    if (findErr || !currentMember) {
      return NextResponse.json(
        { success: false, message: "Anggota tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Prepare member update payload
    const memberUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      const validStatuses: MemberStatus[] = ["active", "inactive", "suspended", "honorary"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, message: "Status anggota tidak valid." },
          { status: 400 }
        );
      }
      memberUpdate.status = status;
    }

    if (motorcycle_model !== undefined) memberUpdate.motorcycle_model = motorcycle_model;
    if (motorcycle_plate !== undefined) memberUpdate.motorcycle_plate = motorcycle_plate;
    if (motorcycle_year !== undefined) memberUpdate.motorcycle_year = Number(motorcycle_year);
    if (joined_date !== undefined) memberUpdate.joined_date = joined_date;

    const { data: updatedMember, error: memErr } = await supabase
      .from("members")
      .update(memberUpdate)
      .eq("id", id)
      .select()
      .single();

    if (memErr) {
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui data member: " + memErr.message },
        { status: 500 }
      );
    }

    // 3. Update profile if user_id exists
    if (currentMember.user_id) {
      const profileUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (full_name !== undefined) profileUpdate.full_name = full_name;
      if (display_name !== undefined) profileUpdate.display_name = display_name;
      if (phone_number !== undefined) profileUpdate.phone_number = phone_number;
      if (city !== undefined) profileUpdate.city = city;
      if (blood_type !== undefined) profileUpdate.blood_type = blood_type;

      if (Object.keys(profileUpdate).length > 1) {
        await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", currentMember.user_id);
      }

      // Also keep membership_applications in sync if matched
      if (full_name !== undefined || phone_number !== undefined || city !== undefined) {
        const appUpdate: Record<string, unknown> = {};
        if (full_name !== undefined) appUpdate.full_name = full_name;
        if (phone_number !== undefined) appUpdate.phone_number = phone_number;
        if (city !== undefined) appUpdate.city = city;
        if (motorcycle_model !== undefined) appUpdate.motorcycle_model = motorcycle_model;
        if (motorcycle_plate !== undefined) appUpdate.motorcycle_plate = motorcycle_plate;
        if (motorcycle_year !== undefined) appUpdate.motorcycle_year = Number(motorcycle_year);

        await supabase
          .from("membership_applications")
          .update(appUpdate)
          .eq("user_id", currentMember.user_id);
      }

      if (email !== undefined && email.trim() && currentMember.user_id) {
        try {
          await supabase.auth.admin.updateUserById(currentMember.user_id, {
            email: email.trim(),
            email_confirm: true,
          });
          await supabase
            .from("membership_applications")
            .update({ email: email.trim() })
            .eq("user_id", currentMember.user_id);
        } catch (e) {
          console.warn("Failed to update email in auth:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data anggota berhasil diperbarui.",
      data: updatedMember,
    });
  } catch (err: unknown) {
    console.error("PUT /api/admin/members catch:", err);
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
        { success: false, message: "ID anggota wajib disertakan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Check member
    const { data: member, error: findErr } = await supabase
      .from("members")
      .select("id, user_id, member_number")
      .eq("id", id)
      .maybeSingle();

    if (findErr || !member) {
      return NextResponse.json(
        { success: false, message: "Anggota tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Delete member record
    const { error: memDelErr } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (memDelErr) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus data anggota: " + memDelErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Data anggota ${member.member_number} berhasil dihapus.`,
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
