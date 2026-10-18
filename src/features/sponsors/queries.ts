import { createClient } from "@/lib/supabase/server";
import { Sponsor, SponsorInquiry, SponsorTier } from "./types";
import fs from "fs";
import path from "path";

const SPONSORS_FILE_PATH = path.join(process.cwd(), "src", "data", "sponsors.json");
const INQUIRIES_FILE_PATH = path.join(process.cwd(), "src", "data", "sponsor-inquiries.json");

/**
 * Fetch all sponsors (for admin panel)
 */
export async function getSponsors(): Promise<Sponsor[]> {
  // 1. Try Supabase key/value store
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
      .eq("title", "__SPONSORS_DATA__")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.content) {
      try {
        const parsed = JSON.parse(data.content) as Sponsor[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      } catch (parseErr) {
        console.error("Gagal parse data sponsors dari database:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Supabase query sponsors gagal, beralih ke fallback file:", err);
  }

  // 2. Fallback to local JSON
  try {
    if (fs.existsSync(SPONSORS_FILE_PATH)) {
      const fileData = fs.readFileSync(SPONSORS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData) as Sponsor[];
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }
  } catch (fileErr) {
    console.warn("Gagal membaca file lokal sponsors.json:", fileErr);
  }

  return [];
}

/**
 * Fetch active sponsors that have not expired (for public frontend)
 */
export async function getActiveSponsors(): Promise<Sponsor[]> {
  const all = await getSponsors();
  const now = new Date();

  return all
    .filter((s) => {
      if (s.status !== "active") return false;
      if (s.endDate) {
        const end = new Date(s.endDate);
        if (end < now) return false;
      }
      return true;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Fetch Main Sponsors for Home Page Layer 1 (max 6)
 */
export async function getMainSponsors(): Promise<Sponsor[]> {
  const active = await getActiveSponsors();
  return active.filter((s) => s.tier === "main").slice(0, 6);
}

/**
 * Fetch sponsors for a specific event (Layer 2)
 */
export async function getEventSponsors(eventId: string): Promise<Sponsor[]> {
  const active = await getActiveSponsors();
  return active.filter(
    (s) =>
      s.tier === "event" ||
      (Array.isArray(s.assignedEventIds) && s.assignedEventIds.includes(eventId))
  );
}

/**
 * Fetch all sponsor inquiries (for admin panel)
 */
export async function getSponsorInquiries(): Promise<SponsorInquiry[]> {
  // 1. Try Supabase
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
      .eq("title", "__SPONSOR_INQUIRIES__")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.content) {
      try {
        const parsed = JSON.parse(data.content) as SponsorInquiry[];
        if (Array.isArray(parsed)) {
          return parsed.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      } catch (parseErr) {
        console.error("Gagal parse data sponsor inquiries dari database:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Supabase query sponsor inquiries gagal, fallback ke file:", err);
  }

  // 2. Fallback to local JSON
  try {
    if (fs.existsSync(INQUIRIES_FILE_PATH)) {
      const fileData = fs.readFileSync(INQUIRIES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData) as SponsorInquiry[];
      if (Array.isArray(parsed)) {
        return parsed.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }
  } catch (fileErr) {
    console.warn("Gagal membaca file lokal sponsor-inquiries.json:", fileErr);
  }

  return [];
}
