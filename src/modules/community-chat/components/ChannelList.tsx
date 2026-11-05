"use client";

import * as React from "react";
import {
  Hash,
  Compass,
  Megaphone,
  Coffee,
  Calendar,
  Wrench,
  MapPin,
  Map,
  Users,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";
import { ChatRoom, ChatRoomCategory } from "../types/chat.types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Hash,
  Compass,
  Megaphone,
  Coffee,
  Calendar,
  Wrench,
  MapPin,
  Map,
  Users,
};

export function ChannelList({
  groupedRooms,
  activeSlug,
  onSelectRoom,
}: {
  groupedRooms: Record<ChatRoomCategory, ChatRoom[]>;
  activeSlug: string;
  onSelectRoom: (slug: string) => void;
}) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categories: ChatRoomCategory[] = ["COMMUNITY", "RIDING & EVENTS", "CHAPTERS"];

  return (
    <div className="space-y-4 px-2 py-3 select-none">
      {categories.map((cat) => {
        const rooms = groupedRooms[cat] || [];
        if (rooms.length === 0) return null;
        const isCollapsed = collapsed[cat];

        return (
          <div key={cat} className="space-y-0.5">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-black tracking-wider text-bone-muted/70 uppercase hover:text-bone transition-colors"
            >
              <div className="flex items-center gap-1">
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-bone-muted/50" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-bone-muted/50" />
                )}
                <span>{cat}</span>
              </div>
              <span className="text-[9px] font-mono opacity-50">{rooms.length}</span>
            </button>

            {/* Channels list */}
            {!isCollapsed && (
              <div className="space-y-0.5 pt-0.5">
                {rooms.map((room) => {
                  const isActive = room.slug === activeSlug;
                  const Icon = ICON_MAP[room.icon || "Hash"] || Hash;

                  return (
                    <button
                      key={room.id}
                      onClick={() => onSelectRoom(room.slug)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all group ${
                        isActive
                          ? "bg-white/10 text-white font-bold"
                          : "text-bone-muted hover:bg-white/5 hover:text-bone"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {room.is_private ? (
                          <Lock className="w-4 h-4 text-amber-500/80 shrink-0" />
                        ) : (
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? "text-crimson" : "text-bone-muted/60 group-hover:text-bone"
                            }`}
                          />
                        )}
                        <span className="text-xs truncate">{room.name}</span>
                      </div>

                      {room.unread_count && room.unread_count > 0 ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-crimson text-white text-[10px] font-bold font-mono">
                          {room.unread_count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

