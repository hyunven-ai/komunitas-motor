"use client";

import * as React from "react";
import Link from "next/link";
import {
  Handshake,
  Shield,
  Sparkles,
  ExternalLink,
  Gift,
  ArrowRight,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  User,
  Send,
  Award,
  Calendar,
  AlertCircle,
  HelpCircle,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sponsor, SponsorTier, BusinessCategory } from "@/features/sponsors/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { submitSponsorInquiryAction, recordSponsorClickAction } from "@/features/sponsors/actions";

interface PartnersDirectoryClientProps {
  sponsors: Sponsor[];
}

const CATEGORY_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Semua Kategori" },
  { key: "oil_fluids", label: "Oli & Pelumas" },
  { key: "automotive_parts", label: "Ban & Komponen" },
  { key: "apparel_gear", label: "Apparel & Helm" },
  { key: "workshop_service", label: "Bengkel & Servis" },
  { key: "hospitality_cafe", label: "Rest Point & Cafe" },
];

export function PartnersDirectoryClient({ sponsors }: PartnersDirectoryClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Form State
  const [companyName, setCompanyName] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [tierInterest, setTierInterest] = React.useState<SponsorTier>("official");
  const [category, setCategory] = React.useState<BusinessCategory>("automotive_parts");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [inquiryResult, setInquiryResult] = React.useState<{ success: boolean; message: string } | null>(null);

  const formRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSponsorClick = (id: string) => {
    recordSponsorClickAction(id);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInquiryResult(null);

    const res = await submitSponsorInquiryAction({
      companyName,
      contactPerson,
      email,
      phone,
      tierInterest,
      category,
      message,
    });

    setIsSubmitting(false);
    setInquiryResult(res);

    if (res.success) {
      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setMessage("");
    }
  };

  const filteredSponsors = sponsors.filter((s) => {
    if (selectedCategory !== "all" && s.category !== selectedCategory) return false;
    return true;
  });

  const mainSponsors = filteredSponsors.filter((s) => s.tier === "main");
  const otherPartners = filteredSponsors.filter((s) => s.tier !== "main");

  return (
    <div className="flex flex-col w-full bg-[#0a0d14] text-bone overflow-x-hidden min-h-screen">
      {/* 1. HERO HEADER */}
      <section className="relative py-20 sm:py-24 border-b border-white/[0.08] overflow-hidden bg-[#0a0d14]">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 text-center">
          <ScrollReveal animation="fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.2)] mb-4">
              <Handshake className="h-4 w-4 text-red-500" />
              <span>OFFICIAL PARTNERS & SPONSORSHIP DIRECTORY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tight text-white leading-tight">
              KOLABORASI STRATEGIS & <br />
              <span className="text-red-500">
                BENEFIT EKSKLUSIF ANGGOTA
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
              Ekosistem kemitraan terpercaya bersama brand pelumas, produsen ban, perlengkapan safety riding, bengkel spesialis, serta titik kumpul touring di penjuru Indonesia.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={scrollToForm}
                size="lg"
                className="rounded-xl px-7 py-3 text-xs font-display font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/25 gap-2"
              >
                <span>Ajukan Kemitraan / Sponsorship</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link href="/member/perks">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-7 py-3 text-xs font-display font-bold uppercase tracking-wider border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-red-500/40 gap-2"
                >
                  <Gift className="h-4 w-4 text-red-400" />
                  <span>Katalog Voucher Member</span>
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. CATEGORY FILTER BAR */}
      <section className="sticky top-20 z-30 bg-[#0d101c]/95 border-b border-white/[0.08] backdrop-blur-md py-4">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "bg-[#141829] text-slate-300 hover:text-white border border-white/5 hover:border-white/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MAIN SPONSORS SECTION */}
      {mainSponsors.length > 0 && (
        <section className="py-16 sm:py-20 border-b border-white/[0.08]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-9 w-9 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
                    Main Sponsors (Partner Utama)
                  </h2>
                  <p className="text-xs text-slate-400 font-sans">
                    Mitra premium dengan keterlibatan penuh dalam seluruh agenda ekspedisi nasional Brotherhood MC.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mainSponsors.map((s, idx) => (
                <ScrollReveal key={s.id} animation="fade-up" delay={idx * 150}>
                  <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-[#161a2c] via-[#101424] to-[#0b0e1a] p-7 sm:p-9 shadow-2xl relative overflow-hidden group hover:border-yellow-500/60 transition-all duration-300 flex flex-col justify-between">
                    {/* Background Ambient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[90px] pointer-events-none" />

                    <div>
                      {/* Featured Image & Brand Cover Banner */}
                      <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden mb-6 bg-[#080a12] border border-white/10 group-hover:border-yellow-500/40 transition-colors shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.bannerUrl || s.logoUrl}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#101424] via-[#101424]/40 to-black/20" />

                        {/* Floating Logo Badge on Banner (if provided) */}
                        {s.logoUrl && (
                          <div className="absolute bottom-3 left-4 h-16 w-28 sm:h-20 sm:w-36 rounded-xl bg-[#0a0d14]/95 backdrop-blur-md border border-white/20 p-2.5 flex items-center justify-center shadow-2xl group-hover:border-yellow-500/60 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.logoUrl}
                              alt={s.name}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Tier Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-yellow-500/25 backdrop-blur-md text-yellow-300 border-yellow-500/50 text-[10px] font-mono uppercase tracking-widest px-3 py-1 shadow-lg">
                            MAIN SPONSOR
                          </Badge>
                        </div>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight group-hover:text-yellow-200 transition-colors">
                        {s.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 mt-3 font-sans leading-relaxed">
                        {s.description}
                      </p>

                      {/* Exclusive Member Perk Card */}
                      {s.memberPerk && (
                        <div className="mt-6 p-4 rounded-2xl bg-yellow-950/20 border border-yellow-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 font-sans">
                              <Gift className="h-4 w-4" />
                              <span>{s.memberPerk.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">{s.memberPerk.terms}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-lg inline-block">
                              {s.memberPerk.discountText}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        Kontrak Aktif s/d {s.endDate || "2027"}
                      </span>

                      {s.websiteUrl && (
                        <a
                          href={s.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleSponsorClick(s.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-yellow-400 hover:text-yellow-300 group/link"
                        >
                          <span>Kunjungi Website Resmi</span>
                          <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. OTHER PARTNERS & SUPPORTING MERCHANTS */}
      <section className="py-16 sm:py-20 border-b border-white/[0.08] bg-[#0c0f1a]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
                  Official & Supporting Partners
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Jaringan bengkel rekanan, riding gear, perlengkapan komunikasi, dan rest point touring.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {otherPartners.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-10 text-center">
              <p className="text-sm font-display text-slate-400 uppercase">Tidak ada partner pada kategori ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPartners.map((s, idx) => (
                <ScrollReveal key={s.id} animation="fade-up" delay={idx * 100}>
                  <div className="rounded-2xl border border-white/[0.08] bg-[#131728] p-6 shadow-xl flex flex-col justify-between hover:border-red-500/50 hover:bg-[#161a2e] transition-all duration-300 group h-full">
                    <div>
                      {/* Featured Image & Brand Cover Banner */}
                      <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden mb-4 bg-[#080a12] border border-white/10 group-hover:border-red-500/40 transition-colors shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.bannerUrl || s.logoUrl}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#131728] via-[#131728]/40 to-black/20" />

                        {/* Floating Logo Badge (if provided) */}
                        {s.logoUrl && (
                          <div className="absolute bottom-2.5 left-3 h-14 w-24 rounded-lg bg-[#0a0d14]/95 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-lg group-hover:border-red-500/60 transition-colors">
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
                          <Badge
                            className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 backdrop-blur-md ${
                              s.tier === "event"
                                ? "bg-sky-500/25 text-sky-300 border-sky-500/40"
                                : s.tier === "supporting"
                                ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                                : "bg-red-500/25 text-red-300 border-red-500/40"
                            }`}
                          >
                            {s.tier.toUpperCase()} PARTNER
                          </Badge>
                        </div>
                      </div>

                      <h3 className="font-display text-lg font-bold text-white uppercase group-hover:text-red-400 transition-colors">
                        {s.name}
                      </h3>

                      <p className="text-xs text-slate-300 mt-2 line-clamp-3 font-sans leading-relaxed">
                        {s.description}
                      </p>

                      {s.memberPerk && (
                        <div className="mt-4 p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-red-300 font-semibold font-sans">
                            <Gift className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            <span>{s.memberPerk.title}</span>
                          </div>
                          <p className="text-[11px] font-mono text-emerald-400 font-bold">
                            {s.memberPerk.discountText}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      {s.websiteUrl ? (
                        <a
                          href={s.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleSponsorClick(s.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400 hover:text-red-300"
                        >
                          <span>Kunjungi</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">Official Partner</span>
                      )}

                      <Link
                        href="/member/perks"
                        className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>Klaim Benefit</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. FORMULIR PENGAJUAN KEMITRAAN / SPONSORSHIP */}
      <section ref={formRef} className="py-20 sm:py-24 relative overflow-hidden bg-[#090b12]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/10 blur-[160px] rounded-full pointer-events-none" />

        <div className="container relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 z-10">
          <ScrollReveal animation="fade-up">
            <div className="rounded-3xl border border-white/10 bg-[#121626]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/30 text-red-300 text-xs font-mono font-bold uppercase tracking-widest mb-3">
                  <Handshake className="h-3.5 w-3.5 text-red-500" />
                  <span>PARTNERSHIP INQUIRY FORM</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-white">
                  Ingin Berkolaborasi dengan <br />
                  <span className="text-red-500">
                    Brotherhood Motorcycle Community?
                  </span>
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                  Jangkau ratusan rider aktif terverifikasi, eksposur media sosial touring lintas nusantara, serta kehadiran brand Anda di kalender event akbar kami.
                </p>
              </div>

              {inquiryResult && (
                <div
                  className={`p-4 rounded-2xl mb-8 flex items-start gap-3 text-xs sm:text-sm font-sans ${
                    inquiryResult.success
                      ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-200"
                      : "bg-red-950/80 border border-red-500/40 text-red-200"
                  }`}
                >
                  {inquiryResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{inquiryResult.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nama Brand / Perusahaan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: PT Pelumas Nusantara"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nama Penanggung Jawab (PIC) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                      Email Bisnis *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="partnership@brand.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nomor WhatsApp / Telepon *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0812xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                      Minat Paket Sponsorship *
                    </label>
                    <select
                      value={tierInterest}
                      onChange={(e) => setTierInterest(e.target.value as SponsorTier)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 font-sans"
                    >
                      <option value="main">Main Sponsor (Eksposur Beranda & Lintas Halaman)</option>
                      <option value="official">Official Partner (Section & Halaman Terkait)</option>
                      <option value="event">Event Sponsor (Khusus Agenda Ekspedisi)</option>
                      <option value="supporting">Supporting Partner & Promo Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                      Kategori Bisnis *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 font-sans"
                    >
                      <option value="automotive_parts">Ban & Komponen Motor</option>
                      <option value="oil_fluids">Oli & Pelumas Mesin</option>
                      <option value="apparel_gear">Apparel & Helm Touring</option>
                      <option value="workshop_service">Bengkel & Servis Rekanan</option>
                      <option value="hospitality_cafe">Rest Area & Cafe</option>
                      <option value="other">Kategori Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                    Pesan & Rencana Kolaborasi *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Sampaikan bentuk dukungan yang ingin diajukan, promo yang disiapkan untuk member, atau tautan proposal PDF Anda..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30 gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? "Mengirimkan Pengajuan..." : "Kirimkan Proposal Kemitraan"}</span>
                </Button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
