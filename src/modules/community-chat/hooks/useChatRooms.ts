"use client";

import * as React from "react";
import { ChatRoom, ChatRoomCategory } from "../types/chat.types";
import { fetchChatRooms, groupRoomsByCategory, DEFAULT_CHAT_ROOMS } from "../services/room.service";

export function useChatRooms(initialSlug = "general") {
  const [rooms, setRooms] = React.useState<ChatRoom[]>(DEFAULT_CHAT_ROOMS);
  const [activeSlug, setActiveSlug] = React.useState<string>(initialSlug);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const data = await fetchChatRooms();
      if (mounted) {
        setRooms(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const activeRoom = React.useMemo(() => {
    return rooms.find((r) => r.slug === activeSlug) || rooms[0] || null;
  }, [rooms, activeSlug]);

  const filteredRooms = React.useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }, [rooms, searchQuery]);

  const groupedRooms = React.useMemo(() => {
    return groupRoomsByCategory(filteredRooms);
  }, [filteredRooms]);

  return {
    rooms,
    groupedRooms,
    activeRoom,
    activeSlug,
    setActiveSlug,
    loading,
    searchQuery,
    setSearchQuery,
  };
}

