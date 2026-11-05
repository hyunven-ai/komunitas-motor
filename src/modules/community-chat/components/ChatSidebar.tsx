"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Search,
  ArrowLeft,
  Volume2,
  VolumeX,
  Settings,
  Plus,
} from "lucide-react";
import { ChatRoom, ChatRoomCategory, ChatSenderProfile } from "../types/chat.types";
import { ChannelList } from "./ChannelList";
import { getInitials } from "../utils/chat-format";
import { isChatAdmin } from "../utils/chat-permissions";

export function ChatSidebar({
  groupedRooms,
  activeSlug,
  onSelectRoom,
  currentUser,
  onlineCount = 0,
  searchQuery,
  onSearchChange,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenCreateRoom,
}: {
  groupedRooms: Record<ChatRoomCategory, ChatRoom[]>;
  activeSlug: string;
  onSelectRoom: (slug: string) => void;
  currentUser?: ChatSenderProfile | null;
  onlineCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
  onOpenCreateRoom?: () => void;
}) {
  const isAdmin = currentUser ? isChatAdmin(currentUser.role) : false;

  return (
    <aside className="w-64 h-full bg-[#0B0D12] border-r border-white/5 flex flex-col shrink-0">
      {/* Community Header Banner */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center shrink-0 shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black tracking-wide text-bone uppercase truncate">
              BORNEO CHAT
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineCount} Online</span>
            </div>
          </div>
        </div>

        <Link
          href="/member"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-bone-muted hover:text-white transition-colors"
          title="Kembali ke Dashboard Member"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Search Input */}
      <div className="p-2.5 pb-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-bone-muted/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari channel..."
            className="w-full bg-[#12141C] border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-bone placeholder:text-bone-muted/50 focus:outline-none focus:border-crimson"
          />
        </div>
      </div>

      {/* Admin create channel button */}
      {isAdmin && onOpenCreateRoom && (
        <div className="px-2.5 pt-2">
          <button
            onClick={onOpenCreateRoom}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed border-white/10 hover:border-crimson/50 text-[11px] font-semibold text-bone-muted hover:text-bone bg-white/[0.02] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-crimson" />
            <span>Tambah Channel</span>
          </button>
        </div>
      )}

      {/* Channels List scroll */}
      <div className="flex-1 overflow-y-auto">
        <ChannelList
          groupedRooms={groupedRooms}
          activeSlug={activeSlug}
          onSelectRoom={onSelectRoom}
        />
      </div>

      {/* User Status Bar at the Bottom */}
      {currentUser ? (
        <div className="p-2 bg-[#07080C] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#181B26] overflow-hidden flex items-center justify-center border border-white/10">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-bone">
                    {getInitials(currentUser.full_name)}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#07080C]" />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold text-bone truncate">
                {currentUser.display_name || currentUser.full_name}
              </div>
              <div className="text-[10px] text-bone-muted/60 truncate font-mono">
                {currentUser.member_number || "Online"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded hover:bg-white/10 text-bone-muted hover:text-white transition-colors"
              title={soundEnabled ? "Matikan Suara Notifikasi" : "Nyalakan Suara Notifikasi"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded hover:bg-white/10 text-bone-muted hover:text-white transition-colors"
                title="Pengaturan Chat"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-[#07080C] border-t border-white/5 text-center">
          <Link
            href="/login?redirectTo=/community/chat"
            className="text-xs text-crimson hover:underline font-semibold"
          >
            Login untuk Bergabung Diskusi →
          </Link>
        </div>
      )}
    </aside>
  );
}

