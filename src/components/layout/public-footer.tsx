"use client";

import Link from "next/link";
import { Shield, MapPin, Phone, Mail, Award } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-tarmac text-bone [content-visibility:auto] [contain-intrinsic-size:1px_450px]">
      {/* Top Highway Center Line Stripe */}
      <div className="highway-stripe opacity-60" />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Identity */}
          <div className="space-y-4 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/30 bg-[#161a29] shadow-inner">
                <Shield className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-widest text-white uppercase">
                  BROTHERHOOD MC
                </span>
                <p className="text-[10px] tracking-widest text-indigo-400 font-mono uppercase font-semibold">
                  Est. 2018 — Touring & Honor
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-bone-muted leading-relaxed font-sans">
              Komunitas pecinta touring motor roda dua berasaskan kekeluargaan, saling menghormati di jalan raya, dan menjunjung tinggi keselamatan berkendara (Safety Riding).
            </p>
            <div className="flex items-center gap-3 pt-2 text-muted-gold">
              <span className="flex items-center gap-1.5 text-xs font-mono tracking-wide">
                <Award className="h-4 w-4" /> 100% Non-Politik & Non-Komersial
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-gold font-mono">
              Eksplorasi
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-bone-muted font-sans">
              <li>
                <Link href="/about" className="transition-colors hover:text-muted-gold">
                  Tentang Komunitas
                </Link>
              </li>
              <li>
                <Link href="/committee" className="transition-colors hover:text-muted-gold">
                  Struktur Pengurus
                </Link>
              </li>
              <li>
                <Link href="/events" className="transition-colors hover:text-muted-gold">
                  Jadwal & Agenda Touring
                </Link>
              </li>
              <li>
                <Link href="/news" className="transition-colors hover:text-muted-gold">
                  Berita & Pengumuman
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="transition-colors hover:text-muted-gold">
                  Galeri Dokumentasi
                </Link>
              </li>
              <li>
                <Link href="/partners" className="transition-colors hover:text-muted-gold">
                  Partner & Sponsorship
                </Link>
              </li>
            </ul>
          </div>

          {/* Member & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-gold font-mono">
              Keanggotaan
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-bone-muted font-sans">
              <li>
                <Link href="/join" className="transition-colors hover:text-muted-gold">
                  Pendaftaran Anggota Baru
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-muted-gold">
                  Portal Login Anggota
                </Link>
              </li>
              <li>
                <Link href="/verify" className="transition-colors hover:text-muted-gold">
                  Verifikasi KTA Publik
                </Link>
              </li>
              <li>
                <Link href="/about#safety-pledge" className="transition-colors hover:text-muted-gold">
                  Ikrar Safety Riding
                </Link>
              </li>
            </ul>
          </div>

          {/* Secretariat Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-gold font-mono">
              Sekretariat & Hotline
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-bone-muted font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-muted-gold mt-0.5" />
                <span>Basecamp Brotherhood, Jl. Jalur Puncak No. 45, Bogor - Jawa Barat</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-muted-gold" />
                <span className="font-mono text-xs">+62 812-9988-7711 (Road Emergency)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-muted-gold" />
                <span className="font-mono text-xs">sekretariat@brotherhood.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-bone-muted sm:flex-row font-mono">
          <p>© 2026 Brotherhood Motorcycle Community. All Rights Reserved.</p>
          <p className="text-muted-gold font-display text-sm tracking-wider uppercase">
            &ldquo;Respect All, Fear None — Satu Aspal Satu Jiwa&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
