"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  CreditCard,
  User,
  Calendar,
  CheckSquare,
  Receipt,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Compass,
  Bell,
  Home,
  Loader2,
  Search,
  Sun,
  Moon,
  ChevronsUpDown,
  QrCode,
  SlidersHorizontal,
  CalendarDays,
  ExternalLink,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { MemberProvider, useMember } from "@/context/member-context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const MEMBER_NAV_GROUPS: NavGroup[] = [
  {
    group: "MAIN",
    items: [
      { href: "/member", label: "Dashboard", icon: Home },
      { href: "/member/card", label: "KTA Digital & QR", icon: CreditCard },
      { href: "/member/profile", label: "Profil Anggota", icon: User },
    ],
  },
  {
    group: "AKTIVITAS & TOURING",
    items: [
      { href: "/member/events", label: "Agenda Event", icon: Calendar },
      { href: "/member/attendance", label: "Riwayat Presensi", icon: CheckSquare },
      { href: "/member/forum", label: "Forum Komunitas", icon: MessageSquare },
    ],
  },
  {
    group: "KEUANGAN & BENEFIT",
    items: [
      { href: "/member/payments", label: "Invoice & Iuran", icon: Receipt },
      { href: "/member/perks", label: "Benefit & Diskon Partner", icon: Gift },
    ],
  },
];

