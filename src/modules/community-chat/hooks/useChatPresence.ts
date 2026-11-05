"use client";

import * as React from "react";
import { ChatMemberPresence, ChatSenderProfile } from "../types/chat.types";
import { subscribePresence, SAMPLE_ONLINE_MEMBERS } from "../services/presence.service";

export function useChatPresence(currentUser?: ChatSenderProfile | null) {
  const [members, setMembers] = React.useState<ChatMemberPresence[]>(SAMPLE_ONLINE_MEMBERS);

  React.useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribePresence(
      {
        id: currentUser.id,
        fullName: currentUser.full_name,
        displayName: currentUser.display_name,
        role: currentUser.role,
        avatarUrl: currentUser.avatar_url,
      },
      (synced) => {
        setMembers(synced);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const onlineMembers = React.useMemo(() => {
    return members.filter((m) => m.status === "online" || m.status === "idle");
  }, [members]);

  const offlineMembers = React.useMemo(() => {
    return members.filter((m) => m.status === "offline");
  }, [members]);

  return {
    members,
    onlineMembers,
    offlineMembers,
    onlineCount: onlineMembers.length,
    totalCount: members.length,
  };
}

