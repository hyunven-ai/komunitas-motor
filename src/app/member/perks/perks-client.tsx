"use client";

import * as React from "react";
import Link from "next/link";
import {
  Gift,
  CreditCard,
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  Search,
  Sparkles,
  QrCode,
  Tag,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sponsor } from "@/features/sponsors/types";

interface MemberPerksClientProps {
  sponsors: Sponsor[];
}

export function MemberPerksClient({ sponsors }: MemberPerksClientProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const filtered = sponsors.filter((s) => {
    if (selectedCategory !== "all" && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.memberPerk?.title || "").toLowerCase().includes(q) ||
        (s.memberPerk?.discountText || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
            <Gift className="h-4 w-4" />
            <span>Hak Istimewa Anggota Resmi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white mt-1">
            Katalog Benefit & Diskon Partner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5">
            Nikmati potongan harga eksklusif, voucher belanja, dan fasilitas prioritas di seluruh merchant rekanan Brotherhood MC.
          </p>
        </div>

        <Link href="/member/card">
          <Button className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-display text-xs font-bold uppercase tracking-wider px-5 py-2.5 shadow-lg shadow-red-600/30 gap-2">
            <QrCode className="h-4 w-4" />
            <span>Buka KTA Digital</span>
          </Button>
        </Link>
      </div>

      {/* 2. KTA NOTICE BANNER */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-[#12162a] via-[#151a32] to-[#0f1322] p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span>Cara Klaim Diskon & Voucher Partner</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] font-mono">
                KHUSUS ANGGOTA AKTIF
              </Badge>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-sans leading-relaxed">
              Cukup tunjukkan **KTA Digital Holografik** Anda yang masih berlaku dengan status *ACTIVE RIDER* di kasir merchant, atau gunakan kode promo yang tertera di bawah saat bertransaksi online.
            </p>
          </div>
        </div>

        <Link href="/member/card" className="shrink-0">
          <Button
            variant="outline"
            className="border-red-400/40 bg-red-950/40 hover:bg-red-950/60 text-red-300 text-xs font-display font-semibold uppercase tracking-wider"
          >
            Lihat KTA Digital Anda
          </Button>
        </Link>
      </div>

      {/* 3. FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121624] p-4 rounded-2xl border border-white/[0.08]">
        <div className="flex flex-1 items-center gap-3 bg-[#0a0d14] px-3.5 py-2 rounded-xl border border-white/10 max-w-md">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari promo oli, servis bengkel, apparel, atau brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-red-600 text-white"
                : "bg-[#0a0d14] text-slate-400 hover:text-white"
            }`}
          >
            Semua ({sponsors.length})
          </button>
          <button
            onClick={() => setSelectedCategory("oil_fluids")}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all ${
              selectedCategory === "oil_fluids"
                ? "bg-red-600 text-white"
                : "bg-[#0a0d14] text-slate-400 hover:text-white"
            }`}
          >
            Oli & Pelumas
          </button>
          <button
            onClick={() => setSelectedCategory("automotive_parts")}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all ${
              selectedCategory === "automotive_parts"
                ? "bg-red-600 text-white"
                : "bg-[#0a0d14] text-slate-400 hover:text-white"
            }`}
          >
            Ban & Komponen
          </button>
          <button
            onClick={() => setSelectedCategory("apparel_gear")}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all ${
              selectedCategory === "apparel_gear"
                ? "bg-red-600 text-white"
                : "bg-[#0a0d14] text-slate-400 hover:text-white"
            }`}
          >
            Apparel & Helm
          </button>
          <button
            onClick={() => setSelectedCategory("workshop_service")}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all ${
              selectedCategory === "workshop_service"
                ? "bg-red-600 text-white"
                : "bg-[#0a0d14] text-slate-400 hover:text-white"
            }`}
          >
            Bengkel & Servis
          </button>
        </div>
      </div>

      {/* 4. PERKS CARDS GRID */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-12 text-center">
          <Gift className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-display font-bold text-white uppercase">Tidak ada promo ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => {
            const perk = s.memberPerk!;

            return (
              <div
                key={s.id}
                className="rounded-2xl border border-white/[0.08] bg-[#121624] p-6 shadow-xl flex flex-col justify-between hover:border-red-500/50 hover:bg-[#15192e] transition-all duration-300 group relative overflow-hidden"
              >
                <div>
                  {/* Featured Cover Banner */}
                  <div className="relative h-40 sm:h-44 w-full rounded-xl overflow-hidden mb-4 bg-[#080a12] border border-white/10 group-hover:border-red-500/40 transition-colors shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.bannerUrl || s.logoUrl}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121624] via-[#121624]/40 to-black/20" />

                    {/* Floating Brand Logo Badge (if provided) */}
                    {s.logoUrl && (
                      <div className="absolute bottom-2.5 left-3 h-12 w-20 rounded-lg bg-[#0a0d14]/95 backdrop-blur-md border border-white/20 p-1.5 flex items-center justify-center shadow-lg group-hover:border-red-500/60 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.logoUrl}
                          alt={s.name}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-red-500/25 text-red-300 border-red-500/40 backdrop-blur-md">
                        {s.tier.toUpperCase()} PARTNER
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-slate-400">{s.name}</p>
                  <h3 className="font-display text-lg font-bold text-white uppercase group-hover:text-red-300 transition-colors mt-0.5">
                    {perk.title}
                  </h3>

                  {/* Big Discount Badge */}
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-sm font-extrabold shadow-sm">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{perk.discountText}</span>
                  </div>

                  {/* Terms */}
                  {perk.terms && (
                    <p className="text-xs text-slate-300 mt-3 font-sans leading-relaxed bg-[#0a0d14]/70 p-3 rounded-xl border border-white/5">
                      {perk.terms}
                    </p>
                  )}

                  {/* Promo Code Copy Box */}
                  {perk.promoCode && (
                    <div className="mt-4 p-3 rounded-xl bg-[#0a0d14] border border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Kode Promo Online:
                        </span>
                        <span className="font-mono text-xs font-bold text-white tracking-widest">
                          {perk.promoCode}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(perk.promoCode!)}
                        className="h-8 px-2.5 text-xs text-red-400 hover:text-white hover:bg-red-600 gap-1.5 transition-colors"
                      >
                        {copiedCode === perk.promoCode ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Berlaku s/d {s.endDate || "Akhir Tahun"}
                  </span>

                  {s.websiteUrl && (
                    <a
                      href={s.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400 hover:text-red-300 hover:underline"
                    >
                      <span>Kunjungi Merchant</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