function getInitials(name?: string) {
  if (!name) return "BM";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function MemberPortalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTimeRange, setActiveTimeRange] = React.useState("30 days");
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const { member, loading } = useMember();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const fullName = member?.fullName || (loading ? "Memuat..." : "Anggota Brotherhood");
  const memberNumber = member?.memberNumber || (loading ? "..." : "BMC-2026-MEMBER");
  const initials = getInitials(member?.fullName);

  // Active page title
  const currentTitle = React.useMemo(() => {
    for (const group of MEMBER_NAV_GROUPS) {
      for (const item of group.items) {
        if (pathname === item.href) return item.label;
      }
    }
    if (pathname.startsWith("/member/events")) return "Agenda Event";
    if (pathname.startsWith("/member/forum")) return "Forum Komunitas";
    if (pathname.startsWith("/member/payments")) return "Invoice & Iuran";
    return "Dashboard Anggota";
  }, [pathname]);

  return (
    <div className="member-portal-theme flex min-h-screen bg-[#0b0d14] text-[#f1f5f9] selection:bg-indigo-600 selection:text-white relative">
      {/* Cosmic background glow matching image */}
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-indigo-600/10 via-sky-500/5 to-transparent blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-64 w-[450px] h-[450px] bg-gradient-to-tr from-indigo-900/10 via-transparent to-transparent blur-3xl z-0" />

      {/* DESKTOP MEMBER SIDEBAR (MATCHING SCREENSHOT) */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col shrink-0 border-r border-white/[0.07] bg-[#0e111b] relative z-20">
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.07] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#171b29] text-white shadow-inner">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                Brotherhood <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">VIP</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Member Portal</p>
            </div>
          </div>
          <button className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-white/5 transition-colors">
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Search Bar with ⌘K Badge */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative flex items-center rounded-lg bg-[#141724] border border-white/[0.08] px-3 py-2 text-xs text-slate-400 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
            <Search className="h-3.5 w-3.5 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Cari menu portal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
            <span className="ml-2 hidden xl:inline-flex items-center gap-0.5 rounded bg-white/[0.06] border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shrink-0">
              ⌘K
            </span>
          </div>
        </div>

        {/* Categorized Navigation Menu */}
        <nav className="flex-1 space-y-4 px-3 py-2 overflow-y-auto">
          {MEMBER_NAV_GROUPS.map((group) => {
            const filteredItems = group.items.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {group.group}
                </p>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-[#181d2e] text-white font-semibold border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.22)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Card: "Verify this device / KTA Smart Pass" (Matching Screenshot) */}
        <div className="p-3 border-t border-white/[0.07] space-y-3">
          <div className="rounded-xl border border-white/[0.08] bg-[#131724] p-3.5 space-y-2.5">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                KTA Smart Pass Aktif
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Pindai QR ini saat roll-call touring & verifikasi member di basecamp.
              </p>
            </div>

            {/* Stylized QR Container (Matching Screenshot) */}
            <div className="flex items-center justify-center p-3 rounded-lg bg-[#0e111a] border border-white/[0.06]">
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 rounded-md bg-white text-[#0b0d14]">
                  <QrCode className="h-10 w-10 text-slate-900" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]">
                  {memberNumber}
                </span>
              </div>
            </div>

            <Link href="/member/card" className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[11px] h-7 bg-[#171b29] border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              >
                Buka KTA Digital Penuh
              </Button>
            </Link>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar Akun</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* TOPBAR (MATCHING SCREENSHOT) */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#0e111b]/80 px-4 sm:px-6 backdrop-blur-md">
          {/* Mobile Menu Trigger & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg border border-white/10 bg-[#141724]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {currentTitle}
            </h1>
          </div>

          {/* Middle: Segmented Time Filter Pills (Matching Screenshot) */}
          <div className="hidden md:flex items-center rounded-lg bg-[#131724] border border-white/[0.08] p-1 text-xs">
            {["12 months", "30 days", "7 days", "24 hours"].map((period) => (
              <button
                key={period}
                onClick={() => setActiveTimeRange(period)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  activeTimeRange === period
                    ? "bg-[#1d2337] text-white shadow-sm font-semibold border border-white/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Right Controls: Theme Toggle with Beam, Notifications & Profile Chip */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Day / Night Toggle Pill with glowing spotlight effect matching image */}
            <div className="relative flex items-center rounded-full bg-[#131724] border border-white/10 p-0.5 text-slate-400 shadow-inner">
              <div className="pointer-events-none absolute -top-3 -right-2 w-8 h-8 rounded-full bg-sky-400/20 blur-md" />
              <button
                type="button"
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center justify-center h-7 w-7 rounded-full transition-all ${
                  isDarkMode
                    ? "bg-[#1e2438] text-white shadow-md border border-white/15"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Mode Malam"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center justify-center h-7 w-7 rounded-full transition-all ${
                  !isDarkMode
                    ? "bg-amber-400 text-charcoal font-bold shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Mode Terang"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Notification Bell */}
            <button
              className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[#131724] border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Notifikasi"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            </button>

            {/* Profile Chip (Matching Screenshot: Name + Avatar) */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/[0.08]">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                {fullName}
              </span>
              <div className="h-8 w-8 rounded-full border border-indigo-500/40 bg-gradient-to-tr from-indigo-900 to-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE SIDEBAR MODAL */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex w-72 flex-col bg-[#0e111b] p-5 text-white shadow-2xl z-10 border-r border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  Portal Anggota
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="my-3 p-3 rounded-lg bg-[#141724] border border-white/10 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full border border-indigo-500/40 bg-[#1a1f30] flex items-center justify-center text-indigo-300 font-bold text-xs">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{fullName}</p>
                  <p className="text-[10px] font-mono text-indigo-400">{memberNumber}</p>
                </div>
              </div>

              <nav className="flex-1 space-y-4 py-3 overflow-y-auto">
                {MEMBER_NAV_GROUPS.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {group.group}
                    </p>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium ${
                            isActive
                              ? "bg-[#181d2e] text-white font-semibold border border-indigo-500/40"
                              : "text-slate-400 hover:bg-white/[0.04]"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-rose-950/40 border border-rose-800/40 py-2 text-xs text-rose-300 font-semibold"
                >
                  Keluar Akun
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY SCROLL */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function MemberPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MemberProvider>
      <MemberPortalContent>{children}</MemberPortalContent>
    </MemberProvider>
  );
}
