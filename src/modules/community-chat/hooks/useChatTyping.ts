"use client";

import * as React from "react";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useChatTyping(
  roomSlugOrId?: string,
  currentUserName?: string
) {
  const [typingUsers, setTypingUsers] = React.useState<Map<string, number>>(new Map());
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  // Subscribe to typing broadcasts on the unified room channel
  React.useEffect(() => {
    if (!roomSlugOrId) return;

    try {
      const supabase = createBrowserSupabase();
      const channelName = `community_chat_${roomSlugOrId}`;
      const channel = supabase
        .channel(channelName, {
          config: { broadcast: { self: false } },
        })
        .on("broadcast", { event: "typing" }, (payload: { payload: { user_name?: string } }) => {
          const { user_name } = payload.payload || {};
          if (user_name && user_name !== currentUserName) {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              next.set(user_name, Date.now() + 2500);
              return next;
            });
          }
        })
        .subscribe();

      channelRef.current = channel;

      // Interval to clean up stale typing indicators
      const interval = setInterval(() => {
        const now = Date.now();
        setTypingUsers((prev) => {
          let hasExpired = false;
          const next = new Map(prev);
          for (const [user, expiry] of next.entries()) {
            if (expiry <= now) {
              next.delete(user);
              hasExpired = true;
            }
          }
          return hasExpired ? next : prev;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        channelRef.current = null;
      };
    } catch {
      // Fallback
    }
  }, [roomSlugOrId, currentUserName]);

  // Broadcast current user typing
  const sendTyping = React.useCallback(() => {
    if (!roomSlugOrId || !currentUserName || !channelRef.current) return;
    try {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { user_name: currentUserName },
      });
    } catch {
      // Fallback
    }
  }, [roomSlugOrId, currentUserName]);

  const activeTypers = Array.from(typingUsers.keys());

  const typingLabel = React.useMemo(() => {
    if (activeTypers.length === 0) return null;
    if (activeTypers.length === 1) return `${activeTypers[0]} sedang mengetik...`;
    if (activeTypers.length === 2) return `${activeTypers[0]} dan ${activeTypers[1]} sedang mengetik...`;
    return `${activeTypers[0]} dan ${activeTypers.length - 1} lainnya sedang mengetik...`;
  }, [activeTypers]);

  return {
    isAnyoneTyping: activeTypers.length > 0,
    typingLabel,
    sendTyping,
  };
}
