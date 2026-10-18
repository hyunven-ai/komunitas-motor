"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createTopicSchema,
  type CreateTopicInput,
  replyPostSchema,
  type ReplyPostInput,
  reportContentSchema,
  type ReportContentInput,
} from "./schemas";

export interface ForumActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Member creates a new discussion topic in the forum
 */
export async function createTopicAction(
  data: CreateTopicInput
): Promise<ForumActionResult<{ topicId: string; slug: string }>> {
  const validation = createTopicSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data topik diskusi tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { title, categoryId, content } = validation.data;
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .concat(`-${Date.now().toString().slice(-4)}`);

  if (isMock) {
    return {
      success: true,
      message: "Topik diskusi berhasil diterbitkan ke forum!",
      data: {
        topicId: `topic_${Date.now()}`,
        slug,
      },
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();

    if (!userAuth?.user) {
      return { success: false, message: "Akses ditolak: Silakan login sebagai anggota." };
    }

    const { data: inserted, error } = await supabase
      .from("forum_topics")
      .insert({
        title,
        slug,
        category_id: categoryId,
        content,
        author_id: userAuth.user.id,
      })
      .select("id, slug")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Topik diskusi berhasil diterbitkan ke forum!",
      data: { topicId: inserted.id, slug: inserted.slug },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, message: msg };
  }
}

/**
 * Member posts a reply to an existing forum topic
 */
export async function replyPostAction(
  data: ReplyPostInput
): Promise<ForumActionResult<{ postId: string }>> {
  const validation = replyPostSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Isi balasan tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: "Tanggapan Anda berhasil dikirim ke diskusi!",
      data: { postId: `post_${Date.now()}` },
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();

    if (!userAuth?.user) {
      return { success: false, message: "Akses ditolak: Silakan login." };
    }

    const { data: inserted, error } = await supabase
      .from("forum_posts")
      .insert({
        topic_id: validation.data.topicId,
        author_id: userAuth.user.id,
        content: validation.data.content,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Tanggapan Anda berhasil dikirim ke diskusi!",
      data: { postId: inserted.id },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, message: msg };
  }
}

/**
 * Member reports inappropriate content or rule violations
 */
export async function reportContentAction(
  data: ReportContentInput
): Promise<ForumActionResult> {
  const validation = reportContentSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data laporan tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: "Laporan telah diterima. Tim moderator akan segera meninjau.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();

    if (!userAuth?.user) {
      return { success: false, message: "Akses ditolak: Silakan login." };
    }

    const { error } = await supabase.from("forum_reports").insert({
      topic_id: validation.data.topicId,
      post_id: validation.data.postId || null,
      reported_by: userAuth.user.id,
      reason: validation.data.reason,
      status: "pending",
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Laporan telah diterima. Tim moderator akan segera meninjau.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Moderator pins or unpins a topic
 */
export async function togglePinTopicAction(
  topicId: string,
  isPinned: boolean
): Promise<ForumActionResult> {
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: isPinned ? "Topik berhasil di-pin di bagian atas." : "Pin topik dilepas.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("forum_topics")
      .update({ is_pinned: isPinned })
      .eq("id", topicId);

    if (error) return { success: false, message: error.message };
    return {
      success: true,
      message: isPinned ? "Topik berhasil di-pin di bagian atas." : "Pin topik dilepas.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Moderator locks or unlocks a topic (prevents replies)
 */
export async function toggleLockTopicAction(
  topicId: string,
  isLocked: boolean
): Promise<ForumActionResult> {
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: isLocked ? "Topik telah dikunci dari balasan baru." : "Kunci topik dibuka kembali.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("forum_topics")
      .update({ is_locked: isLocked })
      .eq("id", topicId);

    if (error) return { success: false, message: error.message };
    return {
      success: true,
      message: isLocked ? "Topik telah dikunci dari balasan baru." : "Kunci topik dibuka kembali.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Moderator deletes a topic
 */
export async function deleteTopicAction(topicId: string): Promise<ForumActionResult> {
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return { success: true, message: "Topik diskusi berhasil dihapus." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("forum_topics").delete().eq("id", topicId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Topik diskusi berhasil dihapus." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Moderator resolves a content report
 */
export async function resolveReportAction(
  reportId: string,
  resolution: "dismiss" | "delete_content" | "warn_member"
): Promise<ForumActionResult> {
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message:
        resolution === "dismiss"
          ? "Laporan ditolak / dianggap aman."
          : resolution === "delete_content"
          ? "Konten yang dilaporkan telah dihapus dari forum."
          : "Peringatan resmi telah dikirim ke akun pelanggar.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("forum_reports")
      .update({
        status: resolution,
        resolved_by: userAuth?.user?.id || null,
      })
      .eq("id", reportId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Laporan berhasil ditindaklanjuti." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}
