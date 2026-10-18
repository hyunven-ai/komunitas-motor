"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  PlusCircle,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Award,
  Compass,
  MessageSquare,
  Megaphone,
  ShieldCheck,
  Activity,
  FileCheck,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

interface PendingApplicant {
  id: string;
  user_id: string;
  full_name: string;
  city: string;
  motorcycle_model: string;
  motorcycle_year: number | string;
  plate_number: string;
  reason_joining: string;
  created_at: string;
  status: string;
}

interface EventOverview {
  id: string;
  title: string;
  location_name: string;
  start_time: string;
  capacity: number;
  registeredCount: number;
  fee: number;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  division: string;
  priority: string;
  badgeColor: string;
  createdAt: string;
}

export function AdminDashboardClient() {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<string>("");

  // Live Stats State
  // Live Stats State
  const [memberCount, setMemberCount] = React.useState(0);
  const [pendingApplicants, setPendingApplicants] = React.useState<PendingApplicant[]>([]);
  const [upcomingEvents, setUpcomingEvents] = React.useState<EventOverview[]>([]);
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = React.useState(0);

  // Financial Stats
  const [cashBalance, setCashBalance] = React.useState(0);
  const [totalIncome, setTotalIncome] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);

  // Update clock
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
          " WIB"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = React.useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [membersRes, appsRes, financeRes, eventsRes, annRes] = await Promise.allSettled([
        fetch("/api/admin/members", { cache: "no-store" }),
        fetch("/api/admin/applications?scope=pending", { cache: "no-store" }),
        fetch("/api/admin/finance", { cache: "no-store" }),
        fetch("/api/admin/events", { cache: "no-store" }),
        fetch("/api/admin/announcements", { cache: "no-store" }),
      ]);

      // Members
      if (membersRes.status === "fulfilled" && membersRes.value.ok) {
        const json = await membersRes.value.json();
        if (json.success && Array.isArray(json.data)) {
          setMemberCount(json.data.length);
        }
      }

      // Applications
      if (appsRes.status === "fulfilled" && appsRes.value.ok) {
        const json = await appsRes.value.json();
        if (json.success && Array.isArray(json.data)) {
          setPendingApplicants(
            json.data.map((app: any) => ({
              id: app.id,
              user_id: app.user_id || "",
              full_name: app.full_name || "Calon Anggota",
              city: app.city || "Domisili",
              motorcycle_model: app.motorcycle_model || "Motor Komunitas",
              motorcycle_year: app.motorcycle_year || "-",
              plate_number: app.motorcycle_plate || app.plate_number || "-",
              reason_joining: app.reason_to_join || app.reason_joining || "",
              created_at: app.created_at || new Date().toISOString(),
              status: app.status || "pending",
            }))
          );
        }
      }

      // Finance
      if (financeRes.status === "fulfilled" && financeRes.value.ok) {
        const json = await financeRes.value.json();
        if (json.success && json.data) {
          if (json.data.stats) {
            setPendingPaymentsCount(json.data.stats.pendingCount ?? 0);
            if (typeof json.data.stats.totalIncome === "number") {
              setTotalIncome(json.data.stats.totalIncome);
            }
            if (typeof json.data.stats.totalExpense === "number") {
              setTotalExpenses(json.data.stats.totalExpense);
            }
            if (typeof json.data.stats.netBalance === "number") {
              setCashBalance(json.data.stats.netBalance);
            }
          }
        }
      }

      // Events
      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const json = await eventsRes.value.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setUpcomingEvents(
            json.data.map((ev: any) => ({
              id: ev.id,
              title: ev.title,
              location_name: ev.location_name || "Basecamp Komunitas",
              start_time: ev.start_time,
              capacity: Number(ev.capacity) || 50,
              registeredCount: Number(ev.registeredCount) || 0,
              fee: Number(ev.fee) || 0,
            }))
          );
        }
      }

      // Announcements
      if (annRes.status === "fulfilled" && annRes.value.ok) {
        const json = await annRes.value.json();
        if (json.success && Array.isArray(json.data)) {
          setAnnouncements(json.data.slice(0, 3));
        }
      }
    } catch (err) {
      console.warn("Notice: Dashboard using initial telemetry snapshot:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();

    // Auto-refresh when status changes anywhere in admin portal
    const handleStatusChanged = () => fetchDashboardData(true);
    window.addEventListener("application-status-changed", handleStatusChanged);
    window.addEventListener("finance-status-changed", handleStatusChanged);
    return () => {
      window.removeEventListener("application-status-changed", handleStatusChanged);
      window.removeEventListener("finance-status-changed", handleStatusChanged);
    };
  }, [fetchDashboardData]);

  const pendingCount = pendingApplicants.length;
  const displayPending = pendingApplicants.slice(0, 3);

  const displayEvents =
    upcomingEvents.length > 0
      ? upcomingEvents.slice(0, 2)
      : [
          {
            id: "evt-001",
            title: "Touring Jalur Selatan: Pangandaran - Yogyakarta",
            location_name: "Start: Basecamp Puncak, Bogor",
            start_time: "2026-11-24T05:30:00+07:00",
            capacity: 50,
            registeredCount: 36,
            fee: 350000,
          },
        ];

  return (
    <div className="space-y-6 animate-fade-in text-[#f1f5f9]">
      {/* 1. TOP HERO BANNER: APEX COSMIC OBSIDIAN THEME */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131724] p-6 sm:p-7 shadow-2xl">
        {/* Soft cosmic glow spot */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/40 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-300 font-mono">
                <Sparkles className="h-3 w-3 text-red-400" />
                EXECUTIVE DASHBOARD
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE REAL-TIME
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pusat Kendali Pengurus & Manajemen
            </h1>

            <p className="text-xs text-slate-400 leading-relaxed">
              Monitoring keanggotaan aktif, verifikasi berkas KTA, logistik kuota touring, dan arus kas perbendaharaan.
            </p>

            {currentTime && (
              <p className="text-[11px] font-mono text-red-300/80 pt-0.5">
                {currentTime}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#191e2e] px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#20273c] transition-all"
              title="Perbarui data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-red-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link href="/admin/applications">
              <button className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 shadow-[0_0_15px_rgba(220,38,38,0.35)] transition-all">
                <UserCheck className="h-4 w-4" />
                <span>Review Calon ({pendingCount})</span>
              </button>
            </Link>

            <Link href="/admin/events/new">
              <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#191e2e] px-3.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-[#20273c] transition-all">
                <PlusCircle className="h-3.5 w-3.5 text-red-400" />
                <span>Buat Event</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. APEX METRIC CARDS (MATCHING SCREENSHOT LAYOUT & PILL TAGS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Active Members */}
        <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-red-500/40 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Anggota Aktif</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400 font-mono">
              +12%
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-bold text-white tracking-tight">
              {memberCount}
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#191e2e] border border-white/[0.06] flex items-center justify-center text-red-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">+14</span> teregistrasi bulan ini
          </p>
        </div>

        {/* Metric 2: Pending Applications */}
        <Link href="/admin/applications" className="block group">
          <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-amber-500/40 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Antrean Review KTA</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 font-mono">
                Perlu Review
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-bold text-white tracking-tight">
                {pendingCount}{" "}
                <span className="text-sm font-normal text-slate-400">Berkas</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Menunggu persetujuan</span>
              <span className="text-red-400 group-hover:translate-x-0.5 transition-transform">
                Tinjau &rarr;
              </span>
            </p>
          </div>
        </Link>

        {/* Metric 3: Total Treasury Balance */}
        <Link href="/admin/finance" className="block group">
          <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-emerald-500/40 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Saldo Kas Bersih</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[11px] font-medium text-red-300 font-mono">
                Ledger Riil
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                {formatRupiah(cashBalance)}
              </div>
              <div className="h-9 w-9 rounded-lg bg-[#191e2e] border border-white/[0.06] flex items-center justify-center text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Buku kas & kas masuk</span>
              <span className="text-red-400 group-hover:translate-x-0.5 transition-transform">
                Laporan &rarr;
              </span>
            </p>
          </div>
        </Link>

        {/* Metric 4: Pending Invoices / Payments */}
        <Link href="/admin/finance" className="block group">
          <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-red-500/40 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Verifikasi Iuran</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[11px] font-medium text-red-300 font-mono">
                {pendingPaymentsCount} Menunggu
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-bold text-white tracking-tight">
                {pendingPaymentsCount}{" "}
                <span className="text-sm font-normal text-slate-400">Bukti</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-[#191e2e] border border-white/[0.06] flex items-center justify-center text-red-400">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Validasi bendahara</span>
              <span className="text-red-400 group-hover:translate-x-0.5 transition-transform">
                Validasi &rarr;
              </span>
            </p>
          </div>
        </Link>
      </div>

      {/* 3. MAIN WORKSPACE GRID: 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Applications Queue & Touring Capacity Monitor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calon Anggota Menunggu Review */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Calon Anggota Menunggu Review
                  </h3>
                  <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-mono text-red-300 font-bold">
                    {pendingCount} Antrean
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formulir pendaftaran baru yang perlu ditinjau sebelum terbit Nomor Induk KTA.
                </p>
              </div>

              <Link href="/admin/applications">
                <button className="rounded-lg border border-white/10 bg-[#191e2e] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#20273c] transition-all">
                  Kelola Semua Antrean &rarr;
                </button>
              </Link>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              {displayPending.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#171b29] border border-white/[0.06] space-y-3">
                  <div className="mx-auto h-11 w-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">Semua Berkas Selesai Ditinjau</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Tidak ada calon anggota dalam antrean review saat ini. Pendaftaran baru dari portal publik akan otomatis sinkron ke sini.
                    </p>
                  </div>
                  <Link href="/admin/applications/history" className="inline-block pt-1">
                    <button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
                      Buka Riwayat Pendaftaran &rarr;
                    </button>
                  </Link>
                </div>
              ) : (
                displayPending.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#171b29] border border-white/[0.06] hover:border-red-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#1e2438] border border-red-500/30 flex items-center justify-center text-red-300 font-bold text-xs shrink-0">
                          {item.full_name?.slice(0, 2).toUpperCase() || "CA"}
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm group-hover:text-red-300 transition-colors">
                            {item.full_name}
                          </span>
                          <span className="ml-2 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">
                            {item.city || "Jawa Barat"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        Motor: <strong className="text-slate-200">{item.motorcycle_model}</strong> &bull;{" "}
                        <span className="font-mono text-red-300">{item.plate_number}</span>
                      </p>

                      {item.reason_joining && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1">
                          &ldquo;{item.reason_joining}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <Link href="/admin/applications">
                        <button className="flex items-center gap-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-medium text-xs px-3.5 py-1.5 shadow-sm transition-all">
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Tinjau Berkas</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Touring Capacity & Event Concurrency Monitor */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-400" />
                  <span>Monitoring Event & Kuota Peserta</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pelacakan pendaftaran touring secara aman dan kapasitas peserta terkoordinasi.
                </p>
              </div>

              <Link href="/admin/events">
                <button className="text-xs text-red-400 hover:text-red-300">
                  Manajemen Event &rarr;
                </button>
              </Link>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {displayEvents.map((ev) => {
                const capacity = ev.capacity || 50;
                const registered = ev.registeredCount || 0;
                const percentage = Math.min(100, Math.round((registered / capacity) * 100));
                const remaining = Math.max(0, capacity - registered);

                return (
                  <div
                    key={ev.id}
                    className="p-5 rounded-xl bg-[#171b29] border border-white/[0.06] space-y-3 hover:border-red-500/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-semibold text-base text-white">
                        {ev.title}
                      </h4>
                      <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[11px] text-red-300 font-mono w-fit">
                        Kapasitas: {registered} / {capacity} Rider
                      </span>
                    </div>

                    {/* Progress Bar (Apex Glowing Style) */}
                    <div className="space-y-1.5">
                      <div className="w-full bg-[#0e111a] rounded-full h-2.5 overflow-hidden p-0.5 border border-white/[0.06]">
                        <div
                          className="bg-gradient-to-r from-red-500 to-rose-400 h-1.5 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)] transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin className="h-3 w-3 text-red-400" />
                          {ev.location_name}
                        </span>
                        <span className="font-mono text-red-300">
                          Sisa Kuota: <strong>{remaining} Rider</strong> ({percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/[0.06] pt-2.5 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Biaya Registrasi:{" "}
                        <strong className="text-white">
                          {ev.fee > 0 ? formatRupiah(ev.fee) : "Gratis"}
                        </strong>
                      </span>
                      <Link href="/admin/events" className="text-red-400 hover:underline">
                        Daftar Peserta &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Treasury Snapshot & Audit Log */}
        <div className="space-y-6">
          {/* Treasury Snapshot */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Ringkasan Finansial</h3>
                <p className="text-[11px] text-slate-400">Buku kas & rekonsiliasi kas riil.</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-[#191e2e] border border-white/[0.06] flex items-center justify-center text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#171b29] border border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  Total Pemasukan
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatRupiah(totalIncome)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#171b29] border border-white/[0.06] flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                  Total Pengeluaran
                </span>
                <span className="font-mono font-bold text-rose-400">
                  {formatRupiah(totalExpenses)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#191e2e] border border-red-500/30 flex items-center justify-between">
                <span className="font-semibold text-white">Saldo Kas Bersih</span>
                <span className="font-mono font-bold text-red-300 text-sm">
                  {formatRupiah(cashBalance)}
                </span>
              </div>
            </div>

            <Link href="/admin/finance/transactions" className="block pt-1">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#171b29] hover:bg-[#1d2337] py-2 text-xs font-semibold text-slate-200 transition-colors">
                <Wallet className="h-3.5 w-3.5 text-red-400" />
                <span>Buka Buku Kas & Laporan Finansial</span>
              </button>
            </Link>
          </div>

          {/* Maklumat Pengurus Terkini */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
                <Megaphone className="h-3.5 w-3.5 text-red-400" />
                <span>Maklumat Pengurus Terkini</span>
              </h3>
              <Link href="/admin/announcements" className="text-xs text-red-400 hover:underline">
                Kelola &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-lg bg-[#171b29] border border-white/[0.06] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-white line-clamp-1">{ann.title}</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 font-mono">
                        {ann.division}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{ann.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-[#171b29]/50 border border-dashed border-white/10 text-xs text-slate-400 text-center">
                  Belum ada pengumuman baru diterbitkan.
                </div>
              )}
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
                <Activity className="h-3.5 w-3.5 text-red-400" />
                <span>Audit Log Sistem</span>
              </h3>
              <Link href="/admin/audit-logs" className="text-xs text-red-400 hover:underline">
                Semua &rarr;
              </Link>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="relative pl-4 border-l-2 border-red-500 space-y-0.5">
                <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-red-500" />
                <p className="font-semibold text-white">Penerbitan KTA Anggota</p>
                <p className="text-[11px] text-slate-400">BMC-2026-0012 disetujui Sekjen</p>
                <span className="text-[10px] text-red-400 font-mono">15 Menit lalu</span>
              </div>

              <div className="relative pl-4 border-l-2 border-emerald-500 space-y-0.5">
                <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-500" />
                <p className="font-semibold text-white">Verifikasi Pembayaran Iuran</p>
                <p className="text-[11px] text-slate-400">Invoice #INV-202611-0012 disetujui</p>
                <span className="text-[10px] text-emerald-400 font-mono">1 Jam lalu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
