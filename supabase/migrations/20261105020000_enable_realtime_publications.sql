-- ============================================================================
-- BORNEO BROTHERHOOD - ENABLE SUPABASE REALTIME FOR COMMUNITY CHAT
-- Enables postgres_changes stream for chat messages, reactions, rooms, and pins
-- ============================================================================

-- 1. Add chat tables to supabase_realtime publication
DO $$
BEGIN
    -- Check and add chat_messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;

    -- Check and add chat_reactions
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_reactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
    END IF;

    -- Check and add chat_rooms
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
    END IF;

    -- Check and add chat_pins
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'chat_pins'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_pins;
    END IF;
END $$;

-- 2. Configure REPLICA IDENTITY FULL so UPDATE and DELETE events replicate full payloads
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_pins REPLICA IDENTITY FULL;

