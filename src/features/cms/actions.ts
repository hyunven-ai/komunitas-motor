"use server";

import { createClient } from "@/lib/supabase/server";
import {
  newsArticleSchema,
  type NewsArticleInput,
  galleryAlbumSchema,
  type GalleryAlbumInput,
} from "./schemas";

export interface CmsActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Admin creates or publishes a new news article
 */
export async function createNewsArticleAction(
  data: NewsArticleInput
): Promise<CmsActionResult<{ articleId: string }>> {
  const validation = newsArticleSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data artikel tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: "Artikel berita berhasil disimpan dan dipublikasikan!",
      data: { articleId: `art_${Date.now()}` },
    };
  }

  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const { data: userAuth } = await supabase.auth.getUser();
    let authorId = userAuth?.user?.id;
    if (!authorId) {
      const { data: firstUser } = await supabase.from("users").select("id").limit(1).maybeSingle();
      authorId = firstUser?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";
    }

    const finalContent = `<!--CATEGORY:${validation.data.category}-->\n<!--AUTHOR:${validation.data.authorName}-->\n${validation.data.content}`;

    const { data: inserted, error } = await supabase
      .from("news_articles")
      .insert({
        title: validation.data.title,
        slug: validation.data.slug,
        summary: validation.data.summary,
        content: finalContent,
        cover_image_url: validation.data.coverImageUrl,
        status: validation.data.status,
        published_at: validation.data.status === "published" ? new Date().toISOString() : null,
        author_id: authorId,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Artikel berita berhasil disimpan!",
      data: { articleId: inserted.id },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, message: msg };
  }
}

/**
 * Update an existing news article
 */
export async function updateNewsArticleAction(
  articleId: string,
  data: NewsArticleInput
): Promise<CmsActionResult<{ articleId: string }>> {
  const validation = newsArticleSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data artikel tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const finalContent = `<!--CATEGORY:${validation.data.category}-->\n<!--AUTHOR:${validation.data.authorName}-->\n${validation.data.content}`;

    const { error } = await supabase
      .from("news_articles")
      .update({
        title: validation.data.title,
        slug: validation.data.slug,
        summary: validation.data.summary,
        content: finalContent,
        cover_image_url: validation.data.coverImageUrl,
        status: validation.data.status,
        published_at: validation.data.status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Perubahan artikel berhasil disimpan!",
      data: { articleId },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Toggle publish status of article
 */
export async function updateNewsArticleStatusAction(
  articleId: string,
  newStatus: "draft" | "published"
): Promise<CmsActionResult> {
  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const { error } = await supabase
      .from("news_articles")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: `Status artikel diubah menjadi ${newStatus.toUpperCase()}.` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Delete a news article
 */
export async function deleteNewsArticleAction(articleId: string): Promise<CmsActionResult> {
  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const { error } = await supabase.from("news_articles").delete().eq("id", articleId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Artikel berhasil dihapus." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Admin creates a new gallery album
 */
export async function createGalleryAlbumAction(
  data: GalleryAlbumInput
): Promise<CmsActionResult<{ albumId: string }>> {
  const validation = galleryAlbumSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data album galeri tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: "Album dokumentasi baru berhasil diterbitkan ke galeri!",
      data: { albumId: `alb_${Date.now()}` },
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();

    let userId: string | null = userAuth?.user?.id || null;

    if (!userId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Fallback: fetch first available user or admin user
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const serviceSb = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: firstUser } = await serviceSb.from("users").select("id").limit(1).single();
      userId = firstUser?.id || null;
    }

    if (!userId) {
      return { success: false, message: "Akses ditolak: Silakan login sebagai pengurus." };
    }

    // Embed location and category into description: "[Location] Description\n<!--CATEGORY:category-->"
    const cat = validation.data.category || "Touring Resmi";
    const loc = validation.data.location ? `[${validation.data.location}] ` : "";
    const finalDescription = `${loc}${validation.data.description}\n<!--CATEGORY:${cat}-->`;

    const payload = {
      title: validation.data.title,
      slug: validation.data.slug,
      description: finalDescription,
      cover_image_url: validation.data.coverImageUrl,
      is_public: validation.data.isPublic,
      created_by: userId,
    };

    let { data: inserted, error } = await supabase
      .from("gallery_albums")
      .insert(payload)
      .select("id")
      .single();

    if (error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const serviceSb = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const res = await serviceSb.from("gallery_albums").insert(payload).select("id").single();
      inserted = res.data;
      error = res.error;
    }

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Album galeri berhasil dibuat dan tersimpan permanen!",
      data: { albumId: inserted?.id || `alb_${Date.now()}` },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, message: msg };
  }
}

/**
 * Delete a gallery album
 */
export async function deleteGalleryAlbumAction(albumId: string): Promise<CmsActionResult> {
  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(albumId);
    let targetId = albumId;

    if (!isUUID) {
      let slugTarget = albumId;
      if (albumId === "alb-01") slugTarget = "ekspedisi-dieng-plateau-2026";
      else if (albumId === "alb-02") slugTarget = "jalur-kemenyan-karang-hawu";
      else if (albumId === "alb-03") slugTarget = "touring-lintas-flores-kelimutu";

      const { data: matched } = await supabase
        .from("gallery_albums")
        .select("id")
        .or(`slug.eq.${slugTarget},id.eq.${albumId}`)
        .maybeSingle();

      if (matched?.id) {
        targetId = matched.id;
      }
    }

    // 1. Delete associated media
    await supabase.from("gallery_media").delete().eq("album_id", targetId);

    // 2. Delete album from database
    const { error } = await supabase.from("gallery_albums").delete().eq("id", targetId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Album dokumentasi berhasil dihapus." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus album";
    return { success: false, message: msg };
  }
}
