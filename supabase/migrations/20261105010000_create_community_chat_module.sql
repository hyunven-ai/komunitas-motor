-- ============================================================================
-- BORNEO BROTHERHOOD - STANDALONE COMMUNITY CHAT MODULE MIGRATION
-- Reuses existing auth.users, profiles, and user_roles without duplicate profiles.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CHAT ROOMS & CHANNELS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'COMMUNITY', -- 'COMMUNITY', 'RIDING & EVENTS', 'CHAPTERS', 'DIRECT'
    room_type VARCHAR(20) NOT NULL DEFAULT 'channel',   -- 'channel', 'direct', 'group'
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    is_read_only BOOLEAN NOT NULL DEFAULT FALSE,
    icon VARCHAR(50) DEFAULT 'Hash',
    position INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_slug ON public.chat_rooms(slug);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_category ON public.chat_rooms(category);

-- ----------------------------------------------------------------------------
-- 2. CHAT ROOM MEMBERS (FOR PRIVATE / CHAPTER CHANNELS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'member', -- 'owner', 'moderator', 'member'
    is_muted BOOLEAN NOT NULL DEFAULT FALSE,
    muted_until TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chat_room_members_unique UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON public.chat_room_members(room_id);

-- ----------------------------------------------------------------------------
-- 3. CHAT MESSAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text', -- 'text', 'attachment', 'system', 'announcement'
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_time ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply ON public.chat_messages(reply_to);

-- ----------------------------------------------------------------------------
-- 4. CHAT ATTACHMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(30) NOT NULL, -- 'image', 'document', 'audio', 'video'
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100),
    width INT,
    height INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON public.chat_attachments(message_id);

-- ----------------------------------------------------------------------------
-- 5. CHAT REACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chat_reactions_unique UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_chat_reactions_msg ON public.chat_reactions(message_id);

-- ----------------------------------------------------------------------------
-- 6. CHAT PINS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chat_pins_unique UNIQUE (room_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_pins_room ON public.chat_pins(room_id);

-- ----------------------------------------------------------------------------
-- 7. CHAT REPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    action_taken TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_reports_status ON public.chat_reports(status);

-- ----------------------------------------------------------------------------
-- 8. CHAT BANS & MUTES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE, -- NULL = GLOBAL CHAT BAN
    reason TEXT NOT NULL,
    ban_type VARCHAR(20) NOT NULL DEFAULT 'mute', -- 'mute', 'ban'
    expires_at TIMESTAMPTZ, -- NULL = PERMANENT
    banned_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_bans_user ON public.chat_bans(user_id);

-- ----------------------------------------------------------------------------
-- 9. CHAT USER SETTINGS (SPECIFIC TO CHAT EXPERIENCE ONLY)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    compact_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. CHAT MODERATION LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'delete_message', 'pin_message', 'mute_user', 'ban_user', 'dismiss_report'
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
    message_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_mod_logs_created ON public.chat_moderation_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- SEED DEFAULT COMMUNITY CHANNELS
-- ----------------------------------------------------------------------------
INSERT INTO public.chat_rooms (name, slug, description, category, room_type, icon, position)
VALUES
    -- Community Category
    ('general', 'general', 'Obrolan santai seputar komunitas motor dan brotherhood.', 'COMMUNITY', 'channel', 'Hash', 1),
    ('perkenalan', 'introductions', 'Ruang perkenalan bagi anggota baru Borneo Brotherhood.', 'COMMUNITY', 'channel', 'Users', 2),
    ('pengumuman', 'announcements', 'Pemberitahuan resmi dari Dewan Pengurus & Komite.', 'COMMUNITY', 'channel', 'Megaphone', 3),
    ('santai-random', 'random', 'Topik bebas, guyonan santai, dan berbagi cerita aspal.', 'COMMUNITY', 'channel', 'Coffee', 4),

    -- Riding & Events Category
    ('agenda-touring', 'touring', 'Koordinasi touring lintas kota dan ekspedisi Borneo.', 'RIDING & EVENTS', 'channel', 'Compass', 10),
    ('event-mendatang', 'upcoming-events', 'Diskusi seputar agenda kumpul, anniversary, dan baksos.', 'RIDING & EVENTS', 'channel', 'Calendar', 11),
    ('bincang-motor', 'motorcycle-talk', 'Tips modifikasi, perawatan mesin, ban, suspensi & riding gear.', 'RIDING & EVENTS', 'channel', 'Wrench', 12),
    ('catatan-perjalanan', 'ride-reports', 'Foto dan cerita keseruan setelah ekspedisi touring.', 'RIDING & EVENTS', 'channel', 'MapPin', 13),

    -- Chapters Category
    ('chapter-pontianak', 'pontianak', 'Ruang komunikasi resmi anggota Chapter Pontianak.', 'CHAPTERS', 'channel', 'Map', 20),
    ('chapter-singkawang', 'singkawang', 'Ruang komunikasi resmi anggota Chapter Singkawang.', 'CHAPTERS', 'channel', 'Map', 21),
    ('chapter-mempawah', 'mempawah', 'Ruang komunikasi resmi anggota Chapter Mempawah.', 'CHAPTERS', 'channel', 'Map', 22)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_moderation_logs ENABLE ROW LEVEL SECURITY;

-- chat_rooms: All authenticated users can view public rooms, or private rooms if they are members
CREATE POLICY "Public rooms visible to authenticated users"
ON public.chat_rooms FOR SELECT
TO authenticated
USING (
    is_private = FALSE 
    OR EXISTS (
        SELECT 1 FROM public.chat_room_members 
        WHERE chat_room_members.room_id = chat_rooms.id 
        AND chat_room_members.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('super_admin', 'chairman', 'admin')
    )
);

CREATE POLICY "Admins can manage chat_rooms"
ON public.chat_rooms FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('super_admin', 'chairman', 'admin')
    )
);

-- chat_messages: Visible to authenticated members who can view the room
CREATE POLICY "Messages readable by room viewers"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
    is_deleted = FALSE 
    OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('super_admin', 'chairman', 'admin', 'moderator')
    )
);

-- chat_messages: Insert allowed if authenticated and not banned/muted
CREATE POLICY "Authenticated users can insert messages if not banned"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (
        SELECT 1 FROM public.chat_bans
        WHERE chat_bans.user_id = auth.uid()
        AND (chat_bans.room_id IS NULL OR chat_bans.room_id = chat_messages.room_id)
        AND (chat_bans.expires_at IS NULL OR chat_bans.expires_at > NOW())
    )
);

-- chat_messages: Edit own message
CREATE POLICY "Users can update own messages"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id);

-- chat_reactions: Select & Insert
CREATE POLICY "Reactions readable by authenticated"
ON public.chat_reactions FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "Reactions insertable by user"
ON public.chat_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reactions deletable by user"
ON public.chat_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- chat_user_settings: Own settings
CREATE POLICY "User can read own chat settings"
ON public.chat_user_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "User can update own chat settings"
ON public.chat_user_settings FOR ALL
TO authenticated
USING (auth.uid() = user_id);

