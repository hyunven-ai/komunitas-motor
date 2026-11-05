import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { uploadToR2, getR2PublicUrl } from "@/lib/storage/r2";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    // 1. Check user session
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // In dev mode allow demo user if not logged in
    const isDev = process.env.NODE_ENV === "development";
    if (!user && !isDev) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const roomId = (formData.get("roomId") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada berkas yang dipilih." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format berkas tidak didukung. Harap unggah foto (JPG, PNG, WEBP, GIF) atau dokumen PDF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Ukuran berkas terlalu besar. Batas maksimal lampiran chat adalah 10MB.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and generate unique key
    const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .substring(0, 30);
    const uniqueKey = `chat-attachments/${roomId}/${Date.now()}-${cleanBase}${ext}`;

    const isImage = file.type.startsWith("image/");
    const fileType = isImage ? "image" : "document";

    const hasRealR2Config =
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID.includes("your-r2") &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY.includes("your-r2");

    // Option A: Upload to Cloudflare R2 bucket (Primary Zero-Egress Storage)
    if (hasRealR2Config) {
      try {
        const r2Result = await uploadToR2({
          key: uniqueKey,
          body: buffer,
          contentType: file.type,
        });

        return NextResponse.json({
          success: true,
          message: "Berkas berhasil diunggah ke Cloudflare R2!",
          data: {
            file_url: r2Result.url,
            key: uniqueKey,
            file_name: file.name,
            file_size: file.size,
            file_type: fileType,
            mime_type: file.type,
            storage: "cloudflare-r2",
          },
        });
      } catch (r2Err: unknown) {
        console.error("[chat-upload] Cloudflare R2 upload error:", r2Err);
        // If R2 fails unexpectedly, fall through to local fallback
      }
    }

    // Option B: Local Disk Fallback (prevents failures if Cloudflare R2 keys not entered yet)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat", roomId);
    await mkdir(uploadDir, { recursive: true });

    const localFileName = `${Date.now()}-${cleanBase}${ext}`;
    const filePath = path.join(uploadDir, localFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/chat/${roomId}/${localFileName}`;

    return NextResponse.json({
      success: true,
      message: "Berkas berhasil diunggah (penyimpanan lokal komunitas)!",
      data: {
        file_url: publicUrl,
        key: uniqueKey,
        file_name: file.name,
        file_size: file.size,
        file_type: fileType,
        mime_type: file.type,
        storage: "local-fallback",
      },
    });
  } catch (error: unknown) {
    console.error("[chat-upload] Unhandled upload error:", error);
    const msg = error instanceof Error ? error.message : "Gagal memproses unggahan berkas.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

