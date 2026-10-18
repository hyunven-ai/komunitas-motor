"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Sponsor } from "@/features/sponsors/types";
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
    <section className="py-12 sm:py-16 bg-[#0E1017] border-b border-white/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Mitra Resmi Komunitas
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-[#F5F5F2] mt-1">
              Dukungan Perlengkapan &amp; Otomotif
            </h3>
          </div>
          <Link
            href="/partners"
            className="inline-flex items-center gap-1.5 text-xs font-display font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors group"
          >
            <span>Seluruh Mitra &amp; Keuntungan KTA</span>
            <ArrowRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Integrated Monochrome Logo Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {sponsors.map((s) => (
            <div
              key={s.id}
              className="group rounded-lg border border-white/5 bg-[#12141C] p-4 flex flex-col justify-between items-center text-center transition-all duration-200 hover:border-white/20 hover:bg-[#161924]"
            >
              <div className="h-16 w-full flex items-center justify-center p-2 mb-2">
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    className="max-h-12 max-w-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-display font-bold text-xs text-neutral-400 uppercase tracking-wider">
                    {s.name}
                  </span>
                )}
              </div>

              <div className="w-full pt-2 border-t border-white/5">
                <p className="font-display text-xs font-semibold text-neutral-300 truncate">
                  {s.name}
                </p>
                <p className="text-[10px] font-mono text-neutral-500 truncate mt-0.5">
                  {s.memberPerk?.discountText || "Mitra Resmi"}
                </p>
              </div>

              {s.websiteUrl && (
                <a
                  href={s.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleSponsorClick(s.id)}
                  className="mt-2 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
                >
                  <span>Situs Mitra</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
