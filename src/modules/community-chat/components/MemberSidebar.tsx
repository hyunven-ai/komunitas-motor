"use client";

import * as React from "react";
import Image from "next/image";
import { Shield, Users, Search } from "lucide-react";
import { ChatMemberPresence } from "../types/chat.types";
import { getRoleBadgeConfig } from "../utils/chat-permissions";
import { getInitials } from "../utils/chat-format";

export function MemberSidebar({
  members,
  onSelectMember,
}: {
  members: ChatMemberPresence[];
  onSelectMember: (member: ChatMemberPresence) => void;
}) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.display_name.toLowerCase().includes(q) ||
        (m.username && m.username.toLowerCase().includes(q))
    );
  }, [members, search]);

  const leadership = filtered.filter((m) =>
    ["super_admin", "chairman", "admin", "event_officer"].includes(m.role)
  );
  const moderators = filtered.filter((m) => m.role === "moderator");
  const onlineMembers = filtered.filter(
    (m) =>
      !["super_admin", "chairman", "admin", "event_officer", "moderator"].includes(m.role) &&
      (m.status === "online" || m.status === "idle")
  );
  const offlineMembers = filtered.filter((m) => m.status === "offline");

  const renderGroup = (title: string, groupMembers: ChatMemberPresence[]) => {
    if (groupMembers.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="text-[10px] font-black tracking-wider text-bone-muted/70 uppercase px-3 mb-1.5 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-[9px] font-mono">{groupMembers.length}</span>
        </h4>
        <div className="space-y-0.5">
          {groupMembers.map((m) => {
            const roleConfig = getRoleBadgeConfig(m.role);
            const isOnline = m.status === "online";
            const isIdle = m.status === "idle";

            return (
              <button
                key={m.user_id}
                onClick={() => onSelectMember(m)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-left transition-colors group"
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#181B26] overflow-hidden flex items-center justify-center border border-white/5">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-bone">
                        {getInitials(m.full_name)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#0B0D12] ${
                      isOnline
                        ? "bg-emerald-500"
                        : isIdle
                        ? "bg-amber-500"
                        : "bg-zinc-600"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        m.role !== "member" ? "text-bone" : "text-bone-muted group-hover:text-bone"
                      }`}
                      style={{ color: m.role !== "member" ? roleConfig.colorHex : undefined }}
                    >
                      {m.display_name || m.full_name}
                    </span>
                    {m.role !== "member" && (
                      <Shield
                        className="w-3 h-3 shrink-0"
                        style={{ color: roleConfig.colorHex }}
                      />
                    )}
                  </div>
                  <div className="text-[10px] text-bone-muted/60 truncate">
                    {m.member_number || "Anggota"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-60 h-full bg-[#0B0D12] border-l border-white/5 flex flex-col shrink-0">
      {/* Search Filter */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-bone-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari anggota..."
            className="w-full bg-[#12141C] border border-white/10 rounded-md pl-8 pr-2.5 py-1 text-xs text-bone placeholder:text-bone-muted/50 focus:outline-none focus:border-crimson"
          />
        </div>
      </div>

      {/* Member list scroll */}
      <div className="flex-1 overflow-y-auto p-2">
        {renderGroup("PENGURUS & ROAD CAPTAIN", leadership)}
        {renderGroup("MODERATOR", moderators)}
        {renderGroup("ANGGOTA ONLINE", onlineMembers)}
        {renderGroup("OFFLINE", offlineMembers)}
      </div>
    </aside>
  );
}

