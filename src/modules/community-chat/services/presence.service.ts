import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { ChatMemberPresence } from "../types/chat.types";

export const SAMPLE_ONLINE_MEMBERS: ChatMemberPresence[] = [
  {
    user_id: "usr-admin-01",
    full_name: "Bambang Pamungkas",
    display_name: "Bambang (Ketua)",
    username: "bambang_rc",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "chairman",
    member_number: "BMC-2026-0001",
    status: "online",
  },
  {
    user_id: "usr-road-03",
    full_name: "Kapten Hendra",
    display_name: "Kapten Hendra (RC)",
    username: "hendra_rc",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "event_officer",
    member_number: "BMC-2026-0005",
    status: "online",
  },
  {
    user_id: "usr-mod-04",
    full_name: "Rian Hidayat",
    display_name: "Rian (Mod)",
    username: "rian_mod",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    role: "moderator",
    member_number: "BMC-2026-0012",
    status: "idle",
  },
  {
    user_id: "usr-mem-02",
    full_name: "Dimas Arya",
    display_name: "Dimas",
    username: "dimas_ride",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "member",
    member_number: "BMC-2026-0042",
    status: "online",
  },
  {
    user_id: "usr-mem-05",
    full_name: "Agus Pratama",
    display_name: "Agus Pontianak",
    username: "agus_ptk",
    avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    role: "member",
    member_number: "BMC-2026-0088",
    status: "offline",
    last_seen: "10 menit yang lalu",
  },
];

export function subscribePresence(
  user: {
    id: string;
    fullName: string;
    displayName: string;
    role: any;
    avatarUrl?: string | null;
  },
  onSync: (members: ChatMemberPresence[]) => void
) {
  try {
    const supabase = createBrowserSupabase();
    const channel = supabase.channel("community_chat_presence", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeMembers: ChatMemberPresence[] = [];

        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          if (presences && presences.length > 0) {
            const p = presences[0];
            activeMembers.push({
              user_id: p.user_id || key,
              full_name: p.full_name || "Anggota",
              display_name: p.display_name || "Bikers",
              avatar_url: p.avatar_url || null,
              role: p.role || "member",
              status: "online",
            });
          }
        });

        if (activeMembers.length > 0) {
          onSync(activeMembers);
        } else {
          onSync(SAMPLE_ONLINE_MEMBERS);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            full_name: user.fullName,
            display_name: user.displayName,
            avatar_url: user.avatarUrl,
            role: user.role,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("[presence.service] Realtime presence unavailable, using fallback:", err);
    onSync(SAMPLE_ONLINE_MEMBERS);
    return () => {};
  }
}

