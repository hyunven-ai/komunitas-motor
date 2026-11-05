"use client";

import * as React from "react";
import {
  Send,
  Paperclip,
  Smile,
  X,
  Lock,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { ChatMessage, ChatRoom, ChatSenderProfile } from "../types/chat.types";
import { canSendMessageInRoom } from "../utils/chat-permissions";
import { EmojiPicker } from "./EmojiPicker";

export function MessageInput({
  room,
  currentUser,
  replyingTo,
  onCancelReply,
  onSendMessage,
  onTyping,
}: {
  room: ChatRoom;
  currentUser?: ChatSenderProfile | null;
  replyingTo?: ChatMessage | null;
  onCancelReply: () => void;
  onSendMessage: (content: string, attachments?: any[]) => void;
  onTyping?: () => void;
}) {
  const [text, setText] = React.useState("");
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const permission = currentUser
    ? canSendMessageInRoom({
        roles: currentUser.role,
        isRoomReadOnly: room.is_read_only,
      })
    : { allowed: false, reason: "Silakan login untuk mengirim pesan." };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (onTyping) onTyping();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (!permission.allowed) return;

    onSendMessage(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImage = file.type.startsWith("image/");

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", room.slug || room.id);

      const res = await fetch("/api/chat/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        onSendMessage(text || (isImage ? "Foto dibagikan:" : `File: ${file.name}`), [
          {
            id: `att_${Date.now()}`,
            message_id: "tmp",
            file_name: json.data.file_name,
            file_url: json.data.file_url,
            file_type: json.data.file_type,
            file_size: json.data.file_size,
            mime_type: json.data.mime_type,
          },
        ]);
        setText("");
      } else {
        alert(json.message || "Gagal mengunggah lampiran.");
      }
    } catch (err) {
      console.error("Chat upload failed:", err);
      alert("Terjadi kendala saat mengunggah ke Cloudflare R2 storage.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!permission.allowed) {
    return (
      <div className="p-3 mx-4 mb-4 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center gap-3 text-xs text-bone-muted">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <span>{permission.reason}</span>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 relative">
      {/* Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-1 bg-[#181B26] border border-white/10 rounded-t-lg text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-bone-muted">Membalas</span>
            <span className="font-bold text-amber-400">
              @{replyingTo.sender.display_name}:
            </span>
            <span className="italic text-bone-muted/80 truncate max-w-sm">
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-bone-muted hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-xl bg-[#12141C] border border-white/10 focus-within:border-crimson/80 focus-within:ring-1 focus-within:ring-crimson/50 transition-all flex flex-col p-2.5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Kirim pesan ke #${room.name}...`}
          rows={1}
          className="w-full bg-transparent text-sm text-bone placeholder:text-bone-muted/50 resize-none focus:outline-none max-h-36 py-1 leading-relaxed"
        />

        {/* Composer bottom controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
          <div className="flex items-center gap-1">
            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-bone-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
              title="Unggah lampiran / foto ke Cloudflare R2"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-crimson" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-bone-muted hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors"
              title="Pilih emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="p-2 rounded-lg bg-crimson hover:bg-crimson-hover disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute left-10 bottom-14 z-30">
            <EmojiPicker
              onSelect={(emoji) => {
                setText((prev) => `${prev} ${emoji}`);
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

