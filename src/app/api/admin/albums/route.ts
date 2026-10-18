import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchGalleryAlbumsList,
  DEFAULT_ALBUMS,
  type AlbumPhotoItem,
  type GalleryAlbumItem as AdminAlbumItem,
} from "@/features/gallery/queries";
import { deleteGalleryAlbumAction } from "@/features/cms/actions";

export const dynamic = "force-dynamic";

export type { AlbumPhotoItem, AdminAlbumItem };

export async function GET() {
  try {
    const albums = await fetchGalleryAlbumsList();
    return NextResponse.json({
      success: true,
      data: albums,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/albums error:", err);
    return NextResponse.json({
      success: true,
      data: DEFAULT_ALBUMS,
    });
  }
}

/**
 * PUT /api/admin/albums: Add photos to an album or update album metadata
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { albumSlug, albumId, action, photoUrls, photos: newPhotos } = body;

    if (!albumSlug && !albumId) {
      return NextResponse.json(
        { success: false, message: "Slug atau ID album wajib diberikan." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // ---------------------------------------------------------
    // ACTION: EDIT ALBUM METADATA
    // ---------------------------------------------------------
    if (action === "edit_album") {
      const {
        title,
        slug,
        newSlug,
        category,
        location,
        description,
        coverImageUrl,
        isPublic,
      } = body;

      // Find existing album row by id or slug
      let query = supabase.from("gallery_albums").select("*");
      if (albumId && albumId.length > 20) {
        query = query.eq("id", albumId);
      } else {
        query = query.eq("slug", albumSlug);
      }
      const { data: albumRow } = await query.maybeSingle();

      let existingPhotos: AlbumPhotoItem[] = [];

      if (!albumRow) {
        // If not found in database, check if it's one of the DEFAULT_ALBUMS to persist it
        const defaultAlb = DEFAULT_ALBUMS.find(
          (d) => d.slug === albumSlug || d.id === albumId
        );
        if (defaultAlb) {
          existingPhotos = defaultAlb.photos || [];
        }

        // Get a valid userId
        const { data: userAuth } = await supabase.auth.getUser();
        let userId: string | null = userAuth?.user?.id || null;
        if (!userId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { createClient: createServiceClient } = await import("@supabase/supabase-js");
          const serviceSb = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const { data: firstUser } = await serviceSb.from("users").select("id").limit(1).single();
          userId = firstUser?.id || null;
        }

        const cat = category || defaultAlb?.category || "Touring Resmi";
        const finalDesc = `${location ? `[${location}] ` : ""}${description || ""}\n<!--CATEGORY:${cat}-->\n<!--PHOTOS:${JSON.stringify(existingPhotos)}-->`;

        const newRowPayload = {
          title: title || defaultAlb?.title || "Album Baru",
          slug: newSlug || slug || albumSlug,
          description: finalDesc,
          cover_image_url: coverImageUrl || defaultAlb?.coverImageUrl,
          is_public: isPublic !== undefined ? isPublic : true,
          created_by: userId,
        };

        let { error: insertErr } = await supabase.from("gallery_albums").insert(newRowPayload);
        if (insertErr && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { createClient: createServiceClient } = await import("@supabase/supabase-js");
          const serviceSb = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const res = await serviceSb.from("gallery_albums").insert(newRowPayload);
          insertErr = res.error;
        }

        if (insertErr) {
          return NextResponse.json({ success: false, message: insertErr.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: "Album berhasil diperbarui dan disimpan ke database!",
        });
      }

      // Existing row found:
      let desc = albumRow.description || "";
      let existingCategory = "Touring Resmi";
      const matchCat = desc.match(/<!--CATEGORY:([\s\S]*?)-->/);
      if (matchCat) {
        existingCategory = matchCat[1].trim();
        desc = desc.replace(/<!--CATEGORY:[\s\S]*?-->/, "").trim();
      }

      if (Array.isArray(body.photos)) {
        existingPhotos = body.photos;
      } else {
        const matchPhotos = desc.match(/<!--PHOTOS:([\s\S]*?)-->/);
        if (matchPhotos) {
          try {
            existingPhotos = JSON.parse(matchPhotos[1]);
          } catch {
            // ignore
          }
        }
      }

      const cat = category || existingCategory || "Touring Resmi";
      const finalDesc = `${location ? `[${location}] ` : ""}${description || ""}\n<!--CATEGORY:${cat}-->\n<!--PHOTOS:${JSON.stringify(existingPhotos)}-->`;

      const updatePayload: Record<string, any> = {
        title: title || albumRow.title,
        slug: newSlug || slug || albumRow.slug,
        description: finalDesc,
        cover_image_url: coverImageUrl || albumRow.cover_image_url,
        is_public: isPublic !== undefined ? isPublic : albumRow.is_public,
      };

      let { error: updateErr } = await supabase
        .from("gallery_albums")
        .update(updatePayload)
        .eq("id", albumRow.id);

      if (updateErr && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const serviceSb = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const res = await serviceSb
          .from("gallery_albums")
          .update(updatePayload)
          .eq("id", albumRow.id);
        updateErr = res.error;
      }

      if (updateErr) {
        return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Perubahan album berhasil disimpan!",
      });
    }

    // ---------------------------------------------------------
    // ACTION: ADD PHOTOS TO ALBUM
    // ---------------------------------------------------------
    // Fetch existing album row
    const { data: albumRow, error: fetchErr } = await supabase
      .from("gallery_albums")
      .select("*")
      .eq("slug", albumSlug)
      .single();

    if (fetchErr || !albumRow) {
      return NextResponse.json(
        { success: false, message: "Album tidak ditemukan di database." },
        { status: 404 }
      );
    }

    // Parse existing description and photos
    let desc = albumRow.description || "";
    let existingPhotos: AlbumPhotoItem[] = [];

    const matchPhotos = desc.match(/<!--PHOTOS:([\s\S]*?)-->/);
    if (matchPhotos) {
      try {
        existingPhotos = JSON.parse(matchPhotos[1]);
        desc = desc.replace(/<!--PHOTOS:[\s\S]*?-->/, "").trim();
      } catch {
        // ignore
      }
    }

    // Include cover image if not yet in photos
    if (albumRow.cover_image_url && !existingPhotos.some((p) => p.url === albumRow.cover_image_url)) {
      existingPhotos.unshift({
        url: albumRow.cover_image_url,
        caption: albumRow.title,
      });
    }

    if (action === "remove_photo") {
      const { photoUrl } = body;
      if (photoUrl) {
        existingPhotos = existingPhotos.filter((p) => p.url !== photoUrl);
      }
    } else if (action === "update_photos") {
      if (Array.isArray(body.photos)) {
        existingPhotos = body.photos;
      }
    } else if (action === "add_photos" || Array.isArray(photoUrls) || Array.isArray(newPhotos)) {
      const incomingUrls: string[] = photoUrls || (newPhotos || []).map((p: any) => p.url || p);
      for (const u of incomingUrls) {
        if (u && !existingPhotos.some((p) => p.url === u)) {
          existingPhotos.push({
            url: u,
            caption: albumRow.title,
          });
        }
      }
    }

    // Build updated description with metadata comment
    const updatedDescription = `${desc}\n<!--PHOTOS:${JSON.stringify(existingPhotos)}-->`;

    let { error: updateErr } = await supabase
      .from("gallery_albums")
      .update({ description: updatedDescription })
      .eq("id", albumRow.id);

    // Fallback to service role if session missing
    if (updateErr && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const serviceSb = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const res = await serviceSb
        .from("gallery_albums")
        .update({ description: updatedDescription })
        .eq("id", albumRow.id);
      updateErr = res.error;
    }

    if (updateErr) {
      return NextResponse.json(
        { success: false, message: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${existingPhotos.length} foto berhasil ditautkan ke album.`,
      photoCount: existingPhotos.length,
    });
  } catch (err: unknown) {
    console.error("PUT /api/admin/albums error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/albums: Delete album and associated media
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { albumId, id, slug } = body;
    const target = id || albumId || slug;

    if (!target) {
      return NextResponse.json(
        { success: false, message: "ID atau slug album wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await deleteGalleryAlbumAction(target);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/albums error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menghapus album.",
      },
      { status: 500 }
    );
  }
}
