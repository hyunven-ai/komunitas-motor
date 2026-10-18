import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { uploadToR2, getR2PublicUrl } from "@/lib/storage/r2";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "gallery";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file gambar yang diunggah." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format file tidak didukung. Harap unggah format JPG, PNG, WEBP, atau AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran file terlalu besar. Batas maksimal ukuran gambar adalah 10MB.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .substring(0, 30);
    const uniqueKey = `${folder}/${Date.now()}-${cleanBase}${ext}`;

    const hasRealR2Config =
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID.includes("your-r2") &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY.includes("your-r2");

    // Option A: Upload to Cloudflare R2 if configured
    if (hasRealR2Config) {
      try {
        const r2Result = await uploadToR2({
          key: uniqueKey,
          body: buffer,
          contentType: file.type,
        });

        return NextResponse.json({
          success: true,
          message: "Foto berhasil diunggah ke Cloudflare R2 Storage!",
          data: {
            url: r2Result.url,
            key: uniqueKey,
            filename: file.name,
            size: file.size,
            storage: "cloudflare-r2",
          },
        });
      } catch (r2Err: unknown) {
        console.error("R2 Upload error:", r2Err);
        const errMsg =
          r2Err instanceof Error ? r2Err.message : "Gagal mengunggah ke Cloudflare R2.";
        return NextResponse.json(
          {
            success: false,
            message: `Cloudflare R2 Error: ${errMsg}`,
          },
          { status: 502 }
        );
      }
    }

    // Option B: Fallback to local /public/uploads/ directory for instant preview
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadsDir, { recursive: true });

    const localFilename = `${Date.now()}-${cleanBase}${ext}`;
    const localFilePath = path.join(uploadsDir, localFilename);
    await writeFile(localFilePath, buffer);

    const publicUrl = `/uploads/${folder}/${localFilename}`;

    return NextResponse.json({
      success: true,
      message: hasRealR2Config
        ? "Foto berhasil diunggah!"
        : "Foto berhasil diunggah ke penyimpanan lokal (siap sinkron ke Cloudflare R2 saat kredensial aktif)!",
      data: {
        url: publicUrl,
        key: uniqueKey,
        filename: file.name,
        size: file.size,
        storage: "local-storage",
      },
    });
  } catch (err: unknown) {
    console.error("Upload handler error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memproses unggahan gambar.",
      },
      { status: 500 }
    );
  }
}
