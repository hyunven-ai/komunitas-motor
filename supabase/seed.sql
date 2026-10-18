-- ============================================================================
-- BROTHERHOOD COMMUNITY PORTAL - SEED DATA FOR LOCAL DEVELOPMENT
-- ============================================================================

-- 1. Organizational Positions
INSERT INTO public.positions (id, title, code, rank, description) VALUES
('11111111-1111-1111-1111-111111111101', 'Ketua Umum (President)', 'PRESIDENT', 1, 'Pemimpin tertinggi komunitas dan penanggung jawab seluruh kegiatan.'),
('11111111-1111-1111-1111-111111111102', 'Wakil Ketua Umum (Vice President)', 'VP', 2, 'Mendampingi Ketua Umum dan mengoordinasikan bidang internal.'),
('11111111-1111-1111-1111-111111111103', 'Sekretaris Jenderal', 'SEKJEN', 3, 'Pengelolaan administrasi, keanggotaan, dan korespondensi resmi.'),
('11111111-1111-1111-1111-111111111104', 'Bendahara Umum', 'BENDAHARA', 4, 'Pengelolaan keuangan, kas organisasi, verifikasi iuran event.'),
('11111111-1111-1111-1111-111111111105', 'Divisi Touring & Event (Road Captain)', 'RC', 5, 'Perencanaan rute, keselamatan berkendara, dan operasional event.'),
('11111111-1111-1111-1111-111111111106', 'Divisi Humas & Media (Public Relations)', 'HUMAS', 6, 'Dokumentasi, publikasi sosial media, dan hubungan antar-klub.'),
('11111111-1111-1111-1111-111111111107', 'Divisi Tatib & Disiplin (Safety Officer)', 'SAFETY', 7, 'Penegakan SOP keselamatan riding dan tata tertib forum/komunitas.')
ON CONFLICT (code) DO NOTHING;

-- 2. Finance Accounts
INSERT INTO public.finance_accounts (id, name, account_number, is_active) VALUES
('22222222-2222-2222-2222-222222222201', 'Kas Operasional Tunai', 'CASH-01', true),
('22222222-2222-2222-2222-222222222202', 'Bank BCA - Rekening Resmi Komunitas', 'BCA-8839019281', true),
('22222222-2222-2222-2222-222222222203', 'Bank Mandiri - Event Brotherhood', 'MDR-1330029381', true)
ON CONFLICT DO NOTHING;

-- 3. Forum Categories
INSERT INTO public.forum_categories (id, name, slug, description, order_index, icon) VALUES
('33333333-3333-3333-3333-333333333301', 'Pengumuman & Info Resmi', 'pengumuman-resmi', 'Informasi resmi dari pengurus untuk seluruh anggota terdaftar.', 1, 'megaphone'),
('33333333-3333-3333-3333-333333333302', 'Rencana & Diskusi Touring', 'rencana-touring', 'Koordinasi rute, perlengkapan riding, dan persiapan touring.', 2, 'map-pin'),
('33333333-3333-3333-3333-333333333303', 'Tips & Modifikasi Motor', 'tips-modifikasi', 'Sharing mekanik, perawatan motor touring, dan review part.', 3, 'wrench'),
('33333333-3333-3333-3333-333333333304', 'Lounge & Kopi Darat (Kopdar)', 'lounge-kopdar', 'Obrolan santai, perkenalan anggota baru, dan info kopdar mingguan.', 4, 'coffee')
ON CONFLICT (slug) DO NOTHING;
