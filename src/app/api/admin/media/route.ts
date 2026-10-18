import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";
import {
  listR2Objects,
  deleteFromR2,
  getR2PublicUrl,
} from "@/lib/storage/r2";

export const dynamic = "force-dynamic";

export interface MediaItemResponse {
  id: string;
  key: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
  storage: "cloudflare-r2" | "local-storage";
}

export async function GET() {
  try {
    const items: MediaItemResponse[] = [];

    const hasRealR2Config =
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID.includes("your-r2") &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY.includes("your-r2");

    // 1. Fetch from Cloudflare R2 if configured
    if (hasRealR2Config) {
      try {
        const r2Objects = await listR2Objects();

        for (const obj of r2Objects) {
          if (!obj.Key) continue;
          // Filter out txt, non-images, or empty folder markers
          if (obj.Key.endsWith("/") || obj.Key.endsWith(".txt")) continue;

          const filename = obj.Key.split("/").pop() || obj.Key;
          const dateStr = obj.LastModified
            ? new Date(obj.LastModified).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Baru saja";

          items.push({
            id: obj.Key,
            key: obj.Key,
            url: getR2PublicUrl(obj.Key),
            filename,
            size: obj.Size || 0,
            uploadedAt: dateStr,
            storage: "cloudflare-r2",
          });
        }
      } catch (err: unknown) {
        console.error("Gagal membaca objek dari Cloudflare R2:", err);
      }
    }

    // 2. Fetch from local public/uploads directory as well
    try {
      const localDir = path.join(process.cwd(), "public", "uploads", "gallery");
      const files = await readdir(localDir);

      for (const f of files) {
        const filePath = path.join(localDir, f);
        const st = await stat(filePath);
        if (st.isFile()) {
          const key = `local-gallery/${f}`;
          // Avoid duplicate display
          if (!items.some((it) => it.filename === f)) {
            items.push({
              id: key,
              key,
              url: `/uploads/gallery/${f}`,
              filename: f,
              size: st.size,
              uploadedAt: new Date(st.mtime).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              storage: "local-storage",
            });
          }
        }
      }
    } catch {
      // Local uploads directory may not exist yet, ignore
    }

    // Sort newest first
    return NextResponse.json({
      success: true,
      data: items.reverse(),
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/media error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal mengambil daftar media.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    let rawKeys: string[] = [];

    if (Array.isArray(body.keys) && body.keys.length > 0) {
      rawKeys = body.keys;
    } else if (body.key) {
      rawKeys = [body.key];
    } else if (body.url) {
      rawKeys = [body.url];
    }

    if (rawKeys.length === 0) {
      return NextResponse.json(
        { success: false, message: "Key atau URL file yang akan dihapus wajib diberikan." },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const raw of rawKeys) {
      try {
        let key = raw.trim();

        // If it's a full URL, extract the path
        if (key.startsWith("http://") || key.startsWith("https://")) {
          try {
            const parsed = new URL(key);
            key = parsed.pathname.replace(/^\/+/, "");
          } catch {
            // keep raw
          }
        }

        key = decodeURIComponent(key).replace(/^\/+/, "");

        if (key.startsWith("local-gallery/") || key.startsWith("uploads/gallery/")) {
          // Local file
          const filename = key
            .replace("local-gallery/", "")
            .replace("uploads/gallery/", "");
          const localFilePath = path.join(
            process.cwd(),
            "public",
            "uploads",
            "gallery",
            filename
          );
          const { unlink } = await import("fs/promises");
          await unlink(localFilePath).catch(() => null);
          deletedCount++;
        } else {
          // Cloudflare R2 object
          await deleteFromR2(key);
          deletedCount++;
        }
      } catch (itemErr: unknown) {
        console.error(`Gagal menghapus file ${raw}:`, itemErr);
        errors.push(itemErr instanceof Error ? itemErr.message : "Error hapus file");
      }
    }

    if (deletedCount === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Gagal menghapus file: ${errors.join(", ")}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        deletedCount === 1
          ? "1 foto berhasil dihapus permanen dari storage."
          : `${deletedCount} foto berhasil dihapus permanen dari storage.`,
      deletedCount,
    });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/media error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menghapus foto.",
      },
      { status: 500 }
    );
  }
}
