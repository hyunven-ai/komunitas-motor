import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { ChatRoom, ChatRoomCategory } from "../types/chat.types";

export const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  // Community
  {
    id: "4e966ba6-7ce8-4c84-b97b-87a2556c45a9",
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
    id: "a0356c96-847c-45ad-aa91-a9a07e77f1f1",
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
    id: "823e7240-3533-4f69-90fc-07c25b442e77",
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
    unread_count: 0,
  },
  {
    id: "0b9828dc-7375-4ee8-8a56-b329e35147b4",
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
    id: "9ae350a2-0785-4330-90b4-c53680a72adc",
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
    unread_count: 0,
  },
  {
    id: "cb3f863a-d544-4abd-8636-2db2a6176848",
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
    id: "29c7e2b4-9752-42b4-8583-f867691525c2",
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
    id: "a64f1bb0-3fb4-44b6-a2b4-62107bdfda64",
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
    id: "53210682-9929-4b6b-9645-80155ec44927",
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
    id: "b65ebf9c-7c12-4ac3-aa8a-b510a76bb1e0",
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
    id: "6582935b-7679-45b8-8c42-5a7726a3cf91",
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

    return (data as any[]).map((room: any) => ({
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

