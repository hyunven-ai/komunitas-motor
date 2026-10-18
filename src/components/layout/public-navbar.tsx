"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, User, UserPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/committee", label: "Pengurus" },
  { href: "/events", label: "Agenda Touring" },
  { href: "/partners", label: "Partner" },
  { href: "/news", label: "Kabar & Berita" },
  { href: "/gallery", label: "Galeri" },
];

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  // Scroll listener for seamless floating vs frosted glass transition
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* PROFESSIONAL & ELEGANT FLOATING NAVBAR */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#0b0d14]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-xl shadow-black/50"
            : "bg-gradient-to-b from-[#0b0d14]/90 via-[#0b0d14]/40 to-transparent border-b border-white/[0.05]"
        }`}
      >
        <div className="container mx-auto flex h-20 max-w-7xl 2xl:max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Lockup */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-3.5 shrink-0 pr-4 lg:pr-8"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#161a29] border border-indigo-500/30 shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:border-indigo-400">
              <Shield className="h-5 w-5 text-indigo-400 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-wider text-white uppercase group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                BROTHERHOOD
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] tracking-widest text-indigo-400 font-mono uppercase font-semibold whitespace-nowrap">
                  Motorcycle Community
                </span>
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-3 py-2 text-xs xl:text-sm font-medium tracking-wide whitespace-nowrap rounded-lg transition-all ${
                    isActive
                      ? "text-indigo-400 font-bold bg-indigo-500/10"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Subtle Elegant Underline Indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2 h-0.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Actions */}
          <div className="hidden sm:flex items-center gap-3 xl:gap-4 shrink-0 pl-4 lg:pl-8 border-l border-white/[0.08]">
            <Link
              href="/login"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5 whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Portal Member</span>
            </Link>
            <Link href="/join" className="shrink-0">
              <Button
                size="sm"
                className="rounded-full px-5 py-2 text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 gap-2 whitespace-nowrap"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Gabung Member</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg border border-white/10 text-slate-200 hover:text-indigo-400 hover:bg-white/5 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-indigo-400" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. MOBILE FULLSCREEN DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden bg-[#0b0d14]/98 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200">
          {/* Drawer Top Header Bar */}
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 border-b border-white/[0.08] bg-[#131724]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#161a29] border border-indigo-500/40 shadow-md">
                <Shield className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-bold tracking-widest text-white uppercase">
                    BROTHERHOOD
                  </span>
                  <span className="text-[9px] font-mono px-1 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    MC
                  </span>
                </div>
                <span className="text-[9px] tracking-widest text-indigo-400 font-mono uppercase font-semibold">
                  Touring Community
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg border border-indigo-500/40 text-indigo-400 bg-[#161a29] hover:bg-white/5 focus:outline-none transition-colors"
              aria-label="Tutup navigasi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
            {/* Live Status Pill in Drawer */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#131724] border border-white/[0.08] text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">ROAD OPS: ALL CLEAR</span>
              </div>
              <span className="text-indigo-400 text-[10px]">CH-04</span>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1.5">
              <div className="px-1 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Menu Utama
              </div>
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "text-indigo-400 bg-[#161a29] border border-indigo-500/30 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-indigo-400/60" />
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-white/[0.08] space-y-3">
              <Link href="/join" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button className="w-full justify-center text-xs font-display font-bold uppercase tracking-wider py-6 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Daftar Calon Member</span>
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full justify-center text-xs py-5 border-white/20 text-white hover:border-indigo-400 hover:bg-white/5">
                  <User className="h-4 w-4 mr-2 text-indigo-400" />
                  <span>Portal Member / Login</span>
                </Button>
              </Link>
            </div>

            {/* Quick Hotline Info */}
            <div className="p-3.5 rounded-xl bg-[#07090e] border border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1 text-center">
              <p className="text-indigo-400 font-bold">EMERGENCY ROAD CALL</p>
              <p>+62 812-9988-7711 (Basecamp Puncak)</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

