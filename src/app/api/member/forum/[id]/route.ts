import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function resolveUser(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: tokenData } = await supabase.auth.getUser(token);
    if (tokenData?.user) return tokenData.user;
  }

  return null;
}

async function getLikesStore(adminSupabase: any) {
  const { data: row } = await adminSupabase
    .from("announcements")
    .select("id, content")
    .eq("title", "__FORUM_LIKES__")
    .maybeSingle();

  let likesData: {
    postLikes: Record<string, string[]>;
    topicLikes: Record<string, string[]>;
  } = { postLikes: {}, topicLikes: {} };

  if (row?.content) {
    try {
      const parsed = JSON.parse(row.content);
      likesData = {
        postLikes: parsed.postLikes || {},
        topicLikes: parsed.topicLikes || {},
      };
    } catch {}
  }

  return { row, likesData };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveUser(req);
    const { id } = await params;
    const adminSupabase = createAdminClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = adminSupabase
      .from("forum_topics")
      .select(`
        id,
        category_id,
        author_id,
        title,
        slug,
        content,
        is_pinned,
        is_locked,
        is_hidden,
        view_count,
        created_at,
        category:forum_categories(id, name, slug)
      `);

    if (isUuid) {
      query = query.or(`id.eq.${id},slug.eq.${id}`);
    } else {
      query = query.eq("slug", id);
    }

    const { data: topic, error: topErr } = await query.maybeSingle();

    if (topErr || !topic) {
      return NextResponse.json(
        { success: false, message: "Topik diskusi tidak ditemukan." },
        { status: 404 }
      );
    }

    // 1. Increment view count
    const newViewCount = (topic.view_count || 0) + 1;
    await adminSupabase
      .from("forum_topics")
      .update({ view_count: newViewCount })
      .eq("id", topic.id);

    // 2. Load likes store
    const { likesData } = await getLikesStore(adminSupabase);
    const topicLikesList = likesData.topicLikes[topic.id] || [];
    const topicLikes = topicLikesList.length;
    const isTopicLiked = user ? topicLikesList.includes(user.id) : false;

    // 3. Fetch author info
    const { data: authorProfile } = await adminSupabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url")
      .eq("id", topic.author_id)
      .maybeSingle();

    const { data: authorMember } = await adminSupabase
      .from("members")
      .select("member_number, motorcycle_model, motorcycle_year")
      .eq("user_id", topic.author_id)
      .maybeSingle();

    // 4. Fetch replies
    const { data: posts, error: postErr } = await adminSupabase
      .from("forum_posts")
      .select("id, author_id, content, is_hidden, created_at")
      .eq("topic_id", topic.id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });

    const replyAuthorIds = Array.from(new Set((posts || []).map((p: any) => p.author_id)));
    const { data: replyProfiles } = await adminSupabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url")
      .in("id", replyAuthorIds);

    const { data: replyMembers } = await adminSupabase
      .from("members")
      .select("user_id, member_number, motorcycle_model, motorcycle_year")
      .in("user_id", replyAuthorIds);

    const profileMap = new Map();
    (replyProfiles || []).forEach((p: any) => profileMap.set(p.id, p));

    const memberMap = new Map();
    (replyMembers || []).forEach((m: any) => memberMap.set(m.user_id, m));

    const formattedReplies = (posts || []).map((p: any) => {
      const prof = profileMap.get(p.author_id);
      const mem = memberMap.get(p.author_id);
      const postLikesList = likesData.postLikes[p.id] || [];

      return {
        id: p.id,
        author: prof?.full_name || prof?.display_name || "Anggota",
        authorNumber: mem?.member_number || "BMC-MEMBER",
        authorRole: p.author_id === "69b1ae80-facc-40e9-9b60-d08cb2152d28" ? "Pengurus Pusat" : "Member",
        motorcycle: mem?.motorcycle_model ? `${mem.motorcycle_model} (${mem.motorcycle_year || ""})` : "Motor Member",
        content: p.content,
        createdAt: p.created_at,
        likes: postLikesList.length,
        isLiked: user ? postLikesList.includes(user.id) : false,
      };
    });

    const categoryData: any = topic.category;

    const response = NextResponse.json({
      success: true,
      data: {
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        content: topic.content,
        category: categoryData?.name || "Umum",
        categorySlug: categoryData?.slug || "umum",
        isPinned: topic.is_pinned,
        isLocked: topic.is_locked,
        viewCount: newViewCount,
        likes: topicLikes,
        isLiked: isTopicLiked,
        createdAt: topic.created_at,
        author: {
          id: topic.author_id,
          name: authorProfile?.full_name || authorProfile?.display_name || "Anggota Brotherhood",
          memberNumber: authorMember?.member_number || "BMC-MEMBER",
          motorcycle: authorMember?.motorcycle_model || "Motor Member",
          motorcycleYear: authorMember?.motorcycle_year || "",
          role: topic.author_id === "69b1ae80-facc-40e9-9b60-d08cb2152d28" ? "Pengurus Pusat" : "Member",
        },
        replies: formattedReplies,
      },
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (err: unknown) {
    console.error("GET /api/member/forum/[id] catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const adminSupabase = createAdminClient();

    // Resolve real topic ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let topicQuery = adminSupabase.from("forum_topics").select("id, is_locked");
    if (isUuid) {
      topicQuery = topicQuery.or(`id.eq.${id},slug.eq.${id}`);
    } else {
      topicQuery = topicQuery.eq("slug", id);
    }
    const { data: topic } = await topicQuery.maybeSingle();

    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Topik diskusi tidak ditemukan." },
        { status: 404 }
      );
    }

    // 1. ACTION: LIKE / UNLIKE
    if (body.type === "like") {
      const targetType = body.targetType === "topic" ? "topicLikes" : "postLikes";
      const targetId = body.targetId || topic.id;

      const { row, likesData } = await getLikesStore(adminSupabase);
      const currentList: string[] = likesData[targetType][targetId] || [];
      const hasLiked = currentList.includes(user.id);

      let updatedList: string[];
      if (hasLiked) {
        updatedList = currentList.filter((uid) => uid !== user.id);
      } else {
        updatedList = [...currentList, user.id];
      }

      likesData[targetType][targetId] = updatedList;

      if (row?.id) {
        await adminSupabase
          .from("announcements")
          .update({ content: JSON.stringify(likesData) })
          .eq("id", row.id);
      } else {
        await adminSupabase.from("announcements").insert({
          title: "__FORUM_LIKES__",
          content: JSON.stringify(likesData),
          author_id: user.id,
          priority: "normal",
        });
      }

      return NextResponse.json({
        success: true,
        message: !hasLiked ? "Berhasil menyukai konten" : "Batal menyukai konten",
        data: {
          targetId,
          targetType: body.targetType,
          isLiked: !hasLiked,
          likeCount: updatedList.length,
        },
      });
    }

    // 2. ACTION: REPORT
    if (body.type === "report") {
      const { reason, postId } = body;
      if (!reason) {
        return NextResponse.json(
          { success: false, message: "Alasan pelaporan wajib diisi." },
          { status: 400 }
        );
      }

      await adminSupabase.from("forum_reports").insert({
        topic_id: topic.id,
        post_id: postId || null,
        reported_by: user.id,
        reason,
        status: "pending",
      });

      return NextResponse.json({
        success: true,
        message: "Laporan berhasil dikirim. Moderator akan meninjau laporan Anda.",
      });
    }

    // 3. ACTION: REPLY
    if (topic.is_locked) {
      return NextResponse.json(
        { success: false, message: "Topik ini telah dikunci oleh moderator dan tidak dapat menerima balasan baru." },
        { status: 403 }
      );
    }

    const { content } = body;
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Isi balasan tidak boleh kosong." },
        { status: 400 }
      );
    }

    const { data: newPost, error: insErr } = await adminSupabase
      .from("forum_posts")
      .insert({
        topic_id: topic.id,
        author_id: user.id,
        content: content.trim(),
        is_hidden: false,
      })
      .select("id, created_at")
      .single();

    if (insErr) {
      return NextResponse.json(
        { success: false, message: "Gagal mengirim balasan: " + insErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tanggapan Anda berhasil dikirim ke diskusi!",
      data: newPost,
    });
  } catch (err: unknown) {
    console.error("POST /api/member/forum/[id] catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}
