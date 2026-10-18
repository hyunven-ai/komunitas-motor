import { createClient } from "@/lib/supabase/server";
import { OrganizationProfile, DEFAULT_ORGANIZATION_PROFILE } from "./types";
import fs from "fs";
import path from "path";

const LOCAL_BACKUP_PATH = path.join(process.cwd(), "src", "data", "organization-profile.json");

/**
 * Fetch organization profile from Supabase with fallback to local JSON and defaults
 */
export async function getOrganizationProfile(): Promise<OrganizationProfile> {
  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const { data, error } = await supabase
      .from("announcements")
      .select("content, created_at")
      .eq("title", "__ORGANIZATION_PROFILE__")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.content) {
      try {
        const parsed = JSON.parse(data.content) as Partial<OrganizationProfile>;
        return {
          ...DEFAULT_ORGANIZATION_PROFILE,
          ...parsed,
          updatedAt: (data as unknown as { updated_at?: string }).updated_at || data.created_at,
        };
      } catch (parseErr) {
        console.error("Gagal parse JSON profil organisasi dari database:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Supabase query profil organisasi gagal, beralih ke fallback:", err);
  }

  // Fallback 1: Local JSON file
  try {
    if (fs.existsSync(LOCAL_BACKUP_PATH)) {
      const fileData = fs.readFileSync(LOCAL_BACKUP_PATH, "utf-8");
      const parsed = JSON.parse(fileData) as Partial<OrganizationProfile>;
      return {
        ...DEFAULT_ORGANIZATION_PROFILE,
        ...parsed,
      };
    }
  } catch (fileErr) {
    console.warn("Gagal membaca fallback file lokal profil organisasi:", fileErr);
  }

  // Fallback 2: Default in-memory constant
  return DEFAULT_ORGANIZATION_PROFILE;
}
