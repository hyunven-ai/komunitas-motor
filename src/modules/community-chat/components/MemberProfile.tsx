"use client";

import * as React from "react";
import Image from "next/image";
import { Shield, Bike, Calendar, Hash, MapPin, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMemberPresence, ChatSenderProfile } from "../types/chat.types";
import { getRoleBadgeConfig } from "../utils/chat-permissions";
import { getInitials } from "../utils/chat-format";

export function MemberProfileModal({
  member,
  onClose,
  onStartDirectMessage,
}: {
  member: ChatMemberPresence | ChatSenderProfile | null;
  onClose: () => void;
  onStartDirectMessage?: (userId: string) => void;
}) {
  if (!member) return null;

  const roleConfig = getRoleBadgeConfig(member.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#12141C] border border-white/10 shadow-2xl overflow-hidden">
        {/* Banner with Biker Crimson Gradient */}
        <div className="h-24 bg-gradient-to-r from-red-900/60 via-zinc-900 to-black relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-bone-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar + Main info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="relative -mt-12 mb-3 inline-block">
            <div className="w-20 h-20 rounded-full ring-4 ring-[#12141C] bg-[#181B26] overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-black text-bone tracking-wider">
                  {getInitials(member.full_name)}
                </span>
              )}
            </div>
            {"status" in member && (
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2 ring-[#12141C] ${
                  member.status === "online"
                    ? "bg-emerald-500"
                    : member.status === "idle"
                    ? "bg-amber-500"
                    : "bg-zinc-600"
                }`}
              />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-bone">{member.full_name}</h3>
              {member.username && (
                <span className="text-xs text-bone-muted">@{member.username}</span>
              )}
            </div>
            <p className="text-xs text-bone-muted">
              {member.display_name}
            </p>
          </div>

          {/* Badges */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] uppercase font-bold tracking-wider ${roleConfig.badgeClass}`}>
              {roleConfig.label}
            </Badge>
            {member.member_number && (
              <Badge variant="outline" className="text-[10px] border-white/10 text-amber-400">
                {member.member_number}
              </Badge>
            )}
          </div>

          {/* Metadata Cards */}
          <div className="mt-5 space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-center gap-3">
              <Shield className="w-4 h-4 text-crimson shrink-0" />
              <div>
                <span className="text-[10px] text-bone-muted block uppercase">Status Keanggotaan</span>
                <span className="font-semibold text-bone">Anggota Terverifikasi Borneo Brotherhood</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-bone-muted block uppercase">Domisili Chapter</span>
                <span className="font-semibold text-bone">Kalimantan Barat (Pontianak)</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-2">
            <Button
              onClick={() => {
                if (onStartDirectMessage) {
                  onStartDirectMessage("user_id" in member ? member.user_id : member.id);
                }
                onClose();
              }}
              className="w-full bg-crimson hover:bg-crimson-hover text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Kirim Pesan Langsung
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

