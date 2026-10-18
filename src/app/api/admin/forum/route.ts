import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminSupabase = createAdminClient();

    // 1. Fetch Reports
    const { data: reports, error: repErr } = await adminSupabase
      .from("forum_reports")
      .select(`
        id,
        topic_id,
        post_id,
        reported_by,
        reason,
        status,
        created_at,
        topic:forum_topics(id, title, author_id, content),
        post:forum_posts(id, content)
      `)
      .order("created_at", { ascending: false });

    // Fetch author info and reporter info
    const userIdsToFetch = new Set<string>();
    (reports || []).forEach((r: any) => {
      if (r.reported_by) userIdsToFetch.add(r.reported_by);
      if (r.topic?.author_id) userIdsToFetch.add(r.topic.author_id);
    });

    const { data: profiles } = await adminSupabase
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", Array.from(userIdsToFetch));

    const { data: members } = await adminSupabase
      .from("members")
      .select("user_id, member_number")
      .in("user_id", Array.from(userIdsToFetch));

    const profileMap = new Map();
    (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

    const memberMap = new Map();
    (members || []).forEach((m: any) => memberMap.set(m.user_id, m));

    const formattedReports = (reports || []).map((r: any) => {
      const topicAuthorProf = profileMap.get(r.topic?.author_id);
      const topicAuthorMem = memberMap.get(r.topic?.author_id);
      const reporterProf = profileMap.get(r.reported_by);
      const reporterMem = memberMap.get(r.reported_by);

      return {
        id: r.id,
        topicId: r.topic_id,
        topicTitle: r.topic?.title || "Topik telah dihapus",
        authorName: topicAuthorProf?.full_name || topicAuthorProf?.display_name || "Member",
        authorNumber: topicAuthorMem?.member_number || "BMC-MEMBER",
        reportedBy: `${reporterProf?.full_name || "Member"} (${reporterMem?.member_number || "BMC-MEMBER"})`,
        reason: r.reason,
        reportedAt: r.created_at,
        snippet: r.post?.content || r.topic?.content?.slice(0, 100) || "-",
        status: r.status,
      };
    });

    // 2. Fetch Topics for Moderation
    const { data: topics, error: topErr } = await adminSupabase
      .from("forum_topics")
      .select(`
        id,
        title,
        slug,
        category_id,
        author_id,
        is_pinned,
        is_locked,
        is_hidden,
        view_count,
        created_at,
        category:forum_categories(name)
      `)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    // Collect reply counts
    const topicIds = (topics || []).map((t: any) => t.id);
    const { data: posts } = await adminSupabase
      .from("forum_posts")
      .select("id, topic_id")
      .in("topic_id", topicIds);

    const postCountMap = new Map<string, number>();
    (posts || []).forEach((p: any) => {
      postCountMap.set(p.topic_id, (postCountMap.get(p.topic_id) || 0) + 1);
    });

    const topicAuthorIds = Array.from(new Set((topics || []).map((t: any) => t.author_id)));
    const { data: topicProfiles } = await adminSupabase
      .from("profiles")
      .select("id, full_name, display_name")
      .in("id", topicAuthorIds);

    const topicProfMap = new Map();
    (topicProfiles || []).forEach((p: any) => topicProfMap.set(p.id, p));

    const formattedTopics = (topics || []).map((t: any) => {
      const prof = topicProfMap.get(t.author_id);
      return {
        id: t.id,
        title: t.title,
        category: (t.category as any)?.name || "Umum",
        author: prof?.full_name || prof?.display_name || "Member",
        replies: postCountMap.get(t.id) || 0,
        views: t.view_count || 0,
        isPinned: t.is_pinned,
        isLocked: t.is_locked,
        isHidden: t.is_hidden,
        date: t.created_at ? t.created_at.slice(0, 10) : "-",
      };
    });

    const stats = {
      totalTopics: (topics || []).length,
      totalPosts: (posts || []).length,
      pendingReports: formattedReports.filter((r) => r.status === "pending").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        reports: formattedReports,
        topics: formattedTopics,
        stats,
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/forum catch:", err);
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
    const adminSupabase = createAdminClient();
    const body = await req.json();
    const { action, topicId, reportId, value } = body;

    if (action === "togglePin") {
      const { error } = await adminSupabase
        .from("forum_topics")
        .update({ is_pinned: Boolean(value), updated_at: new Date().toISOString() })
        .eq("id", topicId);

      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: value ? "Topik berhasil di-pin di bagian atas." : "Pin topik berhasil dilepas.",
      });
    }

    if (action === "toggleLock") {
      const { error } = await adminSupabase
        .from("forum_topics")
        .update({ is_locked: Boolean(value), updated_at: new Date().toISOString() })
        .eq("id", topicId);

      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: value ? "Topik berhasil dikunci dari balasan." : "Kunci topik berhasil dibuka.",
      });
    }

    if (action === "deleteTopic") {
      const { error } = await adminSupabase
        .from("forum_topics")
        .delete()
        .eq("id", topicId);

      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: "Topik diskusi berhasil dihapus dari forum.",
      });
    }

    if (action === "resolveReport") {
      const { error } = await adminSupabase
        .from("forum_reports")
        .update({ status: value || "resolved" })
        .eq("id", reportId);

      if (error) throw error;
      return NextResponse.json({
        success: true,
        message: "Status laporan pelanggaran berhasil diperbarui.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi moderator tidak dikenali." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("POST /api/admin/forum catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem internal.",
      },
      { status: 500 }
    );
  }
}
