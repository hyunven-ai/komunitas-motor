# Panduan Provisioning Super Admin & Inisialisasi Akun

Dokumen ini menjelaskan prosedur inisialisasi akun **Super Administrator** pertama kali untuk pengembang atau pengurus utama saat portal di-deploy ke lingkungan produksi Supabase.

---

## 1. Konsep Keamanan Akun Super Admin

Brotherhood Community Portal memisahkan lapisan autentikasi (`auth.users`) dengan profil organisasi (`public.profiles`) dan pemetaan hak akses (`public.user_roles`).

Seorang pengguna hanya dapat mengakses antarmuka `/admin` apabila memiliki entri dengan `role = 'super_admin'` pada tabel `public.user_roles`.

---

## 2. Langkah-Langkah Provisioning Super Admin

### Metode A: Melalui SQL Editor (Direkomendasikan di Produksi)

1. Buka **Supabase Dashboard** -> **Authentication** -> **Users**.
2. Klik **Add User** -> **Create User**:
   - Masukkan Email: `admin@brotherhood.com`
   - Masukkan Password yang kuat (minimal 12 karakter kombinasi huruf, angka, simbol).
   - Pastikan opsi **Auto Confirm User** dicentang (agar tidak memerlukan konfirmasi email pertama).
   - Salin **User UID** yang dihasilkan (contoh: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

3. Buka **SQL Editor** pada Supabase Dashboard dan jalankan kueri berikut:

```sql
-- Ganti 'PASTE_USER_UID_HERE' dengan User UID dari langkah 2 di atas
DO $$
DECLARE
    v_user_id UUID := 'PASTE_USER_UID_HERE'::UUID;
BEGIN
    -- 1. Pastikan profil pengguna telah dibuat
    INSERT INTO public.profiles (
        id,
        full_name,
        display_name,
        phone_number,
        city
    ) VALUES (
        v_user_id,
        'Super Administrator HQ',
        'Super Admin',
        '+6281299887711',
        'Bogor'
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name;

    -- 2. Berikan role super_admin tertinggi
    INSERT INTO public.user_roles (
        user_id,
        role
    ) VALUES (
        v_user_id,
        'super_admin'::app_role_type
    ) ON CONFLICT (user_id, role) DO NOTHING;

    -- 3. Catat ke audit log sistem
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        v_user_id,
        'SUPER_ADMIN_PROVISIONED',
        'user_roles',
        v_user_id,
        jsonb_build_object('role', 'super_admin', 'initial_setup', true)
    );
END $$;
```

---

## 3. Verifikasi Akses Super Admin

1. Buka browser dan arahkan ke alamat URL portal: `https://brotherhood-community.com/login` (atau `http://localhost:3000/login` pada saat pengujian lokal).
2. Masukkan email `admin@brotherhood.com` dan password yang telah dibuat.
3. Setelah login berhasil:
   - Header topbar akan mendeteksi status pengurus dan menampilkan badge **SUPER ADMIN**.
   - Akses penuh ke seluruh menu `/admin` terbuka (Review Pendaftaran, Database Anggota, Manajemen Event, Kas & Keuangan, Moderasi Forum, Konten Berita, Galeri, Audit Log, dan Pengaturan Portal).

---

## 4. Mode Pengujian Lokal (Mock Development Mode)

Saat berjalan di lingkungan pengembangan lokal tanpa koneksi Supabase langsung (variabel `NEXT_PUBLIC_SUPABASE_URL` berisi nilai dummy `mock-project`):
- Halaman login `/login` menyediakan tombol cepat **"Login Pengurus (HQ Admin)"** dan **"Login Anggota (Bambang Wijaya)"**.
- Semua Server Action otomatis menjalankan fallback respons sukses seketika (*zero-latency local mock*) dengan validasi skema Zod penuh sehingga seluruh alur kerja dapat didemonstrasikan secara interaktif tanpa kendala jaringan.
