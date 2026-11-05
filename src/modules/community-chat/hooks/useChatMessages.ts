"use client";

import * as React from "react";
import { ChatMessage, ChatSenderProfile } from "../types/chat.types";
import { fetchMessagesByRoom } from "../services/message.service";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useChatMessages({
  roomSlug,
  roomId,
  currentUser,
}: {
  roomSlug: string;
  roomId?: string;
  currentUser?: ChatSenderProfile | null;
}) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [replyingTo, setReplyingTo] = React.useState<ChatMessage | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = React.useState<boolean>(false);
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  // 1. Initial Load of Messages
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const data = await fetchMessagesByRoom(roomSlug, roomId);
      if (mounted) {
        setMessages(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [roomSlug, roomId]);

  // 2. Realtime Subscription (Dual Engine: Broadcast + Postgres Changes)
  React.useEffect(() => {
    const channelName = `community_chat_${roomSlug || roomId || "general"}`;
    const supabase = createBrowserSupabase();

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    // A. Realtime Broadcast: Instant peer-to-peer relay (<50ms)
    channel
      .on("broadcast", { event: "new_message" }, (eventPayload: { payload: any }) => {
        const incoming = eventPayload.payload as ChatMessage;
        if (!incoming || !incoming.id) return;

        setMessages((prev) => {
          // If message already exists by id, skip
          if (prev.some((m) => m.id === incoming.id)) return prev;

          // If there is an optimistic temp message from same sender with identical content, replace it
          const tempIndex = prev.findIndex(
            (m) =>
              m.id.startsWith("msg_tmp_") &&
              m.sender_id === incoming.sender_id &&
              m.content === incoming.content
          );

          if (tempIndex !== -1) {
            const next = [...prev];
            next[tempIndex] = incoming;
            return next;
          }

          return [...prev, incoming];
        });
      })
      .on("broadcast", { event: "message_reaction" }, (eventPayload: { payload: any }) => {
        const { messageId, emoji, userId } = eventPayload.payload || {};
        if (!messageId || !emoji || !userId) return;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== messageId) return msg;
            const currentReactions = msg.reactions || [];
            const existing = currentReactions.find((r) => r.emoji === emoji);

            if (existing) {
              const already = existing.user_ids.includes(userId);
              const newUserIds = already
                ? existing.user_ids.filter((uid: string) => uid !== userId)
                : [...existing.user_ids, userId];

              if (newUserIds.length === 0) {
                return {
                  ...msg,
                  reactions: currentReactions.filter((r) => r.emoji !== emoji),
                };
              }

              return {
                ...msg,
                reactions: currentReactions.map((r) =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: newUserIds.length,
                        user_ids: newUserIds,
                        has_reacted: currentUser ? newUserIds.includes(currentUser.id) : false,
                      }
                    : r
                ),
              };
            } else {
              return {
                ...msg,
                reactions: [
                  ...currentReactions,
                  {
                    emoji,
                    count: 1,
                    user_ids: [userId],
                    has_reacted: currentUser ? userId === currentUser.id : false,
                  },
                ],
              };
            }
          })
        );
      })
      .on("broadcast", { event: "message_deleted" }, (eventPayload: { payload: any }) => {
        const { messageId } = eventPayload.payload || {};
        if (messageId) {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        }
      });

    // B. Postgres Changes: Catch direct inserts or admin actions from database
    if (roomId) {
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `room_id=eq.${roomId}`,
          },
          (payload: { new: any }) => {
            const newRecord = payload.new as any;
            if (!newRecord?.id) return;

            setMessages((prev) => {
              if (prev.some((m) => m.id === newRecord.id)) return prev;

              // Check if replacing an optimistic message
              const tempMatch = prev.find(
                (m) =>
                  m.id.startsWith("msg_tmp_") &&
                  m.content === newRecord.content &&
                  m.sender_id === newRecord.sender_id
              );

              if (tempMatch) {
                return prev.map((m) =>
                  m.id === tempMatch.id
                    ? { ...m, id: newRecord.id, created_at: newRecord.created_at }
                    : m
                );
              }

              const incoming: ChatMessage = {
                id: newRecord.id,
                room_id: newRecord.room_id,
                sender_id: newRecord.sender_id,
                content: newRecord.content,
                reply_to: newRecord.reply_to,
                message_type: newRecord.message_type || "text",
                is_edited: false,
                is_pinned: false,
                is_deleted: false,
                created_at: newRecord.created_at,
                updated_at: newRecord.updated_at,
                sender: {
                  id: newRecord.sender_id,
                  full_name: "Anggota Brotherhood",
                  display_name: "Bikers",
                  role: "member",
                },
                reactions: [],
              };
              return [...prev, incoming];
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "chat_messages",
            filter: `room_id=eq.${roomId}`,
          },
          (payload: { new: any }) => {
            const updated = payload.new as any;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updated.id
                  ? {
                      ...m,
                      content: updated.content,
                      is_edited: updated.is_edited,
                      is_pinned: updated.is_pinned,
                      is_deleted: updated.is_deleted,
                    }
                  : m
              )
            );
          }
        );
    }

    // C. Subscribe and monitor connection health
    channel.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        setIsRealtimeConnected(true);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setIsRealtimeConnected(false);
      }
    });

    return () => {
      setIsRealtimeConnected(false);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomSlug, roomId, currentUser]);

  // 3. Send message with Instant Realtime Broadcast & DB Persistence
  const sendMessage = React.useCallback(
    async (content: string, attachments?: any[]) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) return;
      if (!currentUser) return;

      const tempId = `msg_tmp_${Date.now()}`;
      const targetRoomId = roomId || "4e966ba6-7ce8-4c84-b97b-87a2556c45a9"; // default general UUID

      const optimisticMessage: ChatMessage = {
        id: tempId,
        room_id: targetRoomId,
        sender_id: currentUser.id,
        content: content.trim(),
        reply_to: replyingTo?.id || null,
        reply_message: replyingTo
          ? {
              id: replyingTo.id,
              sender_name: replyingTo.sender.display_name,
              content: replyingTo.content,
            }
          : null,
        message_type: "text",
        is_edited: false,
        is_pinned: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: currentUser,
        attachments: attachments || [],
        reactions: [],
      };

      // A. Local Optimistic Update
      setMessages((prev) => [...prev, optimisticMessage]);
      setReplyingTo(null);

      // B. Immediate Realtime Broadcast to connected peers (<50ms)
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: optimisticMessage,
        });
      }

      // C. Persist to Supabase Database
      try {
        const supabase = createBrowserSupabase();
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            room_id: targetRoomId,
            sender_id: currentUser.id,
            content: content.trim(),
            reply_to: replyingTo?.id || null,
            message_type: "text",
          })
          .select("id, created_at")
          .single();

        if (data && !error) {
          // Reconcile optimistic ID with database ID
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, id: data.id, created_at: data.created_at } : m
            )
          );
        }
      } catch (err) {
        console.warn("[useChatMessages] Persist fallback:", err);
      }
    },
    [roomId, currentUser, replyingTo]
  );

  // 4. Toggle Emoji Reaction with Realtime Broadcast
  const toggleReaction = React.useCallback(
    async (messageId: string, emoji: string) => {
      if (!currentUser) return;

      // Local optimistic update
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;

          const currentReactions = msg.reactions || [];
          const existingGroup = currentReactions.find((r) => r.emoji === emoji);

          let updatedReactions;
          if (existingGroup) {
            const hasReacted = existingGroup.user_ids.includes(currentUser.id);
            if (hasReacted) {
              const remainingUsers = existingGroup.user_ids.filter((uid) => uid !== currentUser.id);
              if (remainingUsers.length === 0) {
                updatedReactions = currentReactions.filter((r) => r.emoji !== emoji);
              } else {
                updatedReactions = currentReactions.map((r) =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: r.count - 1,
                        user_ids: remainingUsers,
                        has_reacted: false,
                      }
                    : r
                );
              }
            } else {
              updatedReactions = currentReactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      user_ids: [...r.user_ids, currentUser.id],
                      has_reacted: true,
                    }
                  : r
              );
            }
          } else {
            updatedReactions = [
              ...currentReactions,
              {
                emoji,
                count: 1,
                user_ids: [currentUser.id],
                has_reacted: true,
              },
            ];
          }

          return { ...msg, reactions: updatedReactions };
        })
      );

      // Broadcast reaction to peers
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "message_reaction",
          payload: { messageId, emoji, userId: currentUser.id },
        });
      }

      // Persist to DB
      try {
        const supabase = createBrowserSupabase();
        await supabase
          .from("chat_reactions")
          .insert({
            message_id: messageId,
            user_id: currentUser.id,
            emoji,
          });
      } catch {
        // Optimistic state remains intact
      }
    },
    [currentUser]
  );

  // 5. Delete Message with Realtime Broadcast
  const deleteMessage = React.useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "message_deleted",
        payload: { messageId },
      });
    }

    try {
      const supabase = createBrowserSupabase();
      await supabase
        .from("chat_messages")
        .update({ is_deleted: true, content: "[Pesan telah dihapus]" })
        .eq("id", messageId);
    } catch {
      // Optimistic delete handled
    }
  }, []);

  return {
    messages,
    loading,
    isRealtimeConnected,
    sendMessage,
    toggleReaction,
    deleteMessage,
    replyingTo,
    setReplyingTo,
  };
}
