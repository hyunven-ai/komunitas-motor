import { createClient } from "@/lib/supabase/server";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "./types";
import fs from "fs";
import path from "path";

const LOCAL_BACKUP_PATH = path.join(process.cwd(), "src", "data", "hero-sliders.json");

/**
 * Fetch all hero slides (for admin panel)
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
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
      .eq("title", "__HERO_SLIDERS__")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.content) {
      try {
        const parsed = JSON.parse(data.content) as HeroSlide[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        }
      } catch (parseErr) {
        console.error("Gagal parse data hero sliders dari database:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Supabase query hero sliders gagal, beralih ke fallback file:", err);
  }

  // 2. Fallback to local JSON
  try {
    if (fs.existsSync(LOCAL_BACKUP_PATH)) {
      const fileData = fs.readFileSync(LOCAL_BACKUP_PATH, "utf-8");
      const parsed = JSON.parse(fileData) as HeroSlide[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      }
    }
  } catch (fileErr) {
    console.warn("Gagal membaca file lokal hero-sliders.json:", fileErr);
  }

  // 3. Fallback to hardcoded defaults
  return DEFAULT_HERO_SLIDES;
}

/**
 * Fetch only active hero slides (for public frontend)
 */
export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  const all = await getHeroSlides();
  const active = all.filter((s) => s.isActive !== false);
  return active.length > 0 ? active : DEFAULT_HERO_SLIDES;
}
