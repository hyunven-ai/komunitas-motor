"use client";

import * as React from "react";
import Link from "next/link";
import { Handshake, ArrowRight, ExternalLink, Sparkles, Shield, Gift } from "lucide-react";
import { Sponsor } from "@/features/sponsors/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { recordSponsorClickAction } from "@/features/sponsors/actions";

interface MainSponsorsProps {
  sponsors: Sponsor[];
}

export function MainSponsors({ sponsors }: MainSponsorsProps) {
  if (!sponsors || sponsors.length === 0) return null;

  const handleSponsorClick = (id: string) => {
    recordSponsorClickAction(id);
  };

  return (
    <section className="relative py-12 sm:py-16 bg-[#0a0d14] border-b border-white/[0.08] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 border-b border-white/[0.06] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Strategic Alliance & Official Partners</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white mt-1">
                Kemitraan Resmi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-indigo-400">Brotherhood MC</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-sans">
                Didukung oleh merek otomotif dan perlengkapan penjelajahan kelas dunia yang menjunjung tinggi keselamatan serta performa berkendara.
              </p>
            </div>

            <Link
              href="/partners"
              className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors group"
            >
              <span>Lihat Seluruh Partner & Benefit</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Sponsor Logos Grid (Max 6 Main Sponsors) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-stretch">
          {sponsors.map((s, idx) => (
            <ScrollReveal
              key={s.id}
              animation="fade-up"
              delay={idx * 80}
              className="flex"
            >
              <div className="group relative w-full rounded-2xl border border-white/[0.08] bg-[#111422]/90 p-4 sm:p-5 flex flex-col justify-between items-center text-center hover:border-indigo-500/50 hover:bg-[#15192b] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all duration-300">
                {/* Subtle top indicator */}
                <div className="w-6 h-1 rounded-full bg-white/10 group-hover:bg-indigo-400 transition-colors mb-3" />

                {/* Logo with grayscale-to-color transition */}
                <div className="h-20 sm:h-24 w-full flex items-center justify-center p-2.5 mb-3 bg-[#0a0d14]/70 rounded-xl border border-white/5">
                  {s.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={s.logoUrl}
                      alt={s.name}
                      className="max-h-16 max-w-full object-contain filter grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-display font-bold text-xs text-slate-300 group-hover:text-white uppercase tracking-wider">
                      {s.name}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-indigo-300 transition-colors">
                    {s.name}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 truncate mt-0.5">
                    {s.memberPerk?.discountText || "Official Sponsor"}
                  </p>
                </div>

                {/* Hover Action Link */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] w-full flex items-center justify-center">
                  {s.websiteUrl ? (
                    <a
                      href={s.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleSponsorClick(s.id)}
                      className="text-[10px] font-mono text-indigo-400/80 group-hover:text-indigo-300 flex items-center gap-1 hover:underline"
                    >
                      <span>Kunjungi</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ) : (
                    <Link
                      href="/partners"
                      className="text-[10px] font-mono text-indigo-400/80 group-hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Detail</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
