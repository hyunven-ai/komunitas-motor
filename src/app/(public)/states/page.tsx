"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  AlertTriangle,
  WifiOff,
  Gauge,
  Search,
  Lock,
  Clock,
  CheckCircle,
  FileText,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  EmptyState,
  SkeletonEventCard,
  SkeletonNewsCard,
  SkeletonTable,
  ErrorState,
  OfflineBanner,
  SlowNetworkNotice,
  NoSearchResultsState,
  PermissionDeniedState,
  SessionExpiredModal,
  ValidatedField,
  SuccessState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StatesInteractiveShowcase() {
  const [activeTab, setActiveTab] = React.useState<number>(1);

  // State 4 test
  const [offlineSimulated, setOfflineSimulated] = React.useState(false);

  // State 5 test
  const [slowProgress, setSlowProgress] = React.useState(35);
  const [lighterModeActive, setLighterModeActive] = React.useState(false);

  // State 6 test
  const [searchQuery, setSearchQuery] = React.useState("trouring");

  // State 8 test
  const [sessionExpiredOpen, setSessionExpiredOpen] = React.useState(false);
  const [mockFormData, setMockFormData] = React.useState({
    fullName: "Rider Borneo 01",
    email: "rider@brotherhood.id",
    phone: "081299887711",
    motor: "Honda Africa Twin 1100L",
  });

  // State 9 test
  const [fieldTestValue, setFieldTestValue] = React.useState("0812");
  const [triggerValidation, setTriggerValidation] = React.useState(true);

  const STATE_ITEMS = [
    { id: 1, title: "1. Empty State", desc: "Why it is empty + one next step" },
    { id: 2, title: "2. Loading State", desc: "Shape of what is coming, not a spinner" },
    { id: 3, title: "3. Error State", desc: "What went wrong, whose fault, how to fix" },
    { id: 4, title: "4. No Internet", desc: "Keep cached content, say what still works" },
    { id: 5, title: "5. Slow Network", desc: "Real progress + offer a lighter path" },
    { id: 6, title: "6. No Search Results", desc: "Fix typo for them + suggest next search" },
    { id: 7, title: "7. Permission Denied", desc: "Explain why needed + give a way back" },
    { id: 8, title: "8. Session Expired", desc: "Save work before sign out" },
    { id: 9, title: "9. Form Validation", desc: "Exact field inline + how to fix it" },
    { id: 10, title: "10. Success State", desc: "Confirm, reassure, show what happens next" },
  ];

  return (
    <div className="py-12 sm:py-20 bg-[#0B0D12] min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        {/* Title */}
        <div className="space-y-3 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
            <Sparkles className="h-4 w-4" />
            <span>Interactive UX System Verification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-bone">
            10 UX States Architecture
          </h1>
          <p className="text-sm sm:text-base text-bone-muted font-sans max-w-2xl">
            Sistem 10 state antarmuka Brotherhood Portal. Setiap state diimplementasikan dengan kepatuhan tepat pada prinsip UX yang diminta.
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STATE_ITEMS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveTab(s.id)}
              className={`p-3 rounded-xl border text-left transition-all text-xs font-mono ${
                activeTab === s.id
                  ? "border-muted-gold bg-muted-gold/15 text-bone font-bold shadow-lg"
                  : "border-white/10 bg-charcoal/60 text-bone-muted hover:text-bone hover:border-white/20"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-gold">
                State #{s.id}
              </div>
              <div className="font-bold truncate mt-0.5">{s.title.split(". ")[1]}</div>
            </button>
          ))}
        </div>

        {/* ACTIVE STATE DISPLAY ARENA */}
        <div className="rounded-2xl border border-white/10 bg-charcoal/40 p-6 sm:p-10 shadow-2xl relative">
          {/* TAB 1: EMPTY STATE */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    1. Empty State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Say why it is empty. then give one next step.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 1: Terpenuhi</Badge>
              </div>

              <EmptyState
                title="Belum Ada Jadwal Touring Bulan Ini"
                reason="Divisi Touring dan Road Captain sedang melakukan survei jalur perbukitan dan audit keselamatan rute aspal sebelum membuka kuota pendaftaran resmi."
                action={{
                  label: "Lihat Galeri Ekspedisi Sebelumnya",
                  href: "/gallery",
                  icon: ArrowRight,
                }}
                secondaryAction={{
                  label: "Usulkan Rute Baru di Forum Diskusi",
                  href: "/member/forum",
                }}
              />
            </div>
          )}

          {/* TAB 2: LOADING STATE */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    2. Loading State (Shape Skeletons)
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Show the shape of what is coming, not a spinner.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 2: Terpenuhi</Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase text-muted-gold mb-3 font-semibold">
                    A. Bentuk Kartu Agenda Touring (Skeleton Event Shape):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonEventCard />
                    <SkeletonEventCard />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-muted-gold mb-3 font-semibold">
                    B. Bentuk Tabel Data Anggota (Skeleton Table Shape):
                  </h4>
                  <SkeletonTable rows={3} cols={4} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ERROR STATE */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    3. Error State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: What went wrong, whose fault, and how to fix it.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 3: Terpenuhi</Badge>
              </div>

              <ErrorState
                error={new Error("Database connection pool timeout on read replica")}
                contextTitle="Gagal Menghubungkan Basis Data Portal"
                onRetry={() => alert("Mencoba menghubungkan ulang ke database...")}
                retryLabel="Muat Ulang Halaman"
                secondaryAction={{
                  label: "Hubungi Dukungan Teknis",
                  href: "/",
                }}
              />
            </div>
          )}

          {/* TAB 4: NO INTERNET */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    4. No Internet State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Keep cached content on screen, say what still works.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 4: Terpenuhi</Badge>
              </div>

              {/* Simulation Controller */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-charcoal border border-white/10">
                <Button
                  onClick={() => setOfflineSimulated(!offlineSimulated)}
                  className={`text-xs font-mono uppercase tracking-wider ${
                    offlineSimulated ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  <span>
                    {offlineSimulated ? "Matikan Simulasi Offline" : "Simulasikan Putus Koneksi (Offline)"}
                  </span>
                </Button>
                <span className="text-xs text-bone-muted font-mono">
                  {offlineSimulated ? "Status: Terputus (Mode Offline aktif)" : "Status: Online"}
                </span>
              </div>

              {/* The cached content preserved on screen */}
              <div className="rounded-xl border border-white/10 bg-asphalt p-6 space-y-3">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Konten Cache Halaman Tetap Terbuka (Tidak Dihapus)
                </span>
                <h3 className="text-xl font-display font-bold text-bone">
                  Ekspedisi Touring Lintas Borneo 2026
                </h3>
                <p className="text-xs text-bone-muted leading-relaxed">
                  Rute Balikpapan - Samarinda - Berau tetap dapat dibaca secara offline lengkap dengan koordinat rest area dan peta jalur pegunungan.
                </p>
              </div>

              {/* Render banner */}
              <OfflineBanner forceOffline={offlineSimulated} />
            </div>
          )}

          {/* TAB 5: SLOW NETWORK */}
          {activeTab === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    5. Slow Network State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Show real progress and offer a lighter path.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 5: Terpenuhi</Badge>
              </div>

              {/* Progress Slider Controls */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-charcoal border border-white/10">
                <span className="text-xs font-mono text-bone-muted">Ubah Progress:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slowProgress}
                  onChange={(e) => setSlowProgress(Number(e.target.value))}
                  className="w-48 accent-amber-500"
                />
                <span className="text-xs font-mono font-bold text-amber-400">
                  {slowProgress}%
                </span>
              </div>

              <SlowNetworkNotice
                progress={slowProgress}
                estimatedSeconds={6}
                onEnableLighterMode={() => {
                  setLighterModeActive(true);
                  alert("Mode Hemat Data Aktif: Gambar beresolusi tinggi dinonaktifkan.");
                }}
              />
            </div>
          )}

          {/* TAB 6: NO SEARCH RESULTS */}
          {activeTab === 6 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    6. No Search Results
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Fix the typo for them and suggest a next search.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 6: Terpenuhi</Badge>
              </div>

              {/* Keyword tester buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-bone-muted">
                <span>Coba kata kunci dengan salah ketik:</span>
                {["trouring", "kopdar wajib", "angota", "bengkel rekann"].map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => setSearchQuery(word)}
                    className="px-2.5 py-1 rounded bg-charcoal border border-white/10 hover:border-muted-gold text-bone"
                  >
                    &ldquo;{word}&rdquo;
                  </button>
                ))}
              </div>

              <NoSearchResultsState
                query={searchQuery}
                onSelectSuggestion={(newQuery) => {
                  setSearchQuery(newQuery);
                  alert(`Pencarian diperbarui ke: ${newQuery}`);
                }}
                onClear={() => setSearchQuery("")}
              />
            </div>
          )}

          {/* TAB 7: PERMISSION DENIED */}
          {activeTab === 7 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    7. Permission Denied State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Explain why you need it and give a way back.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 7: Terpenuhi</Badge>
              </div>

              <PermissionDeniedState
                resourceName="Otorisasi Kas & Pembukuan Keuangan Komunitas"
                whyNeeded="Modul ini memerlukan wewenang Bendahara atau Super Admin demi menjaga transparansi pembukuan kas anggota dan kepatuhan audit AD/ART Pasal 14."
                requiredRole="Bendahara Umum / Ketua Umum"
                returnLabel="Kembali ke Dashboard Utama"
                returnUrl="/states"
              />
            </div>
          )}

          {/* TAB 8: SESSION EXPIRED */}
          {activeTab === 8 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    8. Session Expired State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Save their work before you sign them out.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 8: Terpenuhi</Badge>
              </div>

              <div className="rounded-xl bg-charcoal p-5 space-y-4 border border-white/10">
                <span className="text-xs font-mono uppercase text-muted-gold font-bold">
                  Simulasi Formulir Yang Sedang Diisi Pengguna:
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-asphalt p-3 rounded border border-white/5">
                    Nama: {mockFormData.fullName}
                  </div>
                  <div className="bg-asphalt p-3 rounded border border-white/5">
                    Motor: {mockFormData.motor}
                  </div>
                </div>

                <Button
                  onClick={() => setSessionExpiredOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs uppercase tracking-wider"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Picu Sesi Kedaluwarsa (Simpan Draf Otomatis)</span>
                </Button>
              </div>

              <SessionExpiredModal
                isOpen={sessionExpiredOpen}
                formId="demo_form_test"
                currentFormData={mockFormData}
                formTitle="Formulir Pendaftaran Calon Anggota"
                loginUrl="/login"
                onStay={() => setSessionExpiredOpen(false)}
              />
            </div>
          )}

          {/* TAB 9: FORM VALIDATION */}
          {activeTab === 9 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    9. Form Validation State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Flag the exact field, inline, with how to fix it.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 9: Terpenuhi</Badge>
              </div>

              <div className="max-w-lg space-y-5 rounded-xl bg-charcoal p-6 border border-white/10">
                {/* Field 1: Phone validation with explicit inline diagnosis & how to fix */}
                <ValidatedField
                  label="Nomor WhatsApp Anggota"
                  required
                  fieldName="phoneNumber"
                  error={
                    triggerValidation && fieldTestValue.length < 10
                      ? "Nomor WhatsApp kurang dari 10 digit angka"
                      : undefined
                  }
                >
                  <Input
                    value={fieldTestValue}
                    onChange={(e) => setFieldTestValue(e.target.value)}
                    placeholder="0812XXXXXXXX"
                  />
                </ValidatedField>

                {/* Field 2: NIK KTP Field test */}
                <ValidatedField
                  label="Nomor Induk Kependudukan (NIK KTP)"
                  required
                  fieldName="idCardNumber"
                  error="NIK KTP belum memenuhi 16 digit angka"
                >
                  <Input
                    defaultValue="32010199"
                    placeholder="16 digit angka KTP"
                  />
                </ValidatedField>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => setTriggerValidation(!triggerValidation)}
                    className="text-xs font-mono uppercase bg-muted-gold text-charcoal font-bold"
                  >
                    {triggerValidation ? "Sembunyikan Validasi" : "Tampilkan Validasi"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SUCCESS STATE */}
          {activeTab === 10 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-display uppercase font-bold text-bone">
                    10. Success State
                  </h2>
                  <p className="text-xs text-bone-muted font-mono">
                    Aturan: Confirm, reassure, then show what happens next.
                  </p>
                </div>
                <Badge variant="gold">Prinsip 10: Terpenuhi</Badge>
              </div>

              <SuccessState
                title="Pendaftaran Anggota Berhasil Dikirimkan!"
                subtitle="Permohonan keanggotaan Anda telah resmi tercatat di database sekretariat komunitas."
                referenceId="REG-BORNEO-2026-8891"
                reassuranceMessage="Seluruh berkas identitas Anda telah diamankan menggunakan enkripsi database standar militer. Privasi nomor telepon & data keluarga Anda dijamin aman 100%."
                dispatchedTo="rider.borneo@gmail.com"
                nextSteps={[
                  {
                    stepNumber: 1,
                    title: "Verifikasi Berkas Calon Anggota",
                    description: "Divisi Keanggotaan memeriksa keabsahan SIM C aktif & nomor rangka motor.",
                    timeframe: "1 x 24 Jam Kerja",
                  },
                  {
                    stepNumber: 2,
                    title: "Penerbitan Nomor KTA Digital",
                    description: "Nomor Registrasi Anggota (NRA) resmi diinput ke sistem e-KTA dengan QR verifikasi.",
                    timeframe: "Setelah Verifikasi",
                  },
                  {
                    stepNumber: 3,
                    title: "Orientasi Kopdar & Penyerahan Rompi",
                    description: "Undangan bergabung ke grup WhatsApp resmi dan pengarahan safety riding perdana.",
                    timeframe: "Jadwal Kopdar Terdekat",
                  },
                ]}
                primaryAction={{
                  label: "Lihat Status Keanggotaan",
                  href: "/member/profile",
                }}
                secondaryAction={{
                  label: "Kembali ke Beranda",
                  href: "/",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

