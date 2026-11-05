import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-asphalt-grit">
      <div className="max-w-xl w-full rounded-2xl border border-white/10 bg-asphalt/90 backdrop-blur-md p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center space-y-3 relative z-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-charcoal border border-white/15 text-muted-gold shadow-inner">
            <Compass className="h-8 w-8 stroke-[1.75]" />
          </div>

          <span className="text-[11px] font-mono tracking-widest uppercase text-muted-gold font-bold">
            KODE 404: RUTE TERSESAT
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-bone">
            Jalur Tidak Ditemukan
          </h1>
          <p className="text-sm text-bone-muted font-sans leading-relaxed">
            Halaman atau tautan yang Anda tuju telah dipindahkan, rute jalan ditutup, atau alamat URL salah ketik.
          </p>
        </div>

        <div className="rounded-xl bg-charcoal/70 border border-white/5 p-4 text-xs font-mono text-bone-muted text-left space-y-1">
          <span className="text-bone font-semibold block">Saran Navigasi:</span>
          <p>• Periksa kembali ejaan URL pada peramban Anda.</p>
          <p>• Rute touring dan kalender resmi dapat diakses melalui menu agenda.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
          <Link href="/">
            <Button className="px-6 py-5 text-xs font-display font-bold uppercase tracking-wider bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
          <Link href="/events">
            <Button
              variant="outline"
              className="px-5 py-5 text-xs font-display uppercase tracking-wider border-white/20 hover:bg-white/5"
            >
              Lihat Agenda Touring
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

