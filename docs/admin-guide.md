# Panduan Operasional Pengurus — Brotherhood Community Portal

Panduan ini ditujukan bagi jajaran dewan pengurus (**Ketua Umum, Sekretaris Jenderal, Bendahara Umum, Road Captain, dan Moderator Forum**) dalam mengoperasikan portal administrasi.

---

## 1. Pembagian Peran & Wewenang (Role-Based Access)

| Peran (Role) | Ruang Lingkup Tanggung Jawab Utama | Akses Menu Portal |
| :--- | :--- | :--- |
| **Super Admin** | Konfigurasi sistem global, audit trail, provisioning akun pengurus. | Seluruh menu admin |
| **Chairman (Ketua Umum)** | Pengawasan umum, peninjauan pendaftaran, penetapan rute touring akbar. | Dashboard, Pendaftaran, Anggota, Event, Laporan Keuangan |
| **Admin / Sekjen** | Verifikasi pendaftaran anggota baru, penerbitan KTA digital, komunikasi pengumuman. | Pendaftaran, Anggota, Berita, Audit Logs |
| **Treasurer (Bendahara)** | Verifikasi bukti transfer event, pembukuan kas masuk/keluar, pelaporan LPJ event. | Keuangan & Kas, Laporan Event |
| **Event Officer / Road Captain** | Publikasi agenda touring, kuota peserta, dan pemindaian absensi QR di checkpoint. | Event, Pindai Absensi, Galeri |
| **Moderator** | Pengawasan etika diskusi forum, penyematan (PIN), dan penguncian thread bermasalah. | Moderasi Forum |
| **Member** | Partisipasi event, akses KTA 3D, diskusi forum internal, dan pembayaran invoice. | Portal Member Khusus |

---

## 2. Alur Kerja Sekretaris Jenderal (Pendaftaran & Database Anggota)

### A. Meninjau Pendaftaran Anggota Baru (`/admin/applications`)
1. Buka menu **Review Pendaftaran** pada sidebar admin.
2. Periksa kelengkapan data calon anggota:
   - Nama lengkap, kontak darurat, kota domisili.
   - Jenis motor, tahun perakitan, dan nomor plat polisi.
   - Motivasi bergabung dengan komunitas.
3. Tentukan keputusan:
   - **Setujui (Approve)**: Sistem otomatis memanggil fungsi SQL `generate_member_number()` untuk menerbitkan nomor KTA resmi berturut-turut (misal: `BMC-2026-0015`), membuatkan token QR aman, dan mengirimkan email sambutan.
   - **Minta Revisi**: Masukkan catatan (misal: "Foto KTP buram" atau "Nomor kontak darurat belum aktif").
   - **Tolak (Reject)**: Masukkan alasan penolakan yang etis dan terdokumentasi.

### B. Manajemen Anggota Aktif (`/admin/members`)
- Mencari data anggota berdasarkan nomor KTA, nama, atau jenis motor.
- Meninjau status keaktifan (*Active, Inactive, Suspended, Honorary*).
- Mengekspor pangkalan data seluruh anggota ke dalam format CSV untuk arsip organisasi.

---

## 3. Alur Kerja Bendahara Umum (Keuangan & Pembukuan Kas)

> [!IMPORTANT]
> Komunitas Brotherhood tidak memungut iuran bulanan wajib. Seluruh aliran dana berbasiskan biaya partisipasi per event touring dan donasi sukarela.

### A. Verifikasi Bukti Transfer Manual (`/admin/finance`)
1. Saat anggota mendaftar event berbayar, sebuah invoice diterbitkan dengan status `unpaid`.
2. Anggota melakukan transfer ke rekening resmi (BCA atau Mandiri) dan mengunggah struk via portal member.
3. Bendahara membuka antrean verifikasi di `/admin/finance`.
4. Klik **Lihat Bukti Struk** untuk memeriksa keaslian mutasi rekening:
   - Periksa nama rekening pengirim, bank, dan nominal yang tertera.
5. Klik **Setujui & Bukukan Kas**:
   - Pilih rekening kas penampung dana (BCA Utama, Mandiri Operasional, atau Kas Tunai).
   - Sistem secara atomik menandai invoice lunas (`paid`), mengonfirmasi kepesertaan touring, dan mencatat transaksi kas masuk di buku kas secara permanen tanpa risiko duplikasi.
6. Jika nominal kurang atau struk tidak valid, klik **Tolak Pembayaran** dan masukkan catatan alasan penolakan.

### B. Pencatatan Transaksi Manual & Ekspor LPJ (`/admin/finance/transactions`)
- Klik **Catat Transaksi Manual** untuk membukukan pengeluaran non-invoice (misal: pembelian ban cadangan rescue, sewa villa, konsumsi, atau penerimaan sponsor).
- Seluruh arus kas dapat difilter (Kas Masuk vs Kas Keluar) dan diekspor ke CSV.
- Pada halaman `/admin/finance/reports`, Bendahara dapat mengunduh Laporan Pertanggungjawaban (LPJ) per kegiatan touring lengkap dengan surplus sisa kas bersih.

---

## 4. Alur Kerja Road Captain / Event Officer (Touring & Absensi QR)

### A. Membuat Agenda Kegiatan Baru (`/admin/events/new`)
1. Masukkan judul event, kategori (*Touring Jarak Jauh, Rolling City / Sunmori, Bakti Sosial*), tanggal pelaksanaan, dan titik kumpul (tikum).
2. **Kapasitas Peserta (Atomic Capacity)**: Tentukan batas maksimal motor demi keselamatan konvoi (misal: 45 motor). Sistem secara otomatis mengunci pendaftaran saat kuota penuh.
3. Atur biaya pendaftaran (gratis Rp 0 atau berbayar).
4. Tentukan perlengkapan wajib (*Safety Gear Checklist*): Helm Fullface, Jaket Protector, Sepatu Riding di atas mata kaki, Sarung Tangan, dan Jas Hujan.

### B. Pemindaian Absensi QR di Checkpoint (`/admin/events/[id]/attendance`)
1. Buka halaman pemindai kamera pada smartphone Road Captain atau Sweeper.
2. Arahkan kamera ke layar ponsel anggota yang membuka menu **Tiket Absensi QR** di portal member.
3. Pemindai kamera (`html5-qrcode`) akan secara otomatis memverifikasi token QR hash satu kali pakai ke fungsi atomik `verify_and_checkin_atomic`:
   - Jika valid: Memunculkan konfirmasi hijau beserta nama anggota, nomor KTA, dan stempel waktu check-in.
   - Jika belum bayar / tidak terdaftar: Sistem menolak check-in secara otomatis.
4. Tersedia tombol **Pencarian Manual** jika kamera smartphone mengalami kendala teknis atau baterai habis.

---

## 5. Alur Kerja Moderator (Etika Forum & Konten)

### A. Pengawasan Ruang Diskusi (`/admin/forum`)
1. Periksa tab **Antrean Laporan Pelanggaran Komunitas**.
2. Jika ada postingan yang melanggar kode etik (iklan liar tanpa izin, ujaran SARA, tawuran, knalpot bising):
   - Klik **Beri Peringatan Member** untuk menegur anggota.
   - Klik **Hapus Konten** untuk melenyapkan postingan dari forum.
3. Untuk topik edukasi penting (seperti SOP formasi konvoi atau rilis jadwal touring), klik ikon **Pin** agar topik selalu berada di posisi paling atas forum.
4. Untuk thread jual-beli yang sudah laku (sold out) atau diskusi yang memanas, klik ikon **Lock** untuk menutup thread dari komentar baru.
