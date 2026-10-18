import { z } from "zod";

export const newsArticleSchema = z.object({
  title: z
    .string()
    .min(3, "Judul artikel minimal 3 karakter")
    .max(180, "Judul maksimal 180 karakter"),
  slug: z.string().min(2, "Slug URL wajib diisi"),
  category: z.string().min(2, "Pilih kategori artikel"),
  summary: z
    .string()
    .min(3, "Ringkasan artikel minimal 3 karakter")
    .max(300, "Ringkasan maksimal 300 karakter"),
  content: z.string().min(5, "Isi artikel minimal 5 karakter"),
  coverImageUrl: z.string().min(1, "URL foto sampul wajib diisi"),
  status: z.enum(["draft", "published"]),
  authorName: z.string().min(2, "Nama penulis wajib diisi"),
});

export type NewsArticleInput = z.infer<typeof newsArticleSchema>;

export const galleryAlbumSchema = z.object({
  title: z.string().min(3, "Judul album minimal 3 karakter"),
  slug: z.string().min(3, "Slug album wajib diisi"),
  category: z.string().min(2, "Kategori album wajib diisi"),
  location: z.string().min(2, "Lokasi pengambilan foto wajib diisi"),
  date: z.string().min(2, "Tanggal/Bulan pelaksanaan wajib diisi"),
  description: z.string().min(10, "Deskripsi album minimal 10 karakter"),
  coverImageUrl: z.string().min(1, "URL foto sampul wajib diisi"),
  isPublic: z.boolean(),
  photoCount: z.number().min(1, "Jumlah foto minimal 1"),
});

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
