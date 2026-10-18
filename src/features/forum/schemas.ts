import { z } from "zod";

export const createTopicSchema = z.object({
  title: z
    .string()
    .min(5, "Judul topik minimal 5 karakter")
    .max(150, "Judul topik maksimal 150 karakter"),
  categoryId: z.string().min(1, "Pilih kategori topik"),
  content: z
    .string()
    .min(20, "Isi diskusi minimal 20 karakter agar jelas bagi anggota lain"),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export const replyPostSchema = z.object({
  topicId: z.string().min(1, "Topic ID harus disertakan"),
  content: z
    .string()
    .min(3, "Isi komentar minimal 3 karakter")
    .max(2000, "Komentar maksimal 2.000 karakter"),
});

export type ReplyPostInput = z.infer<typeof replyPostSchema>;

export const reportContentSchema = z.object({
  topicId: z.string().min(1, "ID topik harus disertakan"),
  postId: z.string().optional(),
  reason: z.string().min(5, "Alasan pelaporan minimal 5 karakter"),
});

export type ReportContentInput = z.infer<typeof reportContentSchema>;
