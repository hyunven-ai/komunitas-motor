import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { ChatMessage, ChatReactionGroup } from "../types/chat.types";
import { AppRole } from "@/types/database";

export const SAMPLE_MESSAGES: Record<string, ChatMessage[]> = {
  general: [
    {
      id: "msg-001",
      room_id: "room-gen-001",
      sender_id: "usr-admin-01",
      content: "Selamat datang di Community Chat resmi Borneo Brotherhood! Silakan perkenalkan diri dan patuhi safety riding rules saat diskusi.",
      message_type: "announcement",
      is_edited: false,
      is_pinned: true,
      is_deleted: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      sender: {
        id: "usr-admin-01",
        full_name: "Bambang Pamungkas",
        display_name: "Bambang (Ketua)",
        username: "bambang_rc",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        member_number: "BMC-2026-0001",
        role: "chairman",
        is_verified: true,
      },
      reactions: [
        { emoji: "🔥", count: 12, user_ids: ["u1", "u2"], has_reacted: false },
        { emoji: "🤝", count: 8, user_ids: ["u3"], has_reacted: true },
      ],
    },
    {
      id: "msg-002",
      room_id: "room-gen-001",
      sender_id: "usr-mem-02",
      content: "Siap Ketua! Izin gabung dari Chapter Pontianak Barat. Cuaca hari ini cerah untuk rolling sore.",
      message_type: "text",
      is_edited: false,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      sender: {
        id: "usr-mem-02",
        full_name: "Dimas Arya",
        display_name: "Dimas",
        username: "dimas_ride",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        member_number: "BMC-2026-0042",
        role: "member",
        is_verified: true,
      },
      reactions: [
        { emoji: "🏍️", count: 5, user_ids: ["u1"], has_reacted: false },
      ],
    },
    {
      id: "msg-003",
      room_id: "room-gen-001",
      sender_id: "usr-road-03",
      content: "Jangan lupa cek tekanan ban dan kelengkapan protektor. Aspal Trans Kalimantan banyak jalur baru yang mulus tapi ada beberapa tikungan blind spot.",
      message_type: "text",
      is_edited: false,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      sender: {
        id: "usr-road-03",
        full_name: "Kapten Hendra",
        display_name: "Kapten Hendra (RC)",
        username: "hendra_rc",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        member_number: "BMC-2026-0005",
        role: "event_officer",
        is_verified: true,
      },
      reactions: [
        { emoji: "👍", count: 9, user_ids: ["u1", "u4"], has_reacted: false },
      ],
    },
  ],
  touring: [
    {
      id: "msg-tour-001",
      room_id: "room-tour-010",
      sender_id: "usr-road-03",
      content: "Briefing Etape 1: Pangandaran - Yogyakarta. Titik kumpul SPBU KM 12 pukul 05:00 WIB. Rolling Thunder jalan tepat 05:45 WIB. Tidak ada toleransi keterlambatan tanpa konfirmasi Sweeper.",
      message_type: "announcement",
      is_edited: false,
      is_pinned: true,
      is_deleted: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
      sender: {
        id: "usr-road-03",
        full_name: "Kapten Hendra",
        display_name: "Kapten Hendra (RC)",
        username: "hendra_rc",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        member_number: "BMC-2026-0005",
        role: "event_officer",
        is_verified: true,
      },
      reactions: [
        { emoji: "⚡", count: 15, user_ids: ["u1"], has_reacted: true },
      ],
    },
  ],
};

export async function fetchMessagesByRoom(
  roomSlug: string,
  roomId?: string
): Promise<ChatMessage[]> {
  try {
    const supabase = createBrowserSupabase();
    let query = supabase
      .from("chat_messages")
      .select(`
        id,
        room_id,
        sender_id,
        content,
        reply_to,
        message_type,
        is_edited,
        is_pinned,
        is_deleted,
        created_at,
        updated_at,
        chat_attachments (
          id,
          file_name,
          file_url,
          file_type,
          file_size,
          mime_type
        ),
        chat_reactions (
          id,
          emoji,
          user_id
        )
      `)
      .order("created_at", { ascending: true })
      .limit(100);

    if (roomId) {
      query = query.eq("room_id", roomId);
    }

    const { data: messages, error } = await query;

    if (error || !messages || messages.length === 0) {
      return SAMPLE_MESSAGES[roomSlug] || SAMPLE_MESSAGES.general;
    }

    // Collect sender IDs to fetch profiles and roles in a single batch
    const senderIds = Array.from(new Set(messages.map((m: any) => m.sender_id)));
    const [profilesRes, rolesRes, membersRes] = await Promise.all([
      supabase.from("profiles").select("*").in("id", senderIds),
      supabase.from("user_roles").select("*").in("user_id", senderIds),
      supabase.from("members").select("user_id, member_number").in("user_id", senderIds),
    ]);

    const profileMap = new Map(((profilesRes.data || []) as any[]).map((p: any) => [p.id, p]));
    const roleMap = new Map(((rolesRes.data || []) as any[]).map((r: any) => [r.user_id, r.role as AppRole]));
    const memberMap = new Map(((membersRes.data || []) as any[]).map((m: any) => [m.user_id, m.member_number]));

    return messages.map((m: any) => {
      const profile = profileMap.get(m.sender_id) as any;
      const role = roleMap.get(m.sender_id) || "member";
      const memberNumber = memberMap.get(m.sender_id) || "BMC-MEMBER";

      // Group reactions by emoji
      const reactionGroupMap = new Map<string, { emoji: string; count: number; user_ids: string[] }>();
      (m.chat_reactions || []).forEach((r: any) => {
        const existing = reactionGroupMap.get(r.emoji) || { emoji: r.emoji, count: 0, user_ids: [] as string[] };
        existing.count += 1;
        existing.user_ids.push(r.user_id as string);
        reactionGroupMap.set(r.emoji, existing);
      });

      return {
        id: m.id,
        room_id: m.room_id,
        sender_id: m.sender_id,
        content: m.content,
        reply_to: m.reply_to,
        message_type: m.message_type,
        is_edited: m.is_edited,
        is_pinned: m.is_pinned,
        is_deleted: m.is_deleted,
        created_at: m.created_at,
        updated_at: m.updated_at,
        sender: {
          id: m.sender_id,
          full_name: profile?.full_name || "Anggota Brotherhood",
          display_name: profile?.display_name || profile?.full_name || "Bikers",
          username: profile?.username || undefined,
          avatar_url: profile?.avatar_url || null,
          member_number: memberNumber,
          role,
          is_verified: true,
        },
        attachments: m.chat_attachments || [],
        reactions: Array.from(reactionGroupMap.values()).map((rg) => ({
          ...rg,
          has_reacted: false, // client will calculate based on active user
        })),
      };
    });
  } catch (err) {
    console.warn("[message.service] Using fallback sample messages:", err);
    return SAMPLE_MESSAGES[roomSlug] || SAMPLE_MESSAGES.general;
  }
}
