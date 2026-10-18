import Link from "next/link";
import { Shield, MapPin, Phone, Mail } from "lucide-react";
import { SystemSettings } from "@/features/settings/types";

interface PublicFooterProps {
  settings?: SystemSettings;
}

export function PublicFooter({ settings }: PublicFooterProps) {
  const basecampAddress =
    settings?.basecampAddress ||
    "Basecamp Brotherhood, Jl. Jalur Puncak No. 45, Bogor, Jawa Barat";
  const hotlinePhone = settings?.hotlinePhone || "+62 812-9988-7711";
  const secretariatEmail =
    settings?.secretariatEmail || "sekretariat@brotherhood.id";
  const siteName = settings?.siteName || "Brotherhood Motorcycle Community";

  const cleanPhoneForTel = hotlinePhone.replace(/[^\d+]/g, "");

  return (
    <footer className="border-t border-white/10 bg-[#07080C] text-[#F5F5F2]">
      {/* Highway Center Line Stripe */}
      <div className="highway-stripe opacity-40" />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Identity */}
          <div className="space-y-4 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#12141C]">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-wider text-[#F5F5F2] uppercase">
                  BROTHERHOOD MC
                </span>
                <p className="text-[10px] tracking-widest text-neutral-400 font-mono uppercase">
                  Est. 2018 &bull; {siteName}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
              Komunitas pecinta touring motor roda dua berasaskan persaudaraan sejati, ketertiban di jalan raya, dan komitmen zero-accident safety riding di setiap rute aspal Nusantara.
            </p>
            <div className="pt-1 text-xs font-mono text-neutral-400">
              <span className="inline-block border border-white/10 px-2.5 py-1 rounded bg-white/[0.02]">
                100% Non-Politik &amp; Non-Komersial
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300 font-mono">
              Eksplorasi
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-400 font-sans">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  Tentang Komunitas &amp; AD/ART
                </Link>
              </li>
              <li>
                <Link href="/events" className="transition-colors hover:text-white">
                  Kalender Agenda Touring
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="transition-colors hover:text-white">
                  Dokumentasi Lapangan
                </Link>
              </li>
              <li>
                <Link href="/news" className="transition-colors hover:text-white">
                  Catatan Perjalanan &amp; Berita
                </Link>
              </li>
              <li>
                <Link href="/committee" className="transition-colors hover:text-white">
                  Dewan Pengurus 2024–2027
                </Link>
              </li>
              <li>
                <Link href="/partners" className="transition-colors hover:text-white">
                  Mitra &amp; Rekanan Resmi
                </Link>
              </li>
            </ul>
          </div>

          {/* Member & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300 font-mono">
              Keanggotaan
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-400 font-sans">
              <li>
                <Link href="/join" className="transition-colors hover:text-white">
                  Pendaftaran Anggota Baru
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Portal Login Anggota
                </Link>
              </li>
              <li>
                <Link href="/about#safety-pledge" className="transition-colors hover:text-white">
                  Ikrar Keselamatan Berkendara
                </Link>
              </li>
            </ul>
          </div>

          {/* Secretariat Contact (Dynamic from Admin Settings) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300 font-mono">
              Sekretariat &amp; Hotline
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-neutral-400 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{basecampAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-red-500" />
                <a
                  href={`tel:${cleanPhoneForTel}`}
                  className="font-mono text-xs hover:text-white transition-colors"
                >
                  {hotlinePhone} (Road Emergency)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-red-500" />
                <a
                  href={`mailto:${secretariatEmail}`}
                  className="font-mono text-xs hover:text-white transition-colors"
                >
                  {secretariatEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-neutral-400 sm:flex-row font-mono">
          <p>&copy; 2026 Brotherhood Motorcycle Community. All Rights Reserved.</p>
          <p className="text-neutral-300 font-display text-sm tracking-wider uppercase">
            &ldquo;Respect All, Fear None &bull; Satu Aspal Satu Jiwa&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
