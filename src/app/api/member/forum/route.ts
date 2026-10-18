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

export async function GET(req: NextRequest) {
  try {
    const adminSupabase = createAdminClient();

    // 1. Fetch Categories
    const { data: categories, error: catErr } = await adminSupabase
      .from("forum_categories")
      .select("id, name, slug, description, order_index, icon")
      .order("order_index", { ascending: true });

    if (catErr) {
      console.error("GET /api/member/forum catErr:", catErr);
      return NextResponse.json(
        { success: false, message: "Gagal memuat kategori: " + catErr.message },
        { status: 500 }
      );
    }

    // 2. Fetch Topics
    const { data: topics, error: topErr } = await adminSupabase
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
      `)
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (topErr) {
      console.error("GET /api/member/forum topErr:", topErr);
      return NextResponse.json(
        { success: false, message: "Gagal memuat topik: " + topErr.message },
        { status: 500 }
      );
    }

    // 3. Collect author IDs and topic IDs for details and reply counts
    const authorIds = Array.from(new Set((topics || []).map((t: any) => t.author_id)));
    const topicIds = (topics || []).map((t: any) => t.id);

    // Fetch author profiles & member numbers
    const { data: profiles } = await adminSupabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url")
      .in("id", authorIds);

    const { data: members } = await adminSupabase
      .from("members")
      .select("user_id, member_number, motorcycle_model")
      .in("user_id", authorIds);

    const profileMap = new Map();
    (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

    const memberMap = new Map();
    (members || []).forEach((m: any) => memberMap.set(m.user_id, m));

    // Fetch post counts per topic
    const { data: posts } = await adminSupabase
      .from("forum_posts")
      .select("id, topic_id")
      .in("topic_id", topicIds)
      .eq("is_hidden", false);

    const replyCountMap = new Map<string, number>();
    (posts || []).forEach((p: any) => {
      replyCountMap.set(p.topic_id, (replyCountMap.get(p.topic_id) || 0) + 1);
    });

    // Fetch topic likes
    const { data: likesRow } = await adminSupabase
      .from("announcements")
      .select("content")
      .eq("title", "__FORUM_LIKES__")
      .maybeSingle();

    let topicLikesMap: Record<string, string[]> = {};
    if (likesRow?.content) {
      try {
        topicLikesMap = JSON.parse(likesRow.content).topicLikes || {};
      } catch {}
    }

    const formattedTopics = (topics || []).map((t: any) => {
      const prof = profileMap.get(t.author_id);
      const mem = memberMap.get(t.author_id);

      return {
        id: t.id,
        slug: t.slug,
        title: t.title,
        categoryId: t.category_id,
        category: t.category?.name || "Umum",
        categorySlug: t.category?.slug || "umum",
        content: t.content,
        author: prof?.full_name || prof?.display_name || "Anggota Brotherhood",
        authorNumber: mem?.member_number || "BMC-MEMBER",
        authorRole: t.author_id === "69b1ae80-facc-40e9-9b60-d08cb2152d28" ? "Pengurus Pusat" : "Member",
        replies: replyCountMap.get(t.id) || 0,
        views: t.view_count || 0,
        likes: (topicLikesMap[t.id] || []).length,
        isPinned: t.is_pinned,
        isLocked: t.is_locked,
        createdAt: t.created_at,
      };
    });

    const response = NextResponse.json({
      success: true,
      data: {
        categories: categories || [],
        topics: formattedTopics,
      },
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (err: unknown) {
    console.error("GET /api/member/forum catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, categoryId, content } = body;

    if (!title || !categoryId || !content) {
      return NextResponse.json(
        { success: false, message: "Judul, kategori, dan isi topik wajib diisi." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .concat(`-${Date.now().toString().slice(-4)}`);

    const { data: inserted, error: insErr } = await adminSupabase
      .from("forum_topics")
      .insert({
        title,
        slug,
        category_id: categoryId,
        content,
        author_id: user.id,
        is_pinned: false,
        is_locked: false,
        is_hidden: false,
        view_count: 1,
      })
      .select("id, slug")
      .single();

    if (insErr) {
      console.error("POST /api/member/forum insErr:", insErr);
      return NextResponse.json(
        { success: false, message: "Gagal membuat topik diskusi: " + insErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Topik diskusi berhasil diterbitkan ke forum!",
      data: inserted,
    });
  } catch (err: unknown) {
    console.error("POST /api/member/forum catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}
