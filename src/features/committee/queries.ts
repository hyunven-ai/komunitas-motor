import { createClient } from "@/lib/supabase/server";
import { CommitteePageData, DEFAULT_COMMITTEE_DATA } from "./types";
import fs from "fs";
import path from "path";

const LOCAL_BACKUP_PATH = path.join(process.cwd(), "src", "data", "committee-data.json");

/**
 * Fetch committee page data from Supabase with fallback to local JSON and defaults
 */
export async function getCommitteePageData(): Promise<CommitteePageData> {
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
      .eq("title", "__COMMITTEE_DATA__")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.content) {
      try {
        const parsed = JSON.parse(data.content) as Partial<CommitteePageData>;
        return {
          ...DEFAULT_COMMITTEE_DATA,
          ...parsed,
          members: Array.isArray(parsed.members) ? parsed.members : DEFAULT_COMMITTEE_DATA.members,
          updatedAt: (data as unknown as { updated_at?: string }).updated_at || data.created_at,
        };
      } catch (parseErr) {
        console.error("Gagal parse JSON komite dari database:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Supabase query data komite gagal, beralih ke fallback:", err);
  }

  // Fallback 1: Local JSON file
  try {
    if (fs.existsSync(LOCAL_BACKUP_PATH)) {
      const fileData = fs.readFileSync(LOCAL_BACKUP_PATH, "utf-8");
      const parsed = JSON.parse(fileData) as Partial<CommitteePageData>;
      return {
        ...DEFAULT_COMMITTEE_DATA,
        ...parsed,
        members: Array.isArray(parsed.members) ? parsed.members : DEFAULT_COMMITTEE_DATA.members,
      };
    }
  } catch (fileErr) {
    console.warn("Gagal membaca fallback file lokal data komite:", fileErr);
  }

  // Fallback 2: Default in-memory constant
  return DEFAULT_COMMITTEE_DATA;
}
