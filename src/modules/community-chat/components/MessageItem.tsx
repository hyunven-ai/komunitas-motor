"use client";

import * as React from "react";
import Image from "next/image";
import {
  Smile,
  Reply,
  Copy,
  Pin,
  Trash2,
  Flag,
  Check,
  Shield,
  FileText,
} from "lucide-react";
import { ChatMessage, ChatSenderProfile } from "../types/chat.types";
import { getRoleBadgeConfig, canDeleteMessage, canPinMessage } from "../utils/chat-permissions";
import { formatChatTimestamp, getInitials } from "../utils/chat-format";
import { EmojiPicker } from "./EmojiPicker";

export function MessageItem({
  message,
  currentUser,
  onReply,
  onReact,
  onDelete,
  onReport,
  onPin,
  onInspectMember,
}: {
  message: ChatMessage;
  currentUser?: ChatSenderProfile | null;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (message: ChatMessage) => void;
  onPin?: (messageId: string) => void;
  onInspectMember?: (sender: ChatSenderProfile) => void;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const roleConfig = getRoleBadgeConfig(message.sender.role);
  const isOwn = currentUser?.id === message.sender.id;
  const canDelete = currentUser ? canDeleteMessage(currentUser.id, message.sender.id, currentUser.role) : false;
  const canPin = currentUser ? canPinMessage(currentUser.role) : false;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative flex gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors rounded-lg ${
        message.is_pinned ? "bg-amber-500/[0.04] border-l-2 border-amber-500/50" : ""
      }`}
    >
      {/* Sender Avatar */}
      <div className="shrink-0 pt-0.5">
        <button
          onClick={() => onInspectMember && onInspectMember(message.sender)}
          className="w-10 h-10 rounded-full bg-[#181B26] overflow-hidden flex items-center justify-center border border-white/10 hover:opacity-80 transition-opacity"
        >
          {message.sender.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-bone">
              {getInitials(message.sender.full_name)}
            </span>
          )}
        </button>
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Reply reference if present */}
        {message.reply_message && (
          <div className="flex items-center gap-1.5 text-xs text-bone-muted/70 mb-1 pl-1 border-l-2 border-white/20">
            <span className="font-semibold text-bone-muted">
              @{message.reply_message.sender_name}:
            </span>
            <span className="truncate max-w-md italic">
              {message.reply_message.content}
            </span>
          </div>
        )}

        {/* Sender meta bar */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <button
            onClick={() => onInspectMember && onInspectMember(message.sender)}
            className="text-sm font-bold hover:underline transition-all"
            style={{ color: message.sender.role !== "member" ? roleConfig.colorHex : "#F5F5F2" }}
          >
            {message.sender.display_name || message.sender.full_name}
          </button>

          {message.sender.role !== "member" && (
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${roleConfig.badgeClass}`}
            >
              {roleConfig.label}
            </span>
          )}

          <span className="text-[11px] text-bone-muted/60">
            {formatChatTimestamp(message.created_at)}
          </span>

          {message.is_edited && (
            <span className="text-[10px] text-bone-muted/50 italic">(diedit)</span>
          )}

          {message.is_pinned && (
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
              <Pin className="w-2.5 h-2.5" /> Tersemat
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="mt-1 text-sm text-bone/90 leading-relaxed break-words whitespace-pre-wrap font-sans">
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((att) => {
              if (att.file_type === "image") {
                return (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-white/10 max-w-sm hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={att.file_url}
                      alt={att.file_name}
                      className="max-h-60 w-auto object-cover rounded-lg"
                    />
                  </a>
                );
              }
              return (
                <a
                  key={att.id}
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#181B26] border border-white/10 hover:border-crimson text-xs text-bone transition-colors"
                >
                  <FileText className="w-4 h-4 text-crimson" />
                  <span className="truncate max-w-xs">{att.file_name}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Reactions row */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {message.reactions.map((r) => {
              const hasReacted = currentUser
                ? r.user_ids.includes(currentUser.id)
                : false;
              return (
                <button
                  key={r.emoji}
                  onClick={() => onReact(message.id, r.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                    hasReacted
                      ? "bg-crimson/20 border-crimson/50 text-white font-bold"
                      : "bg-[#181B26] border-white/10 text-bone-muted hover:border-white/30"
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span className="text-[11px] font-mono">{r.count}</span>
                </button>
              );
            })}

            {/* Quick add reaction button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-2 py-0.5 rounded-full text-xs bg-[#181B26] border border-white/5 text-bone-muted hover:text-white hover:border-white/20 transition-colors"
              title="Tambah reaksi"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Bar on Hover */}
      <div className="absolute right-4 -top-3.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#12141C] border border-white/10 rounded-md shadow-xl flex items-center p-0.5 z-10">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 text-bone-muted hover:text-amber-400 hover:bg-white/5 rounded transition-colors"
          title="Tambah Reaksi"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onReply(message)}
          className="p-1.5 text-bone-muted hover:text-blue-400 hover:bg-white/5 rounded transition-colors"
          title="Balas Pesan"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleCopy}
          className="p-1.5 text-bone-muted hover:text-white hover:bg-white/5 rounded transition-colors"
          title="Salin Teks"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {canPin && onPin && (
          <button
            onClick={() => onPin(message.id)}
            className="p-1.5 text-bone-muted hover:text-amber-400 hover:bg-white/5 rounded transition-colors"
            title="Sematkan Pesan"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}

        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(message.id)}
            className="p-1.5 text-bone-muted hover:text-crimson hover:bg-white/5 rounded transition-colors"
            title="Hapus Pesan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {!isOwn && onReport && (
          <button
            onClick={() => onReport(message)}
            className="p-1.5 text-bone-muted hover:text-red-400 hover:bg-white/5 rounded transition-colors"
            title="Laporkan Pesan ke Moderator"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute right-4 top-4 z-30">
          <EmojiPicker
            onSelect={(emoji) => {
              onReact(message.id, emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
}

