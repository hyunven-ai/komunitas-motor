"use server";

import { createClient } from "@/lib/supabase/server";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "./types";
import { getHeroSlides } from "./queries";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const LOCAL_BACKUP_PATH = path.join(process.cwd(), "src", "data", "hero-sliders.json");

/**
 * Persist slider array to both local JSON and Supabase
 */
export async function saveSlidersAction(
  slides: HeroSlide[]
): Promise<{ success: boolean; message: string }> {
  try {
    const serialized = JSON.stringify(slides, null, 2);

    // 1. Save to local JSON backup
    try {
      const dir = path.dirname(LOCAL_BACKUP_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_BACKUP_PATH, serialized, "utf-8");
    } catch (fsErr) {
      console.warn("Gagal menulis cadangan lokal hero-sliders.json:", fsErr);
    }

    // 2. Save to Supabase (announcements table key __HERO_SLIDERS__)
    try {
      let supabase;
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        supabase = createAdminClient();
      } else {
        supabase = await createClient();
      }

      const { data: existing } = await supabase
        .from("announcements")
        .select("id")
        .eq("title", "__HERO_SLIDERS__")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("announcements")
          .update({
            content: serialized,
          })
          .eq("id", existing.id);
      } else {
        // Need an author_id
        const { data: firstProfile } = await supabase
          .from("profiles")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (firstProfile?.id) {
          await supabase.from("announcements").insert({
            title: "__HERO_SLIDERS__",
            content: serialized,
            priority: "normal",
            author_id: firstProfile.id,
          });
        }
      }
    } catch (dbErr) {
      console.warn("Gagal menyimpan ke Supabase, cadangan lokal tetap aktif:", dbErr);
    }

    // Revalidate public homepage and admin page
    revalidatePath("/");
    revalidatePath("/admin/sliders");

    return { success: true, message: "Pengaturan slider berhasil disimpan!" };
  } catch (error) {
    console.error("Error saveSlidersAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan slider.",
    };
  }
}

/**
 * Add a new slide
 */
export async function addSlideAction(
  slideData: Omit<HeroSlide, "id" | "orderIndex">
): Promise<{ success: boolean; message: string; slide?: HeroSlide }> {
  try {
    const current = await getHeroSlides();
    const newSlide: HeroSlide = {
      ...slideData,
      id: `slide-${Date.now()}`,
      orderIndex: current.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...current, newSlide];
    const res = await saveSlidersAction(updated);
    if (!res.success) return res;

    return { success: true, message: "Slide baru berhasil ditambahkan!", slide: newSlide };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menambahkan slide baru.",
    };
  }
}

/**
 * Update an existing slide
 */
export async function updateSlideAction(
  id: string,
  slideData: Partial<HeroSlide>
): Promise<{ success: boolean; message: string }> {
  try {
    const current = await getHeroSlides();
    const index = current.findIndex((s) => s.id === id);
    if (index === -1) {
      return { success: false, message: "Slide tidak ditemukan." };
    }

    current[index] = {
      ...current[index],
      ...slideData,
      updatedAt: new Date().toISOString(),
    };

    return await saveSlidersAction(current);
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui slide.",
    };
  }
}

/**
 * Delete a slide
 */
export async function deleteSlideAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const current = await getHeroSlides();
    const filtered = current.filter((s) => s.id !== id);

    if (filtered.length === 0) {
      return {
        success: false,
        message: "Minimal harus ada 1 slide aktif untuk carousel hero.",
      };
    }

    // Re-index remaining slides
    const reindexed = filtered.map((s, idx) => ({ ...s, orderIndex: idx }));
    return await saveSlidersAction(reindexed);
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal menghapus slide.",
    };
  }
}

/**
 * Toggle slide active status
 */
export async function toggleSlideActiveAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  return await updateSlideAction(id, { isActive });
}

/**
 * Reorder slides by moving up or down
 */
export async function moveSlideAction(
  id: string,
  direction: "up" | "down"
): Promise<{ success: boolean; message: string }> {
  try {
    const current = await getHeroSlides();
    const index = current.findIndex((s) => s.id === id);
    if (index === -1) return { success: false, message: "Slide tidak ditemukan." };

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) {
      return { success: false, message: "Urutan sudah di batas maksimal." };
    }

    // Swap
    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;

    // Normalize orderIndex
    const normalized = current.map((s, idx) => ({ ...s, orderIndex: idx }));
    return await saveSlidersAction(normalized);
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal mengubah urutan slide.",
    };
  }
}

/**
 * Reset slides to system defaults
 */
export async function resetSlidersToDefaultAction(): Promise<{
  success: boolean;
  message: string;
}> {
  return await saveSlidersAction(DEFAULT_HERO_SLIDES);
}
