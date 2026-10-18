import Link from "next/link";
import {
  Calendar,
  MapPin,
  Shield,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shirt,
  Navigation,
  Handshake,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate } from "@/lib/utils";
import { fetchEventsList } from "@/features/events/queries";
import { getEventSponsors } from "@/features/sponsors/queries";

export const metadata = {
  title: "Detail Event Touring — Brotherhood Community Portal",
  description: "Rute, itinerary, kapasitas kuota, dan registrasi touring resmi Brotherhood.",
};

export const dynamic = "force-dynamic";

const SAMPLE_EVENTS: Record<string, {
  title: string;
  category: string;
  fee: number;
  capacity: number;
  registeredCount: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  locationName: string;
  locationAddress: string;
  mapLink: string;
  roadCaptain: string;
  description: string;
  coverImageUrl?: string;
  itinerary: { time: string; title: string; note: string }[];
  includes: string[];
  mandatoryGears: string[];
}> = {
  "touring-jalur-selatan-2026": {
    title: "Touring Jalur Selatan Jawa: Pangandaran - Yogyakarta",
    category: "Touring Akbar",
    fee: 350000,
    capacity: 50,
    registeredCount: 36,
    startDate: "24 November 2026",
    endDate: "26 November 2026",
    registrationDeadline: "18 November 2026",
    locationName: "Basecamp Brotherhood, Jl. Puncak No. 45, Bogor",
    locationAddress: "Kumpul pukul 05.00 WIB, Rolling Thunder Start 05.45 WIB",
    mapLink: "https://maps.google.com",
    roadCaptain: "Kapten Dimas Prabowo (RC)",
    description: "Ekspedisi menyusuri keindahan bentang aspal pesisir laut selatan Jawa sepanjang 420 KM. Rute menantang dengan perpaduan tikungan mulus, panorama tebing samudra, serta agenda bakti sosial penyaluran bantuan ke Panti Asuhan Cilacap.",
    coverImageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop",
    itinerary: [
      { time: "Hari 1 - 05.30 WIB", title: "Start Basecamp Bogor & Etape 1", note: "Briefing safety, pembagian formasi regu konvoi menuju Garut - Tasikmalaya." },
      { time: "Hari 1 - 16.00 WIB", title: "Tiba di Pangandaran", note: "Check-in penginapan, makan malam bersama, dan santunan anak yatim piatu pesisir." },
      { time: "Hari 2 - 08.00 WIB", title: "Etape 2: Pangandaran ke Yogyakarta", note: "Menikmati aspal lintas selatan via Kebumen, rest area pantai Menganti." },
      { time: "Hari 2 - 18.00 WIB", title: "Gala Dinner di Yogyakarta", note: "Malam ramah tamah persaudaraan dan penyerahan pin plakat touring." },
      { time: "Hari 3 - 09.00 WIB", title: "Perjalanan Kembali / Bebas", note: "Pelepasan konvoi balik menuju domisili masing-masing." },
    ],
    includes: [
      "Penginapan hotel 2 malam (shared twin)",
      "Official T-Shirt & Emblem Touring Resmi",
      "Sticker Pack & Pin Logam Ekspedisi",
      "Mobil Sweeper & Tim Medis Darurat",
      "Pengawalan & Barisan Safety Officer",
      "Konsumsi & Gala Dinner Yogyakarta",
    ],
    mandatoryGears: [
      "Helm Full Face / Modular standar SNI / DOT",
      "Jaket riding dengan protektor siku & bahu",
      "Sarung tangan kulit / tekstil full finger",
      "Sepatu riding kokoh menutup mata kaki",
      "Surat kendaraan lengkap (STNK & SIM C aktif)",
      "Jas hujan berkualitas (two-piece)",
    ],
  },
};

