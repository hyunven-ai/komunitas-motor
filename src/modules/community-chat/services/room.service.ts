import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { ChatRoom, ChatRoomCategory } from "../types/chat.types";

export const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  // Community
  {
    id: "room-gen-001",
    name: "general",
    slug: "general",
    description: "Obrolan santai seputar komunitas motor dan brotherhood.",
    category: "COMMUNITY",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Hash",
    position: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },
  {
    id: "room-intro-002",
    name: "perkenalan",
    slug: "introductions",
    description: "Ruang perkenalan bagi anggota baru Borneo Brotherhood.",
    category: "COMMUNITY",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Users",
    position: 2,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },
  {
    id: "room-ann-003",
    name: "pengumuman",
    slug: "announcements",
    description: "Pemberitahuan resmi dari Dewan Pengurus & Komite.",
    category: "COMMUNITY",
    room_type: "channel",
    is_private: false,
    is_read_only: true,
    icon: "Megaphone",
    position: 3,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 1,
  },
  {
    id: "room-rnd-004",
    name: "santai-random",
    slug: "random",
    description: "Topik bebas, guyonan santai, dan berbagi cerita aspal.",
    category: "COMMUNITY",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Coffee",
    position: 4,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },

  // Riding & Events
  {
    id: "room-tour-010",
    name: "agenda-touring",
    slug: "touring",
    description: "Koordinasi touring lintas kota dan ekspedisi Borneo.",
    category: "RIDING & EVENTS",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Compass",
    position: 10,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 3,
  },
  {
    id: "room-ev-011",
    name: "event-mendatang",
    slug: "upcoming-events",
    description: "Diskusi seputar agenda kumpul, anniversary, dan baksos.",
    category: "RIDING & EVENTS",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Calendar",
    position: 11,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },
  {
    id: "room-mc-012",
    name: "bincang-motor",
    slug: "motorcycle-talk",
    description: "Tips modifikasi, perawatan mesin, ban, suspensi & riding gear.",
    category: "RIDING & EVENTS",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Wrench",
    position: 12,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },
  {
    id: "room-rep-013",
    name: "catatan-perjalanan",
    slug: "ride-reports",
    description: "Foto dan cerita keseruan setelah ekspedisi touring.",
    category: "RIDING & EVENTS",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "MapPin",
    position: 13,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },

  // Chapters
  {
    id: "room-ptk-020",
    name: "chapter-pontianak",
    slug: "pontianak",
    description: "Ruang komunikasi resmi anggota Chapter Pontianak.",
    category: "CHAPTERS",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Map",
    position: 20,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },
  {
    id: "room-skw-021",
    name: "chapter-singkawang",
    slug: "singkawang",
    description: "Ruang komunikasi resmi anggota Chapter Singkawang.",
    category: "CHAPTERS",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Map",
    position: 21,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },
  {
    id: "room-mpw-022",
    name: "chapter-mempawah",
    slug: "mempawah",
    description: "Ruang komunikasi resmi anggota Chapter Mempawah.",
    category: "CHAPTERS",
    room_type: "channel",
    is_private: false,
    is_read_only: false,
    icon: "Map",
    position: 22,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    unread_count: 0,
  },
];

export async function fetchChatRooms(): Promise<ChatRoom[]> {
  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("chat_rooms")
      .select("*")
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_CHAT_ROOMS;
    }

    return data.map((room) => ({
      id: room.id,
      name: room.name,
      slug: room.slug,
      description: room.description,
      category: room.category as ChatRoomCategory,
      room_type: room.room_type,
      is_private: room.is_private,
      is_read_only: room.is_read_only,
      icon: room.icon || "Hash",
      position: room.position,
      created_by: room.created_by,
      created_at: room.created_at,
      updated_at: room.updated_at,
      unread_count: 0,
    }));
  } catch (err) {
    console.warn("[room.service] Using default rooms fallback:", err);
    return DEFAULT_CHAT_ROOMS;
  }
}

export function groupRoomsByCategory(rooms: ChatRoom[]): Record<ChatRoomCategory, ChatRoom[]> {
  const groups: Record<ChatRoomCategory, ChatRoom[]> = {
    COMMUNITY: [],
    "RIDING & EVENTS": [],
    CHAPTERS: [],
    DIRECT: [],
  };

  rooms.forEach((room) => {
    if (groups[room.category]) {
      groups[room.category].push(room);
    } else {
      groups.COMMUNITY.push(room);
    }
  });

  return groups;
}

