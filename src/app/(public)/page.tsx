import Link from "next/link";
import {
  Shield,
  Calendar,
  Users,
  Award,
  ChevronRight,
  MapPin,
  CheckCircle2,
  QrCode,
  Flame,
  ArrowRight,
  Radio,
  Compass,
  AlertTriangle,
  Clock,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { fetchEventsList } from "@/features/events/queries";
import { getActiveHeroSlides } from "@/features/sliders/queries";
import { getMainSponsors } from "@/features/sponsors/queries";
import { MainSponsors } from "@/components/home/main-sponsors";
import { formatRupiah, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allEvents, heroSlides, mainSponsors] = await Promise.all([
    fetchEventsList(),
    getActiveHeroSlides(),
    getMainSponsors(),
  ]);

  const spotlightEvents = allEvents
    .filter((e) => e.status === "published")
    .slice(0, 3);

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-charcoal">
      {/* 1. CINEMATIC HERO CAROUSEL */}
      <HeroCarousel slides={heroSlides} />

      {/* 2. INFINITE HIGHWAY MARQUEE TICKER TAPE */}
      <div className="relative overflow-hidden bg-tarmac border-y border-white/10 py-3.5 select-none">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-mono tracking-widest text-bone-muted uppercase">
          <span className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-muted-gold" />
            <span className="text-bone font-bold">BROTHERHOOD MC</span>
          </span>
          <span className="text-muted-gold">//</span>
          <span>SATU ASPAL, SATU JIWA</span>
          <span className="text-muted-gold">//</span>
          <span className="text-emerald-400 font-semibold">ZERO-INCIDENT DISCIPLINE</span>
          <span className="text-muted-gold">//</span>
          <span>RESPECT ALL, FEAR NONE</span>
          <span className="text-muted-gold">//</span>
          <span className="text-bone font-bold">142.500+ KM CONQUERED</span>
          <span className="text-muted-gold">//</span>
          <span>ROAD CAPTAIN CERTIFIED</span>
          <span className="text-muted-gold">//</span>
          <span className="text-muted-gold font-bold">EST. OCTOBER 2018</span>
          <span className="text-muted-gold">//</span>
          <span>DIENG &bull; BROMO &bull; BALI &bull; RINJANI</span>
          <span className="text-muted-gold">//</span>
          {/* Duplicate set for smooth infinite loop */}
          <span className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-muted-gold" />
            <span className="text-bone font-bold">BROTHERHOOD MC</span>
          </span>
          <span className="text-muted-gold">//</span>
          <span>SATU ASPAL, SATU JIWA</span>
          <span className="text-muted-gold">//</span>
          <span className="text-emerald-400 font-semibold">ZERO-INCIDENT DISCIPLINE</span>
          <span className="text-muted-gold">//</span>
          <span>RESPECT ALL, FEAR NONE</span>
          <span className="text-muted-gold">//</span>
          <span className="text-bone font-bold">142.500+ KM CONQUERED</span>
          <span className="text-muted-gold">//</span>
          <span>ROAD CAPTAIN CERTIFIED</span>
          <span className="text-muted-gold">//</span>
          <span className="text-muted-gold font-bold">EST. OCTOBER 2018</span>
          <span className="text-muted-gold">//</span>
          <span>DIENG &bull; BROMO &bull; BALI &bull; RINJANI</span>
        </div>
      </div>

      {/* 2.5. MAIN SPONSORS SHOWCASE (LAYER 1) */}
      <MainSponsors sponsors={mainSponsors} />

      {/* 3. BROTHERHOOD PILLARS — ASYMMETRICAL EDITORIAL BENTO */}
      <section className="py-20 sm:py-28 bg-asphalt-grit border-b border-white/10 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header with Road Marker */}
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
                  <span className="h-1.5 w-6 bg-muted-gold rounded-full" />
                  <span>Code of Honor & Heritage</span>
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-bone">
                  PRINSIP KEHORMATAN <span className="text-metallic-gold">BROTHERHOOD</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-bone-muted max-w-md leading-relaxed font-sans">
                Kami bukan sekadar klub motor yang beriringan di aspal. Kami dipersatukan oleh sumpah integritas, disiplin jalan raya, dan rasa hormat kepada sesama.
              </p>
            </div>
          </ScrollReveal>

          {/* Asymmetrical Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Bento Card 1: Flagship Principle (Spans 7 cols) */}
            <ScrollReveal animation="fade-right" delay={100} className="lg:col-span-7 flex flex-col">
              <div className="modern-card-interactive rounded-2xl border border-muted-gold/40 bg-gradient-to-br from-charcoal via-asphalt to-charcoal p-8 sm:p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between group h-full">
                {/* Huge Distressed Number Watermark */}
                <span className="absolute -right-4 -bottom-10 font-display text-[160px] sm:text-[220px] font-black text-white/[0.03] select-none pointer-events-none group-hover:text-muted-gold/[0.08] group-hover:scale-105 transition-all duration-500">
                  01
                </span>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-charcoal border border-muted-gold/50 flex items-center justify-center text-muted-gold shadow-md group-hover:scale-110 group-hover:border-indigo-400 transition-all duration-300">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gold">
                          Prinsip Fundamental #01
                        </span>
                        <h4 className="font-display text-lg font-bold text-bone uppercase tracking-wider">
                          Aturan Emas Jalanan
                        </h4>
                      </div>
                    </div>
                    <Badge variant="gold" className="text-[10px] font-mono shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                      NON-NEGOTIABLE
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-4xl font-display font-bold text-bone uppercase tracking-tight group-hover:text-indigo-200 transition-colors">
                      RESPECT ALL, FEAR NONE
                    </h3>
                    <blockquote className="text-sm sm:text-base text-bone-muted leading-relaxed italic border-l-2 border-muted-gold/60 pl-4 py-1">
                      &ldquo;Jalan raya adalah fasilitas bersama milik rakyat. Strobo liar, sirine intimidatif, dan arogansi knalpot adalah musuh terbesar kehormatan seorang rider sejati.&rdquo;
                    </blockquote>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-bone-muted font-sans">
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-start gap-2.5 hover:border-indigo-500/30 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-muted-gold shrink-0 mt-0.5" />
                      <span>Santun melintasi pemukiman warga desa dan hormati tradisi adat lokal.</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-start gap-2.5 hover:border-indigo-500/30 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-muted-gold shrink-0 mt-0.5" />
                      <span>Nol toleransi bagi anggota yang bersikap arogan terhadap sesama pemotor.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 mt-6 flex items-center justify-between text-xs text-bone-muted">
                  <span className="font-mono text-[11px] text-muted-gold">SOP PASAL 04 — KODE ETIK</span>
                  <Link href="/about" className="text-bone hover:text-muted-gold transition-colors font-medium flex items-center gap-1 group/link">
                    <span>Pelajari AD/ART</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Bento Right Column (Spans 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
              {/* Bento Card 2: Safety Protocol Cockpit */}
              <ScrollReveal animation="fade-left" delay={200} className="flex-1 flex flex-col">
                <div className="modern-card-interactive rounded-2xl border border-white/10 bg-charcoal/90 p-7 sm:p-8 relative overflow-hidden shadow-xl hover:border-muted-gold/40 flex-1 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-asphalt border border-white/10 flex items-center justify-center text-muted-gold group-hover:scale-110 transition-transform">
                        <Award className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        100% SOP COMPLIANCE
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-display font-bold text-bone uppercase tracking-tight mb-2 group-hover:text-indigo-200 transition-colors">
                      Safety Riding Tanpa Kompromi
                    </h3>
                    <p className="text-xs sm:text-sm text-bone-muted leading-relaxed mb-4">
                      Kelayakan teknis pra-touring, helm berstandar internasional, protektor lengkap, dan koordinasi formasi zigzag oleh Road Captain bersertifikat.
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3 text-xs font-mono text-bone">
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-bone-muted">Formasi Konvoi:</span>
                      <span className="text-muted-gold font-bold">Staggered (Selang-Seling)</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-bone-muted">Kecepatan Maksimal Jalur:</span>
                      <span className="text-bone">70 KM/Jam Terkoordinir</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Bento Card 3: Solidarity & Charity */}
              <ScrollReveal animation="fade-left" delay={300} className="flex-1 flex flex-col">
                <div className="modern-card-interactive rounded-2xl border border-white/10 bg-charcoal/90 p-7 sm:p-8 relative overflow-hidden shadow-xl hover:border-muted-gold/40 flex-1 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-asphalt border border-white/10 flex items-center justify-center text-muted-gold group-hover:scale-110 transition-transform">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-gold bg-muted-gold/15 border border-muted-gold/30 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        LEBIH DARI HOBI
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-display font-bold text-bone uppercase tracking-tight mb-2 group-hover:text-indigo-200 transition-colors">
                      Solidaritas & Aksi Kemanusiaan
                    </h3>
                    <p className="text-xs sm:text-sm text-bone-muted leading-relaxed mb-4">
                      Tak ada saudara yang tertinggal saat kendala mesin di tengah rute. Setiap kilometer touring selalu membawa donasi sosial bagi warga terpencil.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-asphalt/80 border border-white/5">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-bone-muted">Donasi Tersalurkan</p>
                      <p className="font-display text-lg font-bold text-muted-gold">Rp 120.000.000+</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-mono text-bone-muted">Titik Baksos</p>
                      <p className="font-display text-lg font-bold text-bone">24 Daerah</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPOTLIGHT AGENDA TOURING — BOARDING PASS / EXPEDITION TICKETS */}
      <section className="py-20 sm:py-28 bg-charcoal border-b border-white/10 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal animation="fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
                  <span className="h-1.5 w-6 bg-muted-gold rounded-full" />
                  <span>Expedition Calendar 2026-2027</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-bone">
                  AGENDA TOURING & <span className="text-metallic-gold">EKSPEDISI RESMI</span>
                </h2>
                <p className="text-xs sm:text-sm text-bone-muted max-w-xl">
                  Setiap event memiliki limitasi kuota peserta ketat demi keselamatan barisan konvoi di jalur aspal.
                </p>
              </div>
              <Link href="/events">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2 justify-center border-white/20 hover:border-muted-gold text-xs font-display font-semibold uppercase tracking-wider py-5 group"
                >
                  <span>Lihat Seluruh Kalender</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spotlightEvents.length === 0 ? (
              <div className="col-span-full p-10 rounded-2xl border border-white/10 bg-asphalt/50 text-center text-bone-muted space-y-4">
                <Calendar className="h-10 w-10 mx-auto text-muted-gold opacity-60" />
                <p className="text-base font-medium text-bone">Belum ada agenda touring yang dipublikasikan saat ini.</p>
                <p className="text-xs text-bone-muted max-w-md mx-auto">
                  Silakan pantau berkala kalender ekspedisi resmi Brotherhood untuk informasi touring akbar mendatang.
                </p>
                <Link href="/events">
                  <Button variant="outline" size="sm" className="text-xs border-white/20 hover:border-muted-gold text-bone">
                    Lihat Arsip Ekspedisi
                  </Button>
                </Link>
              </div>
            ) : (
              spotlightEvents.map((event, idx) => {
                const isFull = event.registeredCount >= event.capacity;
                const remainingSlots = Math.max(0, event.capacity - event.registeredCount);
                const percentage = Math.min(
                  100,
                  Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100)
                );

                return (
                  <ScrollReveal key={event.id || event.slug || idx} animation="fade-up" delay={idx * 150} className="flex flex-col">
                    <div className="modern-card-interactive tactical-panel rounded-2xl border border-muted-gold/40 bg-asphalt/90 overflow-hidden flex flex-col justify-between shadow-2xl hover:border-muted-gold group h-full">
                      <div>
                        {/* Ticket Top Flight / Featured Image Banner */}
                        <div className="relative aspect-[16/9] w-full bg-charcoal overflow-hidden border-b border-white/10">
                          {event.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={event.cover_image_url}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-charcoal via-asphalt to-charcoal text-bone-muted/40">
                              <ImageIcon className="h-10 w-10 mb-2 stroke-[1.5] text-muted-gold/60" />
                              <span className="text-[10px] font-mono uppercase tracking-wider">Brotherhood Expedition</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gold border border-muted-gold/40 bg-charcoal/80 backdrop-blur-sm px-2.5 py-0.5 rounded shadow">
                              {event.category || "TOURING AKBAR"}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            {isFull ? (
                              <span className="text-[10px] font-mono text-red-400 bg-red-950/80 border border-red-500/30 px-2 py-0.5 rounded font-bold backdrop-blur-sm">
                                KUOTA PENUH
                              </span>
                            ) : remainingSlots <= 10 ? (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded font-bold backdrop-blur-sm flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                SISA {remainingSlots} SLOT
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded font-bold backdrop-blur-sm flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                SISA {remainingSlots} SLOT
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 right-3">
                            <span className="text-xs font-mono text-white bg-indigo-600 px-2.5 py-1 rounded-md font-bold shadow-md">
                              {event.fee > 0 ? formatRupiah(event.fee) : "GRATIS (Member)"}
                            </span>
                          </div>
                        </div>

                        {/* Perforated Divider Line */}
                        <div className="relative highway-stripe opacity-40" />

                        {/* Ticket Details Body */}
                        <div className="p-6 space-y-4">
                          <Link href={`/events/${event.slug}`}>
                            <h3 className="font-display text-2xl font-bold text-bone uppercase tracking-tight leading-snug group-hover:text-muted-gold transition-colors line-clamp-2">
                              {event.title}
                            </h3>
                          </Link>

                          <p className="text-xs text-bone-muted leading-relaxed line-clamp-2">
                            {event.description}
                          </p>

                          <div className="space-y-2 text-xs font-mono text-bone border-t border-white/5 pt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-bone-muted flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                                Tanggal:
                              </span>
                              <span className="text-right truncate max-w-[170px]">{formatDate(event.start_time)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-bone-muted flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                                Lokasi:
                              </span>
                              <span className="text-right truncate max-w-[170px]">{event.location_name}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-bone-muted">Biaya Registrasi:</span>
                              <span className="font-bold text-muted-gold font-display text-base">
                                {event.fee > 0 ? formatRupiah(event.fee) : "Gratis"}
                              </span>
                            </div>
                          </div>

                          {/* Convoy Capacity Meter */}
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-[10px] font-mono text-bone-muted">
                              <span>Kapasitas Konvoi</span>
                              <span className="text-bone">
                                {event.registeredCount} / {event.capacity} Rider ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-charcoal overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-muted-gold to-forged-gold transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <Link href={`/events/${event.slug}`}>
                          <Button className="tactical-cut-sm w-full py-5 text-xs font-display font-bold uppercase tracking-wider bg-muted-gold text-white hover:bg-muted-gold-hover shadow-md group/btn">
                            <span>Detail Rute & Registrasi</span>
                            <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1.5 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 5. DIGITAL MEMBERSHIP & HOLOGRAPHIC KTA SHOWCASE */}
      <section className="py-20 sm:py-28 bg-asphalt-grit border-b border-white/10 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative */}
            <ScrollReveal animation="fade-right" className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
                <span className="h-1.5 w-6 bg-muted-gold rounded-full" />
                <span>Modern Member Identification</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-bone leading-tight">
                KTA DIGITAL DENGAN <br />
                <span className="text-metallic-gold">VERIFIKASI QR ANTI-PEMALSUAN</span>
              </h2>

              <p className="text-xs sm:text-sm text-bone-muted leading-relaxed font-sans">
                Setiap anggota Brotherhood yang telah melewati tahapan seleksi dan pelantikan resmi dibekali nomor registrasi urut sistematis dan Kartu Tanda Anggota (KTA) digital. Terhubung langsung dengan database pusat untuk verifikasi presensi touring kilat.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-charcoal/80 border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="h-7 w-7 rounded-lg bg-asphalt border border-muted-gold/40 flex items-center justify-center text-muted-gold shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-display uppercase tracking-wider text-bone">
                      Nomor Anggota Unik Berurutan (Concurrency-Safe)
                    </h5>
                    <p className="text-[11px] text-bone-muted">
                      Mencegah duplikasi nomor KTA secara permanen menggunakan urutan serial otomatis PostgreSQL.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-charcoal/80 border border-white/10 hover:border-indigo-500/40 transition-colors">
                  <div className="h-7 w-7 rounded-lg bg-asphalt border border-muted-gold/40 flex items-center justify-center text-muted-gold shrink-0">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-display uppercase tracking-wider text-bone">
                      Presensi QR Instan di Titik Kumpul
                    </h5>
                    <p className="text-[11px] text-bone-muted">
                      Road Captain cukup memindai QR code dari HP member untuk mencatat absensi dan kelengkapan riding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-charcoal/80 border border-muted-gold/30 hover:border-indigo-500/50 transition-colors">
                  <div className="h-7 w-7 rounded-lg bg-asphalt border border-muted-gold/40 flex items-center justify-center text-muted-gold shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-display uppercase tracking-wider text-bone">
                      Hak Suara Musyawarah & Forum Internal
                    </h5>
                    <p className="text-[11px] text-bone-muted">
                      Akses penuh voting pemilihan pengurus, forum diskusi tertutup, dan potongan harga merchandise resmi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link href="/join" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="tactical-cut w-full sm:w-auto font-display font-bold uppercase tracking-wider text-xs py-6 sm:py-3.5 bg-gradient-to-r from-muted-gold via-forged-gold to-muted-gold text-white hover:brightness-110 shadow-xl shadow-muted-gold/25 group"
                  >
                    <span>Daftar Calon Member Sekarang</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/verify" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="tactical-cut w-full sm:w-auto text-xs font-display font-semibold uppercase tracking-wider py-6 sm:py-3.5 border-white/20 text-bone hover:border-muted-gold"
                  >
                    <span>Verifikasi KTA Publik</span>
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Right: Realistic 3D Holographic KTA Card */}
            <ScrollReveal animation="fade-left" delay={200} className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md animate-float-slow group">
                {/* Decorative Background Glow Ring */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-muted-gold/40 via-sky-500/20 to-indigo-600/50 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                {/* The Physical Card Replica */}
                <div className="relative rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-[#1c2237] via-[#131724] to-[#0b0d14] p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl overflow-hidden group-hover:border-indigo-400 transition-colors duration-500">
                  {/* Subtle carbon weave / metallic lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#818cf8_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                  {/* Top Card Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-muted-gold/60 bg-charcoal shadow-inner group-hover:scale-105 transition-transform">
                        <Shield className="h-6 w-6 text-muted-gold" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-bold tracking-widest text-bone uppercase leading-tight">
                          BROTHERHOOD MC
                        </h4>
                        <p className="text-[9px] uppercase tracking-widest text-muted-gold font-mono">
                          Official Membership Pass
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-[9px] font-mono text-emerald-400 font-bold uppercase shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ACTIVE RIDER
                    </div>
                  </div>

                  {/* Middle Rider Bio & Photo Chip */}
                  <div className="my-6 flex items-center gap-5 relative z-10">
                    {/* Simulated Rider Avatar with Brass Frame */}
                    <div className="h-24 w-24 rounded-xl border-2 border-muted-gold/50 bg-charcoal flex flex-col items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                      <Users className="h-10 w-10 text-muted-gold/70" />
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-600 text-white text-[8px] font-mono font-bold text-center py-0.5 uppercase tracking-wider">
                        VERIFIED
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase tracking-widest text-bone-muted font-mono">Nama Anggota</p>
                      <p className="text-xl font-display font-bold text-bone uppercase tracking-wider">BAMBANG WIJAYA</p>
                      <p className="text-xs font-mono font-bold text-muted-gold">NO: BMC-2024-0012</p>
                      <div className="pt-1">
                        <p className="text-[10px] text-bone-muted font-mono flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-muted-gold" />
                          Kawasaki Versys 650 (B 4421 KBR)
                        </p>
                        <p className="text-[10px] text-bone-muted font-mono flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-muted-gold" />
                          Gold Blood Member &bull; Chapter Bogor
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Verification Footer */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs relative z-10">
                    <div>
                      <p className="text-[9px] uppercase font-mono text-bone-muted">Masa Berlaku KTA</p>
                      <p className="font-mono text-xs font-bold text-bone">PERMANEN (SEUMUR HIDUP)</p>
                    </div>

                    {/* QR Code Scanner Badge */}
                    <div className="flex items-center gap-2 rounded-xl bg-charcoal border border-muted-gold/40 px-3 py-1.5 shadow-md">
                      <QrCode className="h-5 w-5 text-muted-gold" />
                      <div className="text-left font-mono">
                        <p className="text-[8px] uppercase text-bone-muted">Security QR</p>
                        <p className="text-[10px] font-bold text-muted-gold">VALIDATED</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. INITIATION OATH & CALL TO ACTION */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-charcoal via-tarmac to-charcoal border-b border-white/10 text-center relative overflow-hidden">
        {/* Subtle highway center line accent */}
        <div className="absolute top-0 inset-x-0 highway-stripe opacity-50" />
        
        {/* Center Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse-glow" />

        <ScrollReveal animation="scale-up" duration={800} className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-muted-gold/40 bg-asphalt px-4 py-1 text-xs font-mono font-semibold uppercase tracking-widest text-muted-gold shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pintu Terbuka Untuk Rider Sejati</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-bone leading-none">
            SIAP MENJELAJAH BERSAMA <br />
            <span className="text-metallic-gold">KELUARGA BESAR BROTHERHOOD?</span>
          </h2>

          <p className="text-xs sm:text-base text-bone-muted max-w-2xl mx-auto leading-relaxed font-sans">
            Persyaratan utama adalah kepemilikan SIM C aktif, motor terawat prima, dan kesiapan menjunjung tinggi adab berkendara. Terbuka untuk seluruh merk dan kapasitas motor.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/join" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="tactical-cut w-full sm:w-auto px-8 font-display font-bold uppercase tracking-wider text-sm py-6 sm:py-4 bg-gradient-to-r from-muted-gold via-forged-gold to-muted-gold text-white hover:brightness-110 shadow-2xl shadow-muted-gold/30 group"
              >
                <span>Isi Formulir Pendaftaran Sekarang</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="tactical-cut w-full sm:w-auto px-8 font-display font-semibold uppercase tracking-wider text-xs py-6 sm:py-4 border-white/20 text-bone hover:border-muted-gold hover:bg-white/5 transition-colors"
              >
                <span>Pelajari Syarat & SOP Konvoi</span>
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

