import Link from "next/link";
import {
  Shield,
  Calendar,
  MapPin,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  QrCode,
  Compass,
  Award,
  Users,
  Camera,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { MainSponsors } from "@/components/home/main-sponsors";
import { fetchEventsList } from "@/features/events/queries";
import { getActiveHeroSlides } from "@/features/sliders/queries";
import { getMainSponsors } from "@/features/sponsors/queries";
import { fetchGalleryAlbumsList } from "@/features/gallery/queries";
import { fetchNewsArticlesList } from "@/features/cms/queries";
import { getSystemSettings } from "@/features/settings/queries";
import committeeData from "@/data/committee-data.json";
import { formatRupiah, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allEvents, heroSlides, mainSponsors, galleryAlbums, newsArticles, settings] =
    await Promise.all([
      fetchEventsList(),
      getActiveHeroSlides(),
      getMainSponsors(),
      fetchGalleryAlbumsList(),
      fetchNewsArticlesList("published"),
      getSystemSettings(),
    ]);

  const spotlightEvents = allEvents
    .filter((e) => e.status === "published")
    .slice(0, 3);

  const featuredAlbum = galleryAlbums[0] || null;
  const recentStories = newsArticles.slice(0, 2);
  const featuredLeaders = (committeeData?.members || []).slice(0, 4);

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-[#0B0D12] text-[#F5F5F2]">
      {/* 1. DOCUMENTARY HERO */}
      <HeroCarousel slides={heroSlides} />

      {/* 2. GROUNDED DISPATCH BAR (Configurable from Admin Panel) */}
      {settings.showOperationalBar !== false && (
        <section className="bg-[#10121A] border-y border-white/10 py-3.5">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-neutral-200 font-semibold tracking-wider uppercase">
                  Status Operasional
                </span>
                <span className="text-neutral-600">&bull;</span>
                <span>{settings.operationalStatus || "Sekretariat Wilayah Aktif"}</span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <span>
                  <strong className="text-neutral-200">KODE JALAN:</strong>{" "}
                  {settings.roadCode || "Respect All, Fear None"}
                </span>
                <span className="text-neutral-600">&bull;</span>
                <span>
                  <strong className="text-neutral-200">FORMASI KONVOI:</strong>{" "}
                  {settings.convoyFormation || "Staggered Formation (Selang-Seling)"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-500">Kepatuhan AD/ART:</span>
                <span className="text-neutral-200 font-bold">
                  {settings.complianceNote || "100% Zero-Alcohol"}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. EDITORIAL MANIFESTO (Asymmetrical Magazine Layout) */}
      <section className="py-20 sm:py-28 bg-[#0B0D12] border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Bold Typographic Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
                <span className="h-1.5 w-6 bg-red-600 rounded-full" />
                <span>Prinsip Kehormatan Komunitas</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-[#F5F5F2] leading-tight">
                MENJELAJAH DENGAN KEHORMATAN. <br />
                <span className="text-red-500">SATU ASPAL, TANPA AROGANSI.</span>
              </h2>

              <blockquote className="border-l-2 border-red-600 pl-5 py-1 text-sm sm:text-base text-neutral-300 italic font-sans leading-relaxed">
                &ldquo;Jalan raya adalah fasilitas bersama milik rakyat. Strobo liar, sirine intimidatif, dan arogansi knalpot adalah musuh terbesar kehormatan seorang rider sejati.&rdquo;
              </blockquote>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
                Sejak berdiri pada Oktober 2018 di kaki Gunung Salak, Bogor, Brotherhood Motorcycle Community berkomitmen mengikis stigma negatif klub motor. Kami dipersatukan oleh sumpah integritas, disiplin berkendara yang ketat, dan dedikasi sosial di setiap titik singgah ekspedisi.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors group"
                >
                  <span>Pelajari Anggaran Dasar &amp; SOP Konvoi</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: 3 Authentic Tenets */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-lg border border-white/10 bg-[#12141C] transition-colors hover:border-white/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#181B26] border border-white/10 flex items-center justify-center text-red-500 shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                      01. Disiplin Formasi &amp; Komando Road Captain
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Formasi zig-zag teratur dengan batas kecepatan terkoordinasi (maksimal 70 km/jam). Mematuhi sinyal tangan komando Road Captain dan memastikan tidak ada peserta yang terpisah dari barisan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-white/10 bg-[#12141C] transition-colors hover:border-white/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#181B26] border border-white/10 flex items-center justify-center text-red-500 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                      02. Zero Alcohol &amp; Kepatuhan Safety Gear
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Nol toleransi bagi alkohol dan obat terlarang. Wajib menggunakan helm standar SNI/DOT/ECE, jaket berprotektor, sarung tangan tertutup, dan sepatu tinggi menutupi mata kaki.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-white/10 bg-[#12141C] transition-colors hover:border-white/20">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#181B26] border border-white/10 flex items-center justify-center text-red-500 shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-white uppercase tracking-wide">
                      03. Aksi Kemanusiaan &amp; Non-Komersial
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Organisasi tidak mencari keuntungan materiil dari anggota. Setiap agenda ekspedisi selalu mengalokasikan donasi sosial bagi warga lokal di daerah yang dilalui.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING TOURING AGENDA (Editorial Expedition Slate) */}
      <section className="py-20 sm:py-28 bg-[#0E1017] border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Kalender Ekspedisi Resmi 2026–2027
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-[#F5F5F2] mt-1">
                Agenda Touring <span className="text-red-500">Mendatang</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl font-sans">
                Kuota rombongan dibatasi secara ketat demi keselamatan barisan konvoi, keselamatan peserta, dan kelancaran arus lalu lintas publik.
              </p>
            </div>

            <Link href="/events">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs font-display font-semibold uppercase tracking-wider py-4 border-white/20 text-neutral-200 hover:text-white hover:border-white/40 rounded-md"
              >
                <span>Lihat Seluruh Kalender</span>
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {spotlightEvents.length === 0 ? (
              <div className="col-span-full p-12 rounded-lg border border-white/10 bg-[#12141C] text-center text-neutral-400 space-y-4">
                <Calendar className="h-10 w-10 mx-auto text-neutral-500" />
                <p className="text-base font-medium text-white">Belum ada agenda touring yang dipublikasikan saat ini.</p>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Informasi rute ekspedisi berikutnya sedang disurvei oleh Road Captain dan akan diumumkan secara bertahap.
                </p>
                <Link href="/events">
                  <Button variant="outline" size="sm" className="text-xs border-white/20 text-neutral-200">
                    Buka Arsip Ekspedisi
                  </Button>
                </Link>
              </div>
            ) : (
              spotlightEvents.map((event) => {
                const isFull = event.registeredCount >= event.capacity;
                const remainingSlots = Math.max(0, event.capacity - event.registeredCount);

                return (
                  <div
                    key={event.id}
                    className="group rounded-lg border border-white/10 bg-[#12141C] overflow-hidden flex flex-col justify-between transition-colors hover:border-white/25"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative aspect-[16/10] w-full bg-[#181B26] overflow-hidden">
                        {event.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.cover_image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#181B26] text-neutral-500 font-mono text-xs uppercase tracking-wider">
                            Brotherhood Expedition
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Status Stamp */}
                        <div className="absolute top-3 right-3">
                          {isFull ? (
                            <span className="text-[10px] font-mono text-red-400 bg-red-950/80 border border-red-800/60 px-2 py-0.5 rounded font-semibold">
                              KUOTA PENUH
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold">
                              SISA {remainingSlots} SLOT
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                            {event.category || "TOURING RESMI"}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 space-y-3">
                        <Link href={`/events/${event.slug}`}>
                          <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight group-hover:text-red-400 transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 font-sans">
                          {event.description}
                        </p>

                        <div className="space-y-1.5 pt-3 border-t border-white/5 text-xs font-mono text-neutral-300">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                              Waktu:
                            </span>
                            <span className="truncate max-w-[180px]">{formatDate(event.start_time)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                              Lokasi:
                            </span>
                            <span className="truncate max-w-[180px]">{event.location_name}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-neutral-500">Biaya:</span>
                            <span className="font-semibold text-white">
                              {event.fee > 0 ? formatRupiah(event.fee) : "Gratis (Kas Member)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <Link href={`/events/${event.slug}`}>
                        <Button className="w-full py-4 text-xs font-display font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm">
                          <span>Detail Rute &amp; Registrasi</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 5. DOCUMENTARY GALLERY & REAL ACTIVITY STORIES */}
      <section className="py-20 sm:py-28 bg-[#0B0D12] border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Jurnal &amp; Fotografi Lapangan
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-[#F5F5F2] mt-1">
                Catatan Perjalanan &amp; <span className="text-red-500">Dokumentasi</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl font-sans">
                Kisah nyata di balik helm dan aspal — persahabatan, tantangan cuaca ekstrem, dan indahnya bentang alam Indonesia.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/gallery">
                <Button variant="outline" size="sm" className="text-xs border-white/20 text-neutral-200 hover:text-white rounded-md">
                  <Camera className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                  <span>Galeri Foto</span>
                </Button>
              </Link>
              <Link href="/news">
                <Button variant="outline" size="sm" className="text-xs border-white/20 text-neutral-200 hover:text-white rounded-md">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                  <span>Seluruh Berita</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Featured Documentary Photo Frame (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-lg border border-white/10 bg-[#12141C] overflow-hidden">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#181B26] overflow-hidden">
                {featuredAlbum?.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredAlbum.coverImageUrl}
                    alt={featuredAlbum.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#181B26] text-neutral-500 font-mono text-xs">
                    Dokumentasi Ekspedisi
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1">
                    <span>{featuredAlbum?.category || "Ekspedisi Resmi"}</span>
                    <span>&bull;</span>
                    <span>{featuredAlbum?.location || "Nusantara"}</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white leading-snug">
                    {featuredAlbum?.title || "Ekspedisi Dieng Plateau: Kabut Negeri di Atas Awan"}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {featuredAlbum?.description ||
                    "Dokumentasi barisan konvoi saat melintasi tanjakan ekstrem Sikatok dan penyerahan santunan pendidikan bagi warga di lereng pegunungan."}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono text-neutral-400">
                  <span>Waktu: {featuredAlbum?.date || "Oktober 2026"}</span>
                  <Link
                    href="/gallery"
                    className="text-neutral-200 hover:text-white font-medium flex items-center gap-1 group"
                  >
                    <span>Buka Album Foto Lengkap</span>
                    <ArrowRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stacked Field Dispatches / Stories (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {recentStories.map((story) => (
                <div
                  key={story.id}
                  className="rounded-lg border border-white/10 bg-[#12141C] p-6 flex flex-col justify-between flex-1 transition-colors hover:border-white/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase">
                      <span className="text-red-400 font-semibold">{story.category}</span>
                      <span>{story.publishedAt}</span>
                    </div>

                    <Link href={`/news/${story.slug}`}>
                      <h4 className="font-display text-lg font-bold text-white uppercase tracking-tight hover:text-red-400 transition-colors line-clamp-2">
                        {story.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 font-sans">
                      {story.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-neutral-500">
                      Oleh: {story.authorName}
                    </span>
                    <Link
                      href={`/news/${story.slug}`}
                      className="text-xs font-display font-semibold uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1 group"
                    >
                      <span>Baca Catatan</span>
                      <ChevronRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMMUNITY LEADERSHIP (Genuine Committee Data) */}
      <section className="py-20 sm:py-28 bg-[#0E1017] border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Struktur Organisasi Periode 2024–2027
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-[#F5F5F2] mt-1">
                Dewan Pengurus &amp; <span className="text-red-500">Komando Lapangan</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl font-sans">
                Pengurus Brotherhood tidak menerima gaji atau kompensasi komersial. Seluruh jabatan diemban secara sukarela atas dasar kecintaan pada dunia touring dan pelayanan bagi sesama anggota.
              </p>
            </div>

            <Link href="/committee">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs font-display font-semibold uppercase tracking-wider py-4 border-white/20 text-neutral-200 hover:text-white rounded-md"
              >
                <span>Lihat Seluruh Pengurus</span>
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLeaders.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-white/10 bg-[#12141C] p-5 flex flex-col justify-between space-y-4 transition-colors hover:border-white/20"
              >
                <div className="space-y-3">
                  {/* Portrait Avatar */}
                  <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#181B26] border border-white/5">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="w-full h-full object-cover filter grayscale contrast-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider bg-black/80 text-white px-2 py-0.5 rounded border border-white/10">
                        {m.code}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
                      {m.position}
                    </span>
                    <h4 className="font-display text-lg font-bold text-white uppercase tracking-tight mt-0.5">
                      {m.name}
                    </h4>
                    <p className="text-[11px] font-mono text-neutral-400">
                      KTA: {m.memberNumber}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[11px] font-mono text-neutral-400">
                      Tunggangan: <span className="text-neutral-200">{m.motorcycle}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 font-sans">
                  {m.roleDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DIGITAL MEMBERSHIP & QR VERIFICATION (Grounded Matte Card) */}
      <section className="py-20 sm:py-28 bg-[#0B0D12] border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400">
                <span className="h-1.5 w-6 bg-red-600 rounded-full" />
                <span>Identitas &amp; Hak Anggota</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-[#F5F5F2] leading-tight">
                KTA DIGITAL DENGAN <br />
                <span className="text-red-500">VERIFIKASI QR RESMI</span>
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                Setiap anggota Brotherhood yang telah melewati tahapan seleksi administrasi, uji kelayakan safety riding, dan pelantikan resmi dibekali nomor registrasi urut sistematis dan Kartu Tanda Anggota (KTA) digital.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#12141C] border border-white/5">
                  <CheckCircle2 className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                      Nomor Anggota Unik Berurutan
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      Format resmi serial PostgreSQL mencegah duplikasi nomor anggota (misal: BMC-2018-0001).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#12141C] border border-white/5">
                  <QrCode className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                      Presensi QR di Titik Kumpul (Tikum)
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      Road Captain dan Safety Officer memindai kode QR dari layar smartphone member untuk verifikasi kehadiran cepat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#12141C] border border-white/5">
                  <Shield className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                      Hak Suara Musyawarah &amp; Akses Forum
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      Hak memilih kepengurusan dalam Musyawarah Besar dan akses ruang diskusi internal tertutup.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link href="/join" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto font-display font-semibold uppercase tracking-wider text-xs py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm"
                  >
                    <span>Daftar Calon Anggota</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/verify" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-xs font-display font-semibold uppercase tracking-wider py-4 px-6 border-white/20 text-neutral-200 hover:text-white rounded-md"
                  >
                    <span>Verifikasi KTA Publik</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Grounded Matte KTA Card Replica */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12141C] p-7 text-white shadow-xl space-y-6">
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#181B26]">
                      <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold tracking-widest text-white uppercase">
                        BROTHERHOOD MC
                      </h4>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">
                        Official Member Pass
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold">
                    TERVERIFIKASI
                  </span>
                </div>

                {/* Card Bio */}
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-lg border border-white/10 bg-[#181B26] flex flex-col items-center justify-center shrink-0">
                    <Users className="h-8 w-8 text-neutral-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-mono text-neutral-400">Nama Anggota</p>
                    <p className="font-display text-xl font-bold uppercase text-white">
                      BAMBANG WIJAYA
                    </p>
                    <p className="font-mono text-xs font-semibold text-red-400">
                      NO: BMC-2024-0012
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400 pt-0.5">
                      Kawasaki Versys 650 &bull; Chapter Bogor
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-neutral-400">
                  <div>
                    <p className="text-[9px] uppercase text-neutral-500">Masa Berlaku</p>
                    <p className="font-semibold text-neutral-200">SEUMUR HIDUP</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#181B26] border border-white/5 px-3 py-1.5 rounded">
                    <QrCode className="h-4 w-4 text-red-500" />
                    <span className="text-[10px] text-neutral-300">SECURITY QR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INTEGRATED SPONSORS & PARTNERS */}
      <MainSponsors sponsors={mainSponsors} />

      {/* 9. RESTRAINED MEMBERSHIP CTA */}
      <section className="py-20 sm:py-24 bg-[#0B0D12] border-b border-white/10 text-center">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="inline-block border border-white/10 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-neutral-400">
            Pintu Terbuka Untuk Rider Sejati
          </span>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight text-[#F5F5F2] leading-tight">
            SIAP MENJELAJAH BERSAMA <br />
            <span className="text-red-500">KELUARGA BESAR BROTHERHOOD?</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed font-sans">
            Syarat utama adalah memiliki SIM C aktif, motor terawat prima, dan kesiapan menjunjung tinggi adab berkendara. Terbuka bagi seluruh merk dan kapasitas mesin motor.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/join" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 font-display font-semibold uppercase tracking-wider text-xs py-4 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm"
              >
                <span>Isi Formulir Pendaftaran</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 font-display font-semibold uppercase tracking-wider text-xs py-4 border-white/20 text-neutral-200 hover:text-white rounded-md"
              >
                <span>Pelajari Syarat &amp; AD/ART</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
