"use client";

import * as React from "react";
import { ChatRoom, ChatSenderProfile, ChatMemberPresence, ChatMessage } from "../types/chat.types";
import { useChatRooms } from "../hooks/useChatRooms";
import { useChatMessages } from "../hooks/useChatMessages";
import { useChatPresence } from "../hooks/useChatPresence";
import { useChatTyping } from "../hooks/useChatTyping";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { MemberSidebar } from "./MemberSidebar";
import { MemberProfileModal } from "./MemberProfile";
import { TypingIndicator } from "./TypingIndicator";
import { submitMessageReport } from "../services/moderation.service";

export function ChatLayout({
  initialSlug = "general",
  currentUser,
}: {
  initialSlug?: string;
  currentUser?: ChatSenderProfile | null;
}) {
  const [showMembers, setShowMembers] = React.useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [inspectedMember, setInspectedMember] = React.useState<ChatSenderProfile | ChatMemberPresence | null>(null);

  // Hook 1: Rooms & categories
  const {
    groupedRooms,
    activeRoom,
    activeSlug,
    setActiveSlug,
    searchQuery,
    setSearchQuery,
  } = useChatRooms(initialSlug);

  // Hook 2: Messages in active room
  const {
    messages,
    sendMessage,
    toggleReaction,
    deleteMessage,
    replyingTo,
    setReplyingTo,
    isRealtimeConnected,
  } = useChatMessages({
    roomSlug: activeSlug,
    roomId: activeRoom?.id,
    currentUser,
  });

  // Hook 3: Realtime presence
  const { members, onlineCount } = useChatPresence(currentUser);

  // Hook 4: Typing indicator
  const { typingLabel, sendTyping } = useChatTyping(
    activeSlug,
    currentUser?.display_name || currentUser?.full_name
  );

  const handleSelectRoom = (slug: string) => {
    setActiveSlug(slug);
    setMobileSidebarOpen(false);
  };

  const handleReport = async (msg: ChatMessage) => {
    const reason = window.prompt("Alasan melaporkan pesan ini ke moderator:");
    if (!reason || !reason.trim() || !currentUser) return;

    const res = await submitMessageReport({
      messageId: msg.id,
      reporterId: currentUser.id,
      reason: reason.trim(),
    });
    alert(res.message);
  };

  if (!activeRoom) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0B0D12] text-bone-muted text-sm">
        Memuat ruang obrolan...
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#07080C] text-bone flex overflow-hidden font-sans select-text">
      {/* 1. Left Channel Sidebar (Desktop & Mobile Drawer) */}
      <div
        className={`${
          mobileSidebarOpen ? "fixed inset-0 z-40 flex" : "hidden md:flex shrink-0"
        }`}
      >
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <div className="relative z-50 h-full">
          <ChatSidebar
            groupedRooms={groupedRooms}
            activeSlug={activeSlug}
            onSelectRoom={handleSelectRoom}
            currentUser={currentUser}
            onlineCount={onlineCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
          />
        </div>
      </div>

      {/* 2. Center Column: Chat Stream & Composer */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0D12] relative">
        <ChatHeader
          room={activeRoom}
          showMembers={showMembers}
          onToggleMembers={() => setShowMembers(!showMembers)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          pinnedCount={messages.filter((m) => m.is_pinned).length}
          isRealtimeConnected={isRealtimeConnected}
        />

        <MessageList
          room={activeRoom}
          messages={messages}
          currentUser={currentUser}
          onReply={(msg) => setReplyingTo(msg)}
          onReact={toggleReaction}
          onDelete={deleteMessage}
          onReport={handleReport}
          onInspectMember={(sender) => setInspectedMember(sender)}
        />

        {/* Realtime Typing Indicator */}
        <div className="px-4">
          <TypingIndicator label={typingLabel} />
        </div>

        {/* Composer Input */}
        <MessageInput
          room={activeRoom}
          currentUser={currentUser}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSendMessage={sendMessage}
          onTyping={sendTyping}
        />
      </div>

      {/* 3. Right Column: Members Presence Sidebar */}
      {showMembers && (
        <div className="hidden lg:flex shrink-0">
          <MemberSidebar
            members={members}
            onSelectMember={(m) => setInspectedMember(m)}
          />
        </div>
      )}

      {/* Member Profile Modal */}
      {inspectedMember && (
        <MemberProfileModal
          member={inspectedMember}
          onClose={() => setInspectedMember(null)}
          onStartDirectMessage={(uid) => {
            alert(`Pesan langsung ke anggota ${uid} sedang disiapkan.`);
          }}
        />
      )}
    </div>
  );
}

