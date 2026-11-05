"use client";

import * as React from "react";
import { Hash, Compass, Megaphone, ArrowDown } from "lucide-react";
import { ChatMessage, ChatRoom, ChatSenderProfile } from "../types/chat.types";
import { MessageItem } from "./MessageItem";

export function MessageList({
  room,
  messages,
  currentUser,
  onReply,
  onReact,
  onDelete,
  onReport,
  onPin,
  onInspectMember,
}: {
  room: ChatRoom;
  messages: ChatMessage[];
  currentUser?: ChatSenderProfile | null;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (message: ChatMessage) => void;
  onPin?: (messageId: string) => void;
  onInspectMember?: (sender: ChatSenderProfile) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = React.useState(false);

  const scrollToBottom = (smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  React.useEffect(() => {
    scrollToBottom(false);
  }, [room.id]);

  React.useEffect(() => {
    // If near bottom, auto scroll
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        scrollToBottom(true);
      }
    }
  }, [messages.length]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 250);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative"
    >
      {/* Room Header Greeting in Discord Style */}
      <div className="pt-8 pb-4 border-b border-white/5 space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-white">
          {room.icon === "Compass" ? (
            <Compass className="w-8 h-8 text-amber-400" />
          ) : room.icon === "Megaphone" ? (
            <Megaphone className="w-8 h-8 text-crimson" />
          ) : (
            <Hash className="w-8 h-8 text-bone-muted" />
          )}
        </div>
        <h2 className="text-2xl font-black text-bone tracking-tight">
          Selamat datang di #{room.name}!
        </h2>
        <p className="text-xs text-bone-muted max-w-xl leading-relaxed">
          {room.description ||
            `Ini adalah awal dari percakapan resmi di channel #${room.name}. Jaga rasa persaudaraan dan etika bikers.`}
        </p>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="py-12 text-center text-xs text-bone-muted/60">
          Belum ada percakapan. Jadilah yang pertama mengirim pesan!
        </div>
      ) : (
        <div className="space-y-1">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              currentUser={currentUser}
              onReply={onReply}
              onReact={onReact}
              onDelete={onDelete}
              onReport={onReport}
              onPin={onPin}
              onInspectMember={onInspectMember}
            />
          ))}
        </div>
      )}

      {/* Scroll to bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-24 right-72 z-20 p-2.5 rounded-full bg-crimson hover:bg-crimson-hover text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
          title="Scroll ke pesan terbaru"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

