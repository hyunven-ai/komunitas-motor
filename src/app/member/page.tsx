"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Shield,
  Receipt,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  Sparkles,
  Award,
  Phone,
  QrCode,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMember } from "@/context/member-context";
import { formatRupiah } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  locationName: string;
  startTime: string;
  endTime: string;
  fee: number;
  isRegistered: boolean;
  registrationStatus: string | null;
  invoiceStatus: "none" | "unpaid" | "submitted" | "paid" | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "unpaid" | "submitted" | "paid" | "rejected";
}

interface ForumTopicSummary {
  id: string;
  slug?: string;
  title: string;
  author: string;
  replies: number;
  createdAt: string;
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

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function getTimeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export default function MemberDashboardPage() {
  const { member } = useMember();
  const greetingTime = getTimeOfDayGreeting();
  const greetingName = member?.displayName || member?.fullName?.split(" ")[0] || "Rider";
  const memberNumber = member?.memberNumber || "BMC-2026-MEMBER";

  const [loading, setLoading] = React.useState(true);
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [latestTopics, setLatestTopics] = React.useState<ForumTopicSummary[]>([]);
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([]);
  const [adminWhatsApp, setAdminWhatsApp] = React.useState<string>("6281299887711");

  React.useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [evRes, invRes, forumRes, annRes, setRes] = await Promise.allSettled([
          fetch("/api/member/events", { cache: "no-store" }),
          fetch("/api/member/invoices", { cache: "no-store" }),
          fetch("/api/member/forum", { cache: "no-store" }),
          fetch("/api/member/announcements", { cache: "no-store" }),
          fetch("/api/settings", { cache: "no-store" }),
        ]);

        if (isMounted) {
          if (evRes.status === "fulfilled" && evRes.value.ok) {
            const evJson = await evRes.value.json();
            if (evJson.success && evJson.data?.events) {
              setEvents(evJson.data.events);
            }
          }
          if (invRes.status === "fulfilled" && invRes.value.ok) {
            const invJson = await invRes.value.json();
            if (invJson.success && invJson.data?.invoices) {
              setInvoices(invJson.data.invoices);
            }
          }
          if (forumRes.status === "fulfilled" && forumRes.value.ok) {
            const forumJson = await forumRes.value.json();
            if (forumJson.success && forumJson.data?.topics) {
              setLatestTopics(forumJson.data.topics);
            }
          }
          if (annRes.status === "fulfilled" && annRes.value.ok) {
            const annJson = await annRes.value.json();
            if (annJson.success && Array.isArray(annJson.data)) {
              setAnnouncements(annJson.data);
            }
          }
          if (setRes.status === "fulfilled" && setRes.value.ok) {
            const setJson = await setRes.value.json();
            if (setJson.success && setJson.data?.adminWhatsApp) {
              setAdminWhatsApp(setJson.data.adminWhatsApp.replace(/\D/g, ""));
            }
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const registeredEvents = events.filter((e) => e.isRegistered);
  const nextRegisteredEvent = registeredEvents[0];
  const unpaidInvoices = invoices.filter((i) => i.status === "unpaid");
  const pendingInvoices = invoices.filter((i) => i.status === "submitted");

  const invoiceSummaryText =
    unpaidInvoices.length > 0
      ? `${unpaidInvoices.length} Perlu Dibayar`
      : pendingInvoices.length > 0
      ? "Menunggu Verifikasi"
      : "Lunas / Bebas Iuran";

  return (
    <div className="space-y-6 animate-fade-in text-[#f1f5f9]">
      {/* 1. VIP MEMBER HERO BANNER: APEX COSMIC THEME */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#131724] p-6 sm:p-7 shadow-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* VIP Status Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/40 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                BROTHERHOOD ELITE MEMBER
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                TERVERIFIKASI
              </span>
              <span className="font-mono text-xs text-slate-400 border-l border-white/10 pl-2">
                No. KTA: <strong className="text-white">{memberNumber}</strong>
              </span>
            </div>

            {/* Greeting Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {greetingTime}, Bro {greetingName}!
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Hak istimewa keanggotaan aktif. Pantau jadwal touring lintas kota, presensi QR roll-call, dan maklumat resmi komunitas.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link href="/member/card">
                <button className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all">
                  <CreditCard className="h-4 w-4" />
                  <span>Lihat KTA Digital & QR</span>
                </button>
              </Link>
              <Link href="/member/events">
                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#191e2e] hover:bg-[#20273c] text-slate-200 text-xs px-3.5 py-2 transition-all">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Agenda Touring</span>
                </button>
              </Link>
              <Link href="/member/payments">
                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#191e2e] hover:bg-[#20273c] text-slate-300 text-xs px-3 py-2 transition-all">
                  <Receipt className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Status Iuran</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Mini KTA Smart Pass Frame */}
          <Link
            href="/member/card"
            className="group relative hidden lg:block shrink-0 rounded-xl border border-white/[0.08] bg-[#171b29] hover:border-indigo-500/40 p-4 shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-[#111420] border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner">
                <QrCode className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  KTA SMART PASS
                </span>
                <p className="text-xs font-bold text-white truncate max-w-[130px]">
                  {member?.fullName || "Brotherhood Member"}
                </p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Siap Dipindai
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. PRESTIGE KPI METRIC CARDS (MATCHING APEX SCREENSHOT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Membership Status */}
        <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-emerald-500/40 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Status Member</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400 font-mono">
              Resmi
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white tracking-tight">
              Aktif Penuh
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>KTA Sah & Terverifikasi</span>
          </p>
        </div>

        {/* KPI 2: Touring Registered */}
        <Link href="/member/events" className="block group">
          <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-indigo-500/40 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Touring Terdaftar</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-300 font-mono">
                Terjadwal
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-white tracking-tight">
                {registeredEvents.length}{" "}
                <span className="text-sm font-normal text-slate-400">Agenda</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-[#191e2e] border border-white/[0.06] flex items-center justify-center text-indigo-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Rute & konvoi resmi</span>
              <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                Buka &rarr;
              </span>
            </p>
          </div>
        </Link>

        {/* KPI 3: Invoice / Dues Status */}
        <Link href="/member/payments" className="block group">
          <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-indigo-500/40 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Status Tagihan Iuran</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium font-mono ${
                  unpaidInvoices.length > 0
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                }`}
              >
                {unpaidInvoices.length > 0 ? "Tertunda" : "Lunas"}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div
                className={`text-xl font-bold tracking-tight ${
                  unpaidInvoices.length > 0 ? "text-amber-300" : "text-white"
                }`}
              >
                {invoiceSummaryText}
              </div>
              <div className="h-9 w-9 rounded-lg bg-[#191e2e] border border-white/[0.06] flex items-center justify-center text-indigo-400">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Kas & perbendaharaan</span>
              <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                Kelola &rarr;
              </span>
            </p>
          </div>
        </Link>

        {/* KPI 4: Attendance Rate */}
        <Link href="/member/attendance" className="block group">
          <div className="relative rounded-xl border border-white/[0.08] bg-[#131724] p-5 shadow-xl transition-all duration-200 hover:border-indigo-500/40 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Presensi & Disiplin</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400 font-mono">
                100%
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-white tracking-tight">
                On-Time
              </div>
              <div className="h-9 w-9 rounded-lg bg-[#191e2e] border border-white/[0.06] flex items-center justify-center text-indigo-400">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Log presensi roll-call</span>
              <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                Riwayat &rarr;
              </span>
            </p>
          </div>
        </Link>
      </div>

      {/* 3. MAIN WORKSPACE GRID: 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Spotlight Touring & Forum */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spotlight Next Touring Event */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>Agenda Touring Terdaftar Mendatang</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Touring dan konvoi resmi yang siap Anda ikuti dalam waktu dekat.
                </p>
              </div>

              <Link href="/member/events">
                <button className="text-xs text-indigo-400 hover:text-indigo-300">
                  Semua Agenda &rarr;
                </button>
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Memuat agenda event Anda...</span>
                </div>
              ) : nextRegisteredEvent ? (
                <div className="rounded-xl border border-white/[0.06] bg-[#171b29] p-5 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono text-indigo-300 font-bold">
                          TERDAFTAR
                        </span>
                        {nextRegisteredEvent.invoiceStatus === "paid" && (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-bold">
                            LUNAS
                          </span>
                        )}
                        {nextRegisteredEvent.invoiceStatus === "submitted" && (
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300 font-bold">
                            MENUNGGU VERIFIKASI
                          </span>
                        )}
                        {nextRegisteredEvent.invoiceStatus === "unpaid" && (
                          <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono text-rose-300 font-bold">
                            BELUM LUNAS
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-lg text-white">
                        {nextRegisteredEvent.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        {nextRegisteredEvent.locationName && (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            {nextRegisteredEvent.locationName}
                          </span>
                        )}
                        {nextRegisteredEvent.startTime && (
                          <span className="flex items-center gap-1.5 font-mono text-indigo-300">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {new Date(nextRegisteredEvent.startTime).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Link href={`/member/events/${nextRegisteredEvent.id}`}>
                        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1d2337] px-3 py-1.5 text-xs text-slate-200 hover:text-white hover:bg-[#232b43] transition-all">
                          <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Tiket & QR</span>
                        </button>
                      </Link>
                      {nextRegisteredEvent.invoiceStatus === "unpaid" && nextRegisteredEvent.invoiceId && (
                        <Link href={`/member/payments/${nextRegisteredEvent.invoiceId}`}>
                          <button className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 shadow-sm transition-all">
                            Bayar Iuran
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <span>
                      Iuran Registrasi:{" "}
                      <strong className="text-white">
                        {nextRegisteredEvent.fee > 0
                          ? formatRupiah(nextRegisteredEvent.fee)
                          : "Gratis (Kas Komunitas)"}
                      </strong>
                    </span>
                    {nextRegisteredEvent.invoiceNumber && (
                      <span className="font-mono text-indigo-300 text-[11px] bg-[#111420] px-2 py-0.5 rounded border border-white/[0.06]">
                        #{nextRegisteredEvent.invoiceNumber}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#171b29]/40 p-8 text-center space-y-3">
                  <div className="h-11 w-11 rounded-full bg-[#1e2438] border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Belum Terdaftar Pada Agenda Touring</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Siapkan motor Anda dan ikuti konvoi persaudaraan berikutnya. Cek jadwal touring resmi kami.
                    </p>
                  </div>
                  <Link href="/member/events">
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 transition-all mt-1">
                      <span>Jelajahi Kalender Touring</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Forum Komunitas Terbaru */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  <span>Diskusi Forum Komunitas</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Obrolan rute touring, tips mesin motor, dan silaturahmi antar-anggota.
                </p>
              </div>

              <Link href="/member/forum">
                <button className="rounded-lg border border-white/10 bg-[#191e2e] px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#20273c] transition-all">
                  Buka Forum &rarr;
                </button>
              </Link>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Memuat obrolan forum...</span>
                </div>
              ) : latestTopics.length > 0 ? (
                latestTopics.slice(0, 3).map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/member/forum/${topic.id}`}
                    className="block p-3.5 rounded-xl bg-[#171b29] border border-white/[0.06] hover:border-indigo-500/40 transition-all duration-150 group"
                  >
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {topic.title}
                      </span>
                      <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-indigo-300 text-[10px] font-mono shrink-0">
                        {topic.replies || 0} Balasan
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>Oleh: <strong className="text-slate-300">{topic.author || "Anggota Brotherhood"}</strong></span>
                      <span className="font-mono text-slate-500">{formatRelativeTime(topic.createdAt)}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 rounded-xl bg-[#171b29]/40 border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-xs text-slate-400">Belum ada obrolan terbaru di forum komunitas.</p>
                  <Link href="/member/forum">
                    <button className="text-xs text-indigo-400 hover:underline">
                      Mulai Utas Diskusi Pertama &rarr;
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Maklumat Resmi, KTA Card, & Hotline Basecamp */}
        <div className="space-y-6">
          {/* Maklumat Dewan Pengurus */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                <span>Maklumat Dewan Pengurus</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Official</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Memuat pengumuman...</span>
                </div>
              ) : announcements.length > 0 ? (
                announcements.slice(0, 4).map((ann) => {
                  const isRed = ann.badgeColor === "red" || ann.priority === "urgent";

                  return (
                    <div
                      key={ann.id}
                      className={`p-3.5 rounded-xl bg-[#171b29] border-l-2 ${
                        isRed ? "border-l-rose-500" : "border-l-indigo-500"
                      } space-y-1.5`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-white line-clamp-1">{ann.title}</p>
                        {isRed && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold shrink-0">
                            Penting
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                        {ann.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className={`font-mono font-medium ${isRed ? "text-rose-400" : "text-indigo-300"}`}>
                          {ann.division}
                        </span>
                        <span className="text-slate-500">{formatRelativeTime(ann.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-[#171b29]/40 border border-dashed border-white/10 text-center text-xs text-slate-400">
                  Tidak ada maklumat pengurus baru saat ini.
                </div>
              )}
            </div>
          </div>

          {/* Quick Access KTA Pass Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                KTA DIGITAL RESMI
              </span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9px] text-emerald-400 font-mono font-bold">
                ACTIVE PASS
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-white text-sm">
                {member?.fullName || "Anggota Brotherhood"}
              </p>
              <p className="font-mono text-indigo-300">{memberNumber}</p>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                Tunjukkan QR Code ini kepada panitia saat registrasi ulang touring atau gathering resmi.
              </p>
            </div>

            <Link href="/member/card" className="block">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 shadow-sm transition-all">
                <QrCode className="h-4 w-4" />
                <span>Buka KTA Digital & QR Barcode</span>
              </button>
            </Link>
          </div>

          {/* 24/7 Roadside Assistance & Basecamp Hotline */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131724] shadow-xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Bantuan Darurat Riding (Hotline)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mengalami kendala teknis mesin atau insiden di perjalanan? Hubungi Safety Officer & Basecamp resmi Brotherhood.
            </p>
            <a
              href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
                `Halo Tim Safety Officer Brotherhood, saya ${member?.fullName || "Anggota"} (No. KTA: ${memberNumber}) membutuhkan bantuan darurat teknis kendaraanku di perjalanan.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-1"
            >
              <button className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 text-xs font-semibold py-2 transition-all">
                <Phone className="h-3.5 w-3.5" />
                <span>Hubungi Hotline Basecamp (WhatsApp)</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
