import { AppRole } from "@/types/database";

export type ChatRoomCategory = "COMMUNITY" | "RIDING & EVENTS" | "CHAPTERS" | "DIRECT";
export type ChatRoomType = "channel" | "direct" | "group";
export type ChatMessageType = "text" | "attachment" | "system" | "announcement";

export interface ChatSenderProfile {
  id: string; // auth.users.id
  full_name: string;
  display_name: string;
  username?: string | null;
  avatar_url?: string | null;
  member_number?: string | null;
  role: AppRole;
  is_verified?: boolean;
}

export interface ChatAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: "image" | "document" | "audio" | "video";
  file_size: number;
  mime_type?: string;
  width?: number;
  height?: number;
  created_at?: string;
}

export interface ChatReactionGroup {
  emoji: string;
  count: number;
  user_ids: string[];
  has_reacted: boolean;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  reply_to?: string | null;
  reply_message?: {
    id: string;
    sender_name: string;
    content: string;
  } | null;
  message_type: ChatMessageType;
  is_edited: boolean;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender: ChatSenderProfile;
  attachments?: ChatAttachment[];
  reactions?: ChatReactionGroup[];
}

export interface ChatRoom {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: ChatRoomCategory;
  room_type: ChatRoomType;
  is_private: boolean;
  is_read_only: boolean;
  icon?: string;
  position: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  } | null;
}

export interface ChatMemberPresence {
  user_id: string;
  full_name: string;
  display_name: string;
  username?: string | null;
  avatar_url?: string | null;
  role: AppRole;
  member_number?: string | null;
  status: "online" | "idle" | "offline";
  current_room_id?: string;
  last_seen?: string;
}

export interface ChatUserSettings {
  user_id: string;
  notification_enabled: boolean;
  sound_enabled: boolean;
  compact_mode: boolean;
  updated_at?: string;
}

export interface ChatReportItem {
  id: string;
  message_id: string;
  message_content?: string;
  reporter_id: string;
  reporter_name?: string;
  target_user_id?: string;
  target_user_name?: string;
  room_name?: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  action_taken?: string | null;
  resolved_by?: string | null;
  created_at: string;
}

export interface ChatBanItem {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string | null;
  room_id?: string | null;
  room_name?: string | null;
  reason: string;
  ban_type: "mute" | "ban";
  expires_at?: string | null;
  banned_by: string;
  created_at: string;
}

