import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchEventsList } from "@/features/events/queries";
import { formatRupiah, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Agenda Touring — Brotherhood Community Portal",
  description: "Jadwal dan rute ekspedisi touring resmi Brotherhood Motorcycle Community.",
};

export const dynamic = "force-dynamic";

export default async function PublicEventsPage() {
  const allEvents = await fetchEventsList();
  const publishedEvents = allEvents.filter((e) => e.status === "published");

  return (
    <div className="py-16 sm:py-24 bg-asphalt-grit">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
            <span className="h-1.5 w-6 bg-muted-gold rounded-full" />
            <span>Kalender Ekspedisi Resmi</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-bold uppercase tracking-tight text-bone leading-none">
            AGENDA TOURING & <span className="text-metallic-gold">KEGIATAN RESMI</span>
          </h1>
          <p className="text-base sm:text-lg text-bone-muted leading-relaxed font-sans max-w-3xl">
            Pilih dan ikuti kegiatan touring resmi komunitas. Pendaftaran member dilakukan secara terkoordinasi dengan penguncian kapasitas demi menjaga keselamatan barisan konvoi di jalur aspal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedEvents.map((event) => {
            const isFull = event.registeredCount >= event.capacity;

            return (
              <div
                key={event.id || event.slug}
                className="tactical-panel rounded-2xl border border-muted-gold/40 bg-asphalt/90 overflow-hidden flex flex-col justify-between shadow-2xl hover:border-muted-gold transition-all duration-300 group"
              >
                <div>
                  {/* FEATURED IMAGE BANNER */}
                  <div className="relative aspect-[16/9] w-full bg-charcoal overflow-hidden border-b border-white/10">
                    {event.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-charcoal to-asphalt text-bone-muted/40">
                        <ImageIcon className="h-10 w-10 mb-2 stroke-[1.5]" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Brotherhood Expedition</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge variant="gold" className="text-[10px] font-mono tracking-wider shadow-lg">
                        {event.category || "Touring Akbar"}
                      </Badge>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="text-xs font-mono text-charcoal bg-muted-gold px-2.5 py-1 rounded-md font-bold shadow-md">
                        {event.fee > 0 ? formatRupiah(event.fee) : "Gratis (Member)"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <Link href={`/events/${event.slug}`}>
                      <h3 className="font-display text-2xl font-bold text-bone uppercase tracking-tight leading-snug group-hover:text-muted-gold transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-bone-muted leading-relaxed font-sans line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 border-t border-white/5 pt-4 text-xs font-mono text-bone-muted">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                        <span className="text-bone">{formatDate(event.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                        <span className="truncate">{event.location_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                        <span>
                          Kuota:{" "}
                          <strong className="text-muted-gold font-mono">
                            {event.registeredCount} / {event.capacity} Peserta
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link href={`/events/${event.slug}`}>
                    <Button
                      disabled={isFull}
                      className="tactical-cut-sm w-full py-5 text-xs font-display font-bold uppercase tracking-wider bg-muted-gold text-charcoal hover:bg-muted-gold-hover shadow-md disabled:opacity-50"
                    >
                      <span>{isFull ? "Kuota Penuh" : "Lihat Detail & Daftar"}</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
