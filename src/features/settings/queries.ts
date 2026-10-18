import { createClient } from "@/lib/supabase/server";
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "./types";
import fs from "fs";
import path from "path";

const LOCAL_BACKUP_PATH = path.join(process.cwd(), "src", "data", "system-settings.json");

/**
 * Fetch system settings from Supabase with fallback to local JSON and defaults
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  const envAdminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP;
  const baseDefaults: SystemSettings = {
    ...DEFAULT_SYSTEM_SETTINGS,
    ...(envAdminWhatsApp ? { adminWhatsApp: envAdminWhatsApp } : {}),
  };

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
      .eq("title", "__SYSTEM_SETTINGS__")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.content) {
      try {
        const parsed = JSON.parse(data.content) as Partial<SystemSettings>;
        return {
          ...baseDefaults,
          ...parsed,
          updatedAt: (data as unknown as { updated_at?: string }).updated_at || data.created_at,
        };
      } catch (parseErr) {
        console.error("Gagal parse JSON pengaturan sistem dari database:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Supabase query pengaturan sistem gagal, beralih ke fallback:", err);
  }

  // Fallback 1: Local JSON file
  try {
    if (fs.existsSync(LOCAL_BACKUP_PATH)) {
      const fileData = fs.readFileSync(LOCAL_BACKUP_PATH, "utf-8");
      const parsed = JSON.parse(fileData) as Partial<SystemSettings>;
      return {
        ...baseDefaults,
        ...parsed,
      };
    }
  } catch (fileErr) {
    console.warn("Gagal membaca fallback file lokal pengaturan sistem:", fileErr);
  }

  // Fallback 2: Default in-memory constant
  return baseDefaults;
}
