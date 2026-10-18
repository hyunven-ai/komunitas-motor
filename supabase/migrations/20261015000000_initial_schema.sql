-- ============================================================================
-- BROTHERHOOD COMMUNITY PORTAL - INITIAL PRODUCTION-GRADE SCHEMA MIGRATION
-- ============================================================================

-- Enable pgcrypto for UUIDs & hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE app_role_type AS ENUM (
        'super_admin', 'chairman', 'admin', 'treasurer', 'event_officer', 'moderator', 'member'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE application_status_type AS ENUM (
        'pending', 'approved', 'rejected', 'revision_requested'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE member_status_type AS ENUM (
        'active', 'inactive', 'suspended', 'honorary'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE event_status_type AS ENUM (
        'draft', 'published', 'cancelled', 'completed'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE registration_status_type AS ENUM (
        'registered', 'confirmed', 'cancelled', 'attended'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status_type AS ENUM (
        'unpaid', 'submitted', 'paid', 'rejected', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM (
        'pending', 'approved', 'rejected'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM (
        'income', 'expense'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 2. UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. CORE PROFILES & USER ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    blood_type VARCHAR(5),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    city TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role_type NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_role_unique UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- ----------------------------------------------------------------------------
-- 4. MEMBERSHIP & CONCURRENCY-SAFE NUMBER GENERATOR
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS member_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    member_number VARCHAR(30) NOT NULL UNIQUE,
    status member_status_type NOT NULL DEFAULT 'active',
    motorcycle_model TEXT,
    motorcycle_plate TEXT,
    motorcycle_year INT,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    qr_verification_token TEXT NOT NULL UNIQUE,
    qr_token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_number ON public.members(member_number);
CREATE INDEX IF NOT EXISTS idx_members_qr_token ON public.members(qr_verification_token);

CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TEXT AS $$
DECLARE
    seq_val BIGINT;
    year_prefix TEXT;
BEGIN
    seq_val := nextval('member_number_seq');
    year_prefix := to_char(CURRENT_DATE, 'YYYY');
    RETURN 'BMC-' || year_prefix || '-' || LPAD(seq_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 5. MEMBERSHIP APPLICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    city TEXT NOT NULL,
    motorcycle_model TEXT NOT NULL,
    motorcycle_plate TEXT NOT NULL,
    motorcycle_year INT NOT NULL,
    id_card_number TEXT,
    driving_license_number TEXT,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    reason_to_join TEXT NOT NULL,
    status application_status_type NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON public.membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.membership_applications(email);

-- ----------------------------------------------------------------------------
-- 6. POSITIONS & OFFICER ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    rank INT NOT NULL DEFAULT 100,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.officer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_officer_member ON public.officer_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_officer_active ON public.officer_assignments(is_active);

-- ----------------------------------------------------------------------------
-- 7. EVENTS & ATOMIC REGISTRATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    cover_image_url TEXT,
    location_name TEXT NOT NULL,
    location_address TEXT,
    map_link TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    capacity INT NOT NULL DEFAULT 50,
    fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status event_status_type NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    status registration_status_type NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT event_member_unique UNIQUE (event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_member ON public.event_registrations(member_id);

-- Atomic Concurrency-Safe Event Registration Procedure
CREATE OR REPLACE FUNCTION register_for_event_atomic(
    p_event_id UUID,
    p_member_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event RECORD;
    v_current_count INT;
    v_registration_id UUID;
    v_invoice_number TEXT;
BEGIN
    -- 1. Lock the event row for update to prevent concurrent race condition on capacity
    SELECT id, capacity, fee, status, registration_deadline
    INTO v_event
    FROM public.events
    WHERE id = p_event_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    IF v_event.status != 'published' THEN
        RAISE EXCEPTION 'Event is not open for registration';
    END IF;

    IF NOW() > v_event.registration_deadline THEN
        RAISE EXCEPTION 'Registration deadline has passed';
    END IF;

    -- Check if already registered
    IF EXISTS (
        SELECT 1 FROM public.event_registrations 
        WHERE event_id = p_event_id AND member_id = p_member_id AND status != 'cancelled'
    ) THEN
        RAISE EXCEPTION 'Member is already registered for this event';
    END IF;

    -- Count active registrations
    SELECT COUNT(*) INTO v_current_count
    FROM public.event_registrations
    WHERE event_id = p_event_id AND status IN ('registered', 'confirmed', 'attended');

    IF v_current_count >= v_event.capacity THEN
        RAISE EXCEPTION 'Event capacity has been reached';
    END IF;

    -- Insert registration
    INSERT INTO public.event_registrations (event_id, member_id, status, notes)
    VALUES (p_event_id, p_member_id, 'registered', p_notes)
    RETURNING id INTO v_registration_id;

    -- If event has a fee, auto-generate invoice
    IF v_event.fee > 0 THEN
        v_invoice_number := 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(v_registration_id::text, 1, 6);
        INSERT INTO public.event_invoices (invoice_number, event_id, member_id, amount, status, due_date)
        VALUES (
            v_invoice_number,
            p_event_id,
            p_member_id,
            v_event.fee,
            'unpaid',
            v_event.registration_deadline
        );
    END IF;

    RETURN v_registration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 8. INVOICES, PAYMENTS & FINANCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status invoice_status_type NOT NULL DEFAULT 'unpaid',
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_member ON public.event_invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_event ON public.event_invoices(event_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.event_invoices(status);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.event_invoices(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    proof_url TEXT NOT NULL, -- Stored in private Supabase bucket
    status payment_status_type NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    account_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.finance_accounts(id) ON DELETE RESTRICT,
    payment_id UUID UNIQUE REFERENCES public.payments(id) ON DELETE RESTRICT,
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    reference_number TEXT,
    recorded_by UUID NOT NULL REFERENCES auth.users(id),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.finance_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment ON public.finance_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.finance_transactions(transaction_date);

-- Atomic Payment Approval & Ledger Posting Function
CREATE OR REPLACE FUNCTION approve_event_payment_atomic(
    p_payment_id UUID,
    p_reviewer_id UUID,
    p_account_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_payment RECORD;
    v_invoice RECORD;
BEGIN
    -- 1. Lock payment row
    SELECT id, invoice_id, member_id, amount, status
    INTO v_payment
    FROM public.payments
    WHERE id = p_payment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment record not found';
    END IF;

    IF v_payment.status = 'approved' THEN
        -- Idempotent return: already approved
        RETURN TRUE;
    END IF;

    -- Lock invoice
    SELECT id, event_id, amount, status
    INTO v_invoice
    FROM public.event_invoices
    WHERE id = v_payment.invoice_id
    FOR UPDATE;

    -- Update payment status
    UPDATE public.payments
    SET status = 'approved',
        reviewed_by = p_reviewer_id,
        reviewed_at = NOW()
    WHERE id = p_payment_id;

    -- Update invoice status
    UPDATE public.event_invoices
    SET status = 'paid',
        updated_at = NOW()
    WHERE id = v_payment.invoice_id;

    -- Update registration status to confirmed
    UPDATE public.event_registrations
    SET status = 'confirmed'
    WHERE event_id = v_invoice.event_id AND member_id = v_payment.member_id;

    -- Create single ledger entry in finance_transactions
    INSERT INTO public.finance_transactions (
        account_id,
        payment_id,
        event_id,
        type,
        amount,
        category,
        description,
        recorded_by,
        transaction_date
    ) VALUES (
        p_account_id,
        p_payment_id,
        v_invoice.event_id,
        'income',
        v_payment.amount,
        'Event Registration Fee',
        'Pembayaran Invoice #' || v_payment.invoice_id,
        p_reviewer_id,
        NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 9. QR ATTENDANCE SYSTEM
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    scanned_by UUID NOT NULL REFERENCES auth.users(id),
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    method VARCHAR(20) NOT NULL DEFAULT 'qr_scan',
    notes TEXT,
    CONSTRAINT attendance_unique UNIQUE (event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance_records(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON public.attendance_records(member_id);

CREATE TABLE IF NOT EXISTS public.attendance_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_att_tokens_hash ON public.attendance_tokens(token_hash);

-- Atomic QR Verification & Checkin Function
CREATE OR REPLACE FUNCTION verify_and_checkin_atomic(
    p_event_id UUID,
    p_token_hash TEXT,
    p_scanned_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_token RECORD;
    v_reg RECORD;
    v_member RECORD;
BEGIN
    -- 1. Validate Token
    SELECT event_id, member_id, expires_at, is_revoked
    INTO v_token
    FROM public.attendance_tokens
    WHERE token_hash = p_token_hash AND event_id = p_event_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Token QR tidak valid untuk event ini');
    END IF;

    IF v_token.is_revoked THEN
        RETURN jsonb_build_object('success', false, 'message', 'Token QR telah dicabut');
    END IF;

    IF NOW() > v_token.expires_at THEN
        RETURN jsonb_build_object('success', false, 'message', 'Token QR telah kedaluwarsa');
    END IF;

    -- 2. Check if already checked in
    IF EXISTS (
        SELECT 1 FROM public.attendance_records
        WHERE event_id = p_event_id AND member_id = v_token.member_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anggota sudah melakukan check-in sebelumnya');
    END IF;

    -- 3. Verify member registration
    SELECT id, status INTO v_reg
    FROM public.event_registrations
    WHERE event_id = p_event_id AND member_id = v_token.member_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anggota tidak terdaftar pada event ini');
    END IF;

    -- 4. Record attendance atomically
    INSERT INTO public.attendance_records (event_id, member_id, scanned_by, method)
    VALUES (p_event_id, v_token.member_id, p_scanned_by, 'qr_scan');

    -- Update registration status
    UPDATE public.event_registrations
    SET status = 'attended'
    WHERE id = v_reg.id;

    -- Fetch member name for response
    SELECT m.member_number, p.display_name, p.full_name
    INTO v_member
    FROM public.members m
    JOIN public.profiles p ON p.id = m.user_id
    WHERE m.id = v_token.member_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Check-in berhasil',
        'member_name', COALESCE(v_member.display_name, v_member.full_name),
        'member_number', v_member.member_number,
        'checked_in_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 10. FORUM & MODERATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_category ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.forum_topics(slug);

CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_topic ON public.forum_posts(topic_id);

CREATE TABLE IF NOT EXISTS public.forum_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. NEWS, ANNOUNCEMENTS & GALLERY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news_articles(status);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    author_id UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    cover_image_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_album ON public.gallery_media(album_id);

-- ----------------------------------------------------------------------------
-- 12. AUDIT LOGGING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- 13. TRIGGERS FOR UPDATED_AT
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_members_updated_at ON public.members;
CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.membership_applications;
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON public.membership_applications FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.event_invoices;
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.event_invoices FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_topics_updated_at ON public.forum_topics;
CREATE TRIGGER trg_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.forum_posts;
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_news_updated_at ON public.news_articles;
CREATE TRIGGER trg_news_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Helper authorization functions (Security Definer)
CREATE OR REPLACE FUNCTION public.check_user_has_role(p_user_id UUID, p_roles app_role_type[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id AND (role = ANY(p_roles) OR role = 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. User Roles
CREATE POLICY "Staff can view roles" ON public.user_roles FOR SELECT USING (
    auth.uid() = user_id OR public.check_user_has_role(auth.uid(), ARRAY['chairman', 'admin']::app_role_type[])
);
CREATE POLICY "Only super_admin can insert roles" ON public.user_roles FOR INSERT WITH CHECK (
    public.check_user_has_role(auth.uid(), ARRAY['super_admin']::app_role_type[])
);
CREATE POLICY "Only super_admin can update roles" ON public.user_roles FOR UPDATE USING (
    public.check_user_has_role(auth.uid(), ARRAY['super_admin']::app_role_type[])
);
CREATE POLICY "Only super_admin can delete roles" ON public.user_roles FOR DELETE USING (
    public.check_user_has_role(auth.uid(), ARRAY['super_admin']::app_role_type[])
);

-- 3. Members
CREATE POLICY "Active members readable by all authenticated users" ON public.members FOR SELECT USING (
    auth.role() = 'authenticated'
);
CREATE POLICY "Staff can manage members" ON public.members FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);

-- 4. Membership Applications
CREATE POLICY "Users can view own application" ON public.membership_applications FOR SELECT USING (
    auth.uid() = user_id OR public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);
CREATE POLICY "Anyone can submit application" ON public.membership_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Only authorized staff can update applications" ON public.membership_applications FOR UPDATE USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);

-- 5. Positions & Officers (Publicly readable)
CREATE POLICY "Positions are readable by everyone" ON public.positions FOR SELECT USING (true);
CREATE POLICY "Officers are readable by everyone" ON public.officer_assignments FOR SELECT USING (true);
CREATE POLICY "Staff can manage positions" ON public.positions FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);
CREATE POLICY "Staff can manage officers" ON public.officer_assignments FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);

-- 6. Events
CREATE POLICY "Published events readable by everyone" ON public.events FOR SELECT USING (
    status = 'published' OR status = 'completed' OR public.check_user_has_role(auth.uid(), ARRAY['admin', 'event_officer', 'chairman']::app_role_type[])
);
CREATE POLICY "Staff can manage events" ON public.events FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'event_officer', 'chairman']::app_role_type[])
);

-- 7. Event Registrations
CREATE POLICY "Members can view own registration" ON public.event_registrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members WHERE id = public.event_registrations.member_id AND user_id = auth.uid())
    OR public.check_user_has_role(auth.uid(), ARRAY['admin', 'event_officer', 'chairman']::app_role_type[])
);
CREATE POLICY "Members can register for events" ON public.event_registrations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members WHERE id = public.event_registrations.member_id AND user_id = auth.uid())
);

-- 8. Invoices & Payments
CREATE POLICY "Members can view own invoices" ON public.event_invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members WHERE id = public.event_invoices.member_id AND user_id = auth.uid())
    OR public.check_user_has_role(auth.uid(), ARRAY['treasurer', 'admin', 'chairman']::app_role_type[])
);
CREATE POLICY "Members can view own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members WHERE id = public.payments.member_id AND user_id = auth.uid())
    OR public.check_user_has_role(auth.uid(), ARRAY['treasurer', 'admin', 'chairman']::app_role_type[])
);
CREATE POLICY "Members can submit payments" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.members WHERE id = public.payments.member_id AND user_id = auth.uid())
);
CREATE POLICY "Only treasurer and admin can update payments" ON public.payments FOR UPDATE USING (
    public.check_user_has_role(auth.uid(), ARRAY['treasurer', 'admin', 'chairman']::app_role_type[])
);

-- 9. Finance Accounts & Transactions
CREATE POLICY "Only treasurer and admin can read finance accounts" ON public.finance_accounts FOR SELECT USING (
    public.check_user_has_role(auth.uid(), ARRAY['treasurer', 'chairman']::app_role_type[])
);
CREATE POLICY "Only treasurer and admin can read transactions" ON public.finance_transactions FOR SELECT USING (
    public.check_user_has_role(auth.uid(), ARRAY['treasurer', 'chairman']::app_role_type[])
);
CREATE POLICY "Only treasurer can insert transactions" ON public.finance_transactions FOR INSERT WITH CHECK (
    public.check_user_has_role(auth.uid(), ARRAY['treasurer']::app_role_type[])
);

-- 10. Attendance
CREATE POLICY "Members can view own attendance" ON public.attendance_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.members WHERE id = public.attendance_records.member_id AND user_id = auth.uid())
    OR public.check_user_has_role(auth.uid(), ARRAY['admin', 'event_officer', 'chairman']::app_role_type[])
);
CREATE POLICY "Event staff can insert attendance" ON public.attendance_records FOR INSERT WITH CHECK (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'event_officer', 'chairman']::app_role_type[])
);

-- 11. Forum
CREATE POLICY "Forum categories readable by members" ON public.forum_categories FOR SELECT USING (
    auth.role() = 'authenticated'
);
CREATE POLICY "Forum topics readable by members" ON public.forum_topics FOR SELECT USING (
    auth.role() = 'authenticated' AND (NOT is_hidden OR public.check_user_has_role(auth.uid(), ARRAY['moderator', 'admin']::app_role_type[]))
);
CREATE POLICY "Members can create topics" ON public.forum_topics FOR INSERT WITH CHECK (
    auth.uid() = author_id AND auth.role() = 'authenticated'
);
CREATE POLICY "Authors or moderators can update topics" ON public.forum_topics FOR UPDATE USING (
    auth.uid() = author_id OR public.check_user_has_role(auth.uid(), ARRAY['moderator', 'admin']::app_role_type[])
);

CREATE POLICY "Forum posts readable by members" ON public.forum_posts FOR SELECT USING (
    auth.role() = 'authenticated' AND (NOT is_hidden OR public.check_user_has_role(auth.uid(), ARRAY['moderator', 'admin']::app_role_type[]))
);
CREATE POLICY "Members can create posts" ON public.forum_posts FOR INSERT WITH CHECK (
    auth.uid() = author_id AND auth.role() = 'authenticated'
);
CREATE POLICY "Authors or moderators can update posts" ON public.forum_posts FOR UPDATE USING (
    auth.uid() = author_id OR public.check_user_has_role(auth.uid(), ARRAY['moderator', 'admin']::app_role_type[])
);

-- 12. News & Announcements (Public Read for published)
CREATE POLICY "Published news readable by everyone" ON public.news_articles FOR SELECT USING (
    status = 'published' OR public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);
CREATE POLICY "Staff can manage news" ON public.news_articles FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);

CREATE POLICY "Announcements readable by members" ON public.announcements FOR SELECT USING (
    auth.role() = 'authenticated'
);
CREATE POLICY "Staff can manage announcements" ON public.announcements FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);

-- 13. Gallery
CREATE POLICY "Public albums readable by everyone" ON public.gallery_albums FOR SELECT USING (
    is_public OR auth.role() = 'authenticated'
);
CREATE POLICY "Public media readable by everyone" ON public.gallery_media FOR SELECT USING (true);
CREATE POLICY "Staff can manage gallery albums" ON public.gallery_albums FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);
CREATE POLICY "Staff can manage gallery media" ON public.gallery_media FOR ALL USING (
    public.check_user_has_role(auth.uid(), ARRAY['admin', 'chairman']::app_role_type[])
);

-- 14. Audit Logs
CREATE POLICY "Staff can view audit logs" ON public.audit_logs FOR SELECT USING (
    public.check_user_has_role(auth.uid(), ARRAY['super_admin', 'chairman']::app_role_type[])
);
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);
