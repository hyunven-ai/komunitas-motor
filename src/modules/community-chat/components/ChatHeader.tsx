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
  Search,
  Pin,
  Menu,
} from "lucide-react";
import { ChatRoom } from "../types/chat.types";

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

export function ChatHeader({
  room,
  onToggleMembers,
  onToggleMobileSidebar,
  showMembers,
  pinnedCount = 0,
  onTogglePinned,
}: {
  room: ChatRoom;
  onToggleMembers: () => void;
  onToggleMobileSidebar?: () => void;
  showMembers: boolean;
  pinnedCount?: number;
  onTogglePinned?: () => void;
}) {
  const IconComponent = ICON_MAP[room.icon || "Hash"] || Hash;

  return (
    <header className="h-14 bg-[#0B0D12] border-b border-white/5 px-4 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 text-bone-muted hover:text-white rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <IconComponent className="w-5 h-5 text-bone-muted shrink-0" />
          <h1 className="text-base font-bold text-bone truncate">{room.name}</h1>
        </div>

        {room.description && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10 min-w-0">
            <p className="text-xs text-bone-muted truncate max-w-md">
              {room.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Pinned Messages Button */}
        {onTogglePinned && (
          <button
            onClick={onTogglePinned}
            className="p-2 text-bone-muted hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors relative"
            title="Pesan Tersemat"
          >
            <Pin className="w-4 h-4" />
            {pinnedCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        )}

        {/* Member sidebar toggle */}
        <button
          onClick={onToggleMembers}
          className={`p-2 rounded-lg transition-colors ${
            showMembers
              ? "text-bone bg-white/10"
              : "text-bone-muted hover:text-white hover:bg-white/5"
          }`}
          title="Daftar Anggota"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