export default async function PublicEventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [allEvents, eventSponsors] = await Promise.all([
    fetchEventsList(),
    getEventSponsors(slug),
  ]);
  const matchedEvent = allEvents.find((e) => e.slug === slug);

  const fallback = SAMPLE_EVENTS[slug] || SAMPLE_EVENTS["touring-jalur-selatan-2026"];

  const event = {
    title: matchedEvent?.title || fallback.title,
    category: matchedEvent?.category || fallback.category,
    fee: matchedEvent?.fee !== undefined ? matchedEvent.fee : fallback.fee,
    capacity: matchedEvent?.capacity || fallback.capacity,
    registeredCount: matchedEvent?.registeredCount ?? fallback.registeredCount,
    startDate: matchedEvent?.start_time ? formatDate(matchedEvent.start_time) : fallback.startDate,
    endDate: matchedEvent?.end_time ? formatDate(matchedEvent.end_time) : fallback.endDate,
    registrationDeadline: matchedEvent?.registration_deadline ? formatDate(matchedEvent.registration_deadline) : fallback.registrationDeadline,
    locationName: matchedEvent?.location_name || fallback.locationName,
    locationAddress: matchedEvent?.location_address || fallback.locationAddress,
    mapLink: matchedEvent?.map_link || fallback.mapLink,
    roadCaptain: fallback.roadCaptain || "Safety Officer Brotherhood",
    description: matchedEvent?.description || fallback.description,
    coverImageUrl: matchedEvent?.cover_image_url || fallback.coverImageUrl,
    itinerary:
      matchedEvent?.itinerary && matchedEvent.itinerary.length > 0
        ? matchedEvent.itinerary
        : fallback.itinerary,
    includes:
      matchedEvent?.includes && matchedEvent.includes.length > 0
        ? matchedEvent.includes
        : fallback.includes,
    mandatoryGears:
      matchedEvent?.mandatoryGears && matchedEvent.mandatoryGears.length > 0
        ? matchedEvent.mandatoryGears
        : fallback.mandatoryGears,
  };

  const quotaPercent = Math.round((event.registeredCount / Math.max(1, event.capacity)) * 100);
  const remainingQuota = Math.max(0, event.capacity - event.registeredCount);

  return (
    <div className="py-12 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb back */}
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-semibold text-bone-muted hover:text-muted-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Kalender Event</span>
          </Link>
        </div>

        {/* HERO TITLE BLOCK WITH FEATURED IMAGE */}
        <div className="rounded-2xl border border-muted-gold/40 bg-gradient-to-br from-asphalt via-[#1f211f] to-charcoal p-6 sm:p-10 relative overflow-hidden shadow-2xl">
          {event.coverImageUrl && (
            <div className="absolute inset-0 opacity-25 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-asphalt via-asphalt/85 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{event.category}</Badge>
              <Badge variant="secondary" className="font-mono">
                {event.fee === 0 ? "GRATIS" : formatRupiah(event.fee)}
              </Badge>
              <span className="text-xs font-mono text-muted-gold">
                Road Captain: {event.roadCaptain}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-bone leading-tight">
              {event.title}
            </h1>

            <p className="text-sm sm:text-base text-bone-muted leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs text-bone-muted">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-gold" />
                <div>
                  <p className="text-[10px] uppercase">Waktu Pelaksanaan</p>
                  <p className="font-bold text-bone">{event.startDate} - {event.endDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-gold" />
                <div>
                  <p className="text-[10px] uppercase">Batas Pendaftaran</p>
                  <p className="font-bold text-bone">{event.registrationDeadline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-gold" />
                <div>
                  <p className="text-[10px] uppercase">Titik Kumpul Start</p>
                  <p className="font-bold text-bone truncate">{event.locationName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TWO COLUMN GRID: CONTENT & REGISTRATION ACTION CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLS: ITINERARY, INCLUSIONS, GEARS */}
          <div className="lg:col-span-2 space-y-8">
            {/* Itinerary */}
            <Card className="border-white/10 bg-asphalt/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-muted-gold" />
                  <span>Jadwal & Rundown Ekspedisi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.itinerary.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start border-l-2 border-muted-gold pl-4 py-1">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-muted-gold uppercase">
                        {step.time}
                      </span>
                      <h4 className="text-sm font-bold text-bone font-serif">
                        {step.title}
                      </h4>
                      <p className="text-xs text-bone-muted leading-relaxed">
                        {step.note}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Inclusions */}
            <Card className="border-white/10 bg-asphalt/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-muted-gold" />
                  <span>Fasilitas & Paket Peserta</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-bone-muted">
                  {event.includes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mandatory Safety Gears */}
            <Card className="border-white/10 bg-asphalt/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-gold" />
                  <span>Standar Perlengkapan Wajib (Safety Gear)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-bone-muted">
                  {event.mandatoryGears.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-gold shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-bone-muted italic pt-3 border-t border-white/5">
                  Catatan: Safety Officer berhak membatalkan keikutsertaan rider yang tidak memenuhi kelengkapan keselamatan di lokasi titik kumpul demi keselamatan bersama.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT 1 COL: CAPACITY MONITOR & REGISTRATION CTA */}
          <div className="space-y-6">
            <Card className="border-muted-gold/40 bg-asphalt/80 p-6 space-y-6 sticky top-24 shadow-2xl">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-bone-muted">
                  Biaya Kontribusi Event
                </span>
                <p className="text-3xl font-mono font-bold text-muted-gold mt-1">
                  {event.fee === 0 ? "GRATIS" : formatRupiah(event.fee)}
                </p>
                <p className="text-[11px] text-bone-muted">
                  {event.fee === 0 ? "Khusus anggota terverifikasi" : "Per rider (All-in fasilitas)"}
                </p>
              </div>

              {/* Concurrency-safe Capacity Progress */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-bone">Kapasitas Barisan Konvoi</span>
                  <span className="font-mono text-muted-gold font-bold">
                    {event.registeredCount} / {event.capacity} Terisi
                  </span>
                </div>
                <div className="w-full bg-charcoal rounded-full h-3 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-muted-gold to-[#c7af7c] h-3 rounded-full transition-all"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Tersisa {remainingQuota} slot sebelum kuota rombongan ditutup.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link href="/member/events" className="block">
                  <Button size="lg" className="w-full font-bold text-sm gap-2">
                    <span>Daftar Melalui Portal Member</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/join" className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Belum Jadi Member? Daftar Di Sini
                  </Button>
                </Link>
              </div>

              <div className="rounded-lg bg-charcoal/80 p-3 text-[11px] text-bone-muted border border-white/5 space-y-1">
                <p className="font-semibold text-bone flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-muted-gold" />
                  <span>Jaminan Integritas Kuota</span>
                </p>
                <p>
                  Sistem Brotherhood menggunakan *atomic row locking* di database PostgreSQL untuk menjamin tidak ada kelebihan kuota meskipun ratusan anggota mendaftar bersamaan.
                </p>
              </div>
            </Card>

            {/* EVENT SPONSORS / OFFICIAL PARTNERS CARD (LAYER 2) */}
            {eventSponsors.length > 0 && (
              <div className="rounded-2xl border border-red-500/30 bg-[#121626] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-red-400" />
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
                      Didukung Mitra Resmi
                    </h4>
                  </div>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[9px] font-mono">
                    EVENT SPONSOR
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {eventSponsors.map((sp) => (
                    <a
                      key={sp.id}
                      href={sp.websiteUrl || "#"}
                      target={sp.websiteUrl ? "_blank" : undefined}
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 bg-[#0a0d14] p-3 flex flex-col items-center justify-center text-center hover:border-red-500/50 hover:bg-[#161a2c] transition-all group"
                    >
                      <div className="h-14 w-full flex items-center justify-center mb-2 bg-[#080b12] rounded-lg p-2 border border-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sp.logoUrl}
                          alt={sp.name}
                          className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[11px] font-display font-bold text-slate-200 group-hover:text-red-300 truncate w-full">
                        {sp.name}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 truncate w-full mt-0.5">
                        {sp.memberPerk?.discountText || "Mitra Touring"}
                      </span>
                    </a>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 font-sans leading-relaxed border-t border-white/5 pt-2">
                  Tunjukkan KTA Digital Anda di lokasi check point touring untuk klaim diskon & fasilitas khusus peserta.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
