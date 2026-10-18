"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, User, UserPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/events", label: "Agenda Touring" },
  { href: "/gallery", label: "Dokumentasi" },
  { href: "/news", label: "Kabar & Cerita" },
  { href: "/committee", label: "Pengurus" },
  { href: "/partners", label: "Mitra" },
];

import { SystemSettings } from "@/features/settings/types";

interface PublicNavbarProps {
  settings?: SystemSettings;
}

export function PublicNavbar({ settings }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#0B0D12]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/60"
            : "bg-gradient-to-b from-[#0B0D12]/95 via-[#0B0D12]/70 to-transparent border-b border-white/5"
        }`}
      >
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Lockup */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-3 shrink-0 pr-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#14161F] border border-white/10 transition-colors group-hover:border-red-600/60">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-wider text-[#F5F5F2] uppercase group-hover:text-red-400 transition-colors whitespace-nowrap">
                BROTHERHOOD
              </span>
              <span className="text-[10px] tracking-widest text-neutral-400 font-mono uppercase">
                Touring &bull; Est. 2018
              </span>
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
                  className={`relative px-3 py-2 text-xs xl:text-sm font-medium tracking-wide whitespace-nowrap rounded-md transition-colors ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-3 h-0.5 bg-red-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Actions */}
          <div className="hidden sm:flex items-center gap-4 shrink-0 pl-6 border-l border-white/10">
            <Link
              href="/login"
              className="flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors py-2 px-2.5 rounded-md hover:bg-white/5 whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5 text-neutral-400" />
              <span>Login Member</span>
            </Link>
            <Link href="/join" className="shrink-0">
              <Button
                size="sm"
                className="rounded-md px-4 py-2 text-xs font-display font-semibold tracking-wider uppercase bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors gap-2 whitespace-nowrap"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Gabung Anggota</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-white/10 text-neutral-200 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-red-500" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden bg-[#0B0D12]/98 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          {/* Drawer Top Header Bar */}
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-[#12141C]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#181B26] border border-white/10">
                <Shield className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-bold tracking-widest text-[#F5F5F2] uppercase">
                  BROTHERHOOD MC
                </span>
                <span className="text-[9px] tracking-widest text-neutral-400 font-mono uppercase">
                  Touring Community
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg border border-white/10 text-neutral-200 bg-[#181B26] hover:bg-white/5 focus:outline-none transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="h-5 w-5 text-red-400" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {/* Navigation Links */}
            <div className="space-y-1">
              <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Navigasi Situs
              </div>
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white bg-white/10 font-bold border-l-2 border-red-500"
                        : "text-neutral-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link href="/join" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button className="w-full justify-center text-xs font-display font-semibold uppercase tracking-wider py-5 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Daftar Calon Anggota</span>
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full justify-center text-xs py-5 border-white/20 text-neutral-200 hover:text-white hover:bg-white/5 rounded-md">
                  <User className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>Portal Login Anggota</span>
                </Button>
              </Link>
            </div>

            {/* Road Emergency Hotline */}
            <div className="p-4 rounded-lg bg-[#12141C] border border-white/5 text-[11px] font-mono text-neutral-400 space-y-1 text-center">
              <p className="text-red-400 font-bold tracking-wider uppercase">Sekretariat & Hotline</p>
              <p>
                {settings?.hotlinePhone || "+62 812-9988-7711"} (
                {settings?.basecampAddress || "Basecamp Puncak, Bogor"})
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
