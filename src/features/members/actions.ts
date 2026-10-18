"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function approveApplicationAndCreateMember(
  applicationId: string,
  reviewerId?: string
) {
  const supabase = createAdminClient();

  // 1. Fetch application details
  const { data: app, error: appErr } = await supabase
    .from("membership_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (appErr || !app) {
    throw new Error("Data pendaftaran tidak ditemukan: " + (appErr?.message || ""));
  }

  // 2. Resolve or create user account
  let userId = app.user_id;

  if (!userId) {
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === app.email.toLowerCase()
    );

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const tempPassword = "Bmc" + crypto.randomBytes(4).toString("hex") + "!";
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: app.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: app.full_name,
          phone_number: app.phone_number,
          city: app.city,
        },
      });

      if (createErr || !newUser.user) {
        throw new Error("Gagal membuat akun user untuk pendaftar: " + (createErr?.message || ""));
      }
      userId = newUser.user.id;
    }
  }

  // 3. Upsert Profile
  const { error: profErr } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: app.full_name,
    display_name: app.full_name.split(" ")[0] || app.full_name,
    phone_number: app.phone_number,
    city: app.city,
    emergency_contact_name: app.emergency_contact_name,
    emergency_contact_phone: app.emergency_contact_phone,
    updated_at: new Date().toISOString(),
  });
  if (profErr) {
    console.error("Profile upsert warning:", profErr);
  }

  // 4. Upsert User Role
  const { error: roleErr } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role: "member",
    },
    { onConflict: "user_id, role" }
  );
  if (roleErr) {
    console.error("Role upsert warning:", roleErr);
  }

  // 5. Ensure record in public.members
  const { data: existingMember } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let member = existingMember;

  if (!member) {
    // Generate sequential member number
    const { count } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    const nextSeq = (count || 0) + 1;
    const year = new Date().getFullYear();
    const memberNumber = `BMC-${year}-${String(nextSeq).padStart(4, "0")}`;
    const qrToken = `bmc_tok_${crypto.randomBytes(8).toString("hex")}`;

    const { data: newMember, error: memErr } = await supabase
      .from("members")
      .insert({
        user_id: userId,
        member_number: memberNumber,
        status: "active",
        motorcycle_model: app.motorcycle_model,
        motorcycle_plate: app.motorcycle_plate,
        motorcycle_year: app.motorcycle_year,
        joined_date: new Date().toISOString().slice(0, 10),
        qr_verification_token: qrToken,
      })
      .select()
      .single();

    if (memErr) {
      throw new Error("Gagal membuat record data anggota di database (members): " + memErr.message);
    }
    member = newMember;
  }

  // 6. Update application status
  const { error: updateAppErr } = await supabase
    .from("membership_applications")
    .update({
      user_id: userId,
      status: "approved",
      reviewed_at: new Date().toISOString(),
      ...(reviewerId ? { reviewed_by: reviewerId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateAppErr) {
    console.error("Update application status warning:", updateAppErr);
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin/members");
  revalidatePath("/members");

  return { success: true, member, userId };
}
