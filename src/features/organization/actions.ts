"use server";

import { createClient } from "@/lib/supabase/server";
import { OrganizationProfile } from "./types";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const LOCAL_BACKUP_PATH = path.join(process.cwd(), "src", "data", "organization-profile.json");

export async function saveOrganizationProfileAction(
  profileData: OrganizationProfile
): Promise<{ success: boolean; message: string }> {
  try {
    const serialized = JSON.stringify(profileData, null, 2);

    // 1. Save to local JSON backup
    try {
      const dir = path.dirname(LOCAL_BACKUP_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_BACKUP_PATH, serialized, "utf-8");
    } catch (fsErr) {
      console.warn("Gagal menulis cadangan lokal profil organisasi:", fsErr);
    }

    // 2. Save to Supabase (table: announcements)
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from("announcements")
      .select("id")
      .eq("title", "__ORGANIZATION_PROFILE__")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("announcements")
        .update({
          content: serialized,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Gagal update record organisasi di Supabase:", updateError);
        return { success: false, message: updateError.message };
      }
    } else {
      // Find author_id
      const { data: firstProfile } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .maybeSingle();
      const authorId = firstProfile?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";

      const { error: insertError } = await supabase.from("announcements").insert({
        title: "__ORGANIZATION_PROFILE__",
        content: serialized,
        priority: "high",
        author_id: authorId,
      });

      if (insertError) {
        console.error("Gagal insert record organisasi di Supabase:", insertError);
        return { success: false, message: insertError.message };
      }
    }

    revalidatePath("/about");
    revalidatePath("/admin/organization");

    return {
      success: true,
      message: "Visi, Misi, dan SOP Jalanan berhasil disimpan!",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    console.error("Error saveOrganizationProfileAction:", err);
    return { success: false, message: msg };
  }
}
