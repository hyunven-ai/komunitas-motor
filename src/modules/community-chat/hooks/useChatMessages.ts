"use client";

import * as React from "react";
import { ChatMessage, ChatSenderProfile } from "../types/chat.types";
import { fetchMessagesByRoom } from "../services/message.service";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";

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

  // Load initial messages for active room
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

  // Supabase Realtime Postgres Changes Subscription
  React.useEffect(() => {
    if (!roomId) return;

    try {
      const supabase = createBrowserSupabase();
      const channel = supabase
        .channel(`chat_room_${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const newRecord = payload.new as any;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newRecord.id)) return prev;

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
                  full_name: "Anggota",
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
          (payload) => {
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
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("[useChatMessages] Realtime subscription fallback:", err);
    }
  }, [roomId]);

  // Send message with optimistic update
  const sendMessage = React.useCallback(
    async (content: string, attachments?: any[]) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) return;
      if (!currentUser) return;

      const tempId = `msg_tmp_${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        room_id: roomId || "room-gen-001",
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

      setMessages((prev) => [...prev, optimisticMessage]);
      setReplyingTo(null);

      // Persist to database if live Supabase is configured
      try {
        const supabase = createBrowserSupabase();
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            room_id: roomId || "room-gen-001",
            sender_id: currentUser.id,
            content: content.trim(),
            reply_to: replyingTo?.id || null,
            message_type: "text",
          })
          .select("id, created_at")
          .single();

        if (data && !error) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: data.id, created_at: data.created_at } : m))
          );
        }
      } catch (err) {
        console.warn("[useChatMessages] Saved to local state (mock/offline fallback):", err);
      }
    },
    [roomId, currentUser, replyingTo]
  );

  // Toggle emoji reaction
  const toggleReaction = React.useCallback(
    async (messageId: string, emoji: string) => {
      if (!currentUser) return;

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

      // Async persist reaction to DB
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

  // Delete message
  const deleteMessage = React.useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

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
    sendMessage,
    toggleReaction,
    deleteMessage,
    replyingTo,
    setReplyingTo,
  };
}

