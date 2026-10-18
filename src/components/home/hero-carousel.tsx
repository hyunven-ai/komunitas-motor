"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "@/features/sliders/types";

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-play timer
  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6500);

    return () => clearInterval(interval);
  }, [isPaused, activeSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const slide = activeSlides[currentSlide] || activeSlides[0];

  return (
    <section
      className="relative overflow-hidden bg-[#0a0c0f] min-h-[640px] lg:h-[calc(100vh)] lg:min-h-[700px] lg:max-h-[860px] flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 1. CRYSTAL CLEAR BACKGROUND IMAGE (BOS Style: High contrast, vivid photo, no dark veil on the right) */}
      {activeSlides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.bgUrl}
            alt={s.headlineGold}
            className={`w-full h-full object-cover object-center transition-transform duration-[9000ms] ease-out ${
              idx === currentSlide ? "scale-105" : "scale-100"
            }`}
          />

          {/* BOS-STYLE DIRECTIONAL SCRIM: Dark on the left (text area) so words are ultra-crisp, but totally clear & vibrant on the right so the bikes and scenery shine brilliantly */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c0f]/95 via-[#0a0c0f]/80 via-40% to-transparent" />
          
          {/* Soft top gradient to integrate with navbar */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#0a0c0f]/80 to-transparent pointer-events-none" />

          {/* Bottom gradient fade into feature strip */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0c0f] to-transparent pointer-events-none" />
        </div>
      ))}

      {/* Subtle cosmic neon indigo ambient glow behind the title */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-indigo-600/25 via-sky-500/15 to-transparent blur-[140px] rounded-full pointer-events-none z-10" />

      {/* 2. MAIN CONTENT HERO (Structured cleanly like BOS Smart) */}
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-24 pb-6 z-20 w-full flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-4 sm:space-y-5">
          {/* Top Brand & Subtitle Lockup (BOS Style Logo Badge) */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/40 bg-[#161a29]/80 shadow-lg shadow-black/40 backdrop-blur-md">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base sm:text-lg font-bold tracking-wider text-white uppercase leading-none">
                  BROTHERHOOD MOTORCYCLE COMMUNITY
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                  MC
                </span>
              </div>
              <p className="text-[11px] tracking-widest text-indigo-400 font-mono uppercase mt-1">
                RESPECT ALL &bull; FEAR NONE &bull; EST. 2018
              </p>
            </div>
          </div>

          {/* Main H1 Title (Extra Bold, Sharp White & Vibrant Neon Indigo Gradient) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tight text-white leading-[1.02] drop-shadow-lg">
            {slide.headlinePart1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300 drop-shadow-[0_2px_15px_rgba(99,102,241,0.5)]">
              {slide.headlineGold}
            </span>
          </h1>

          {/* Sub-headline Bullets */}
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/95 font-sans flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
            <span>{slide.taglineSub}</span>
          </p>

          {/* Description Paragraph (High contrast, easy to read, clean typography) */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl font-sans drop-shadow-sm">
            {slide.subtitle}
          </p>

          {/* 4 Feature Icon Badges */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full border border-indigo-500/40 bg-[#131724]/80 backdrop-blur-sm flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/20">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-semibold text-white/95">Safety Riding</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full border border-indigo-500/40 bg-[#131724]/80 backdrop-blur-sm flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/20">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-semibold text-white/95">Eksplorasi Rute</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full border border-indigo-500/40 bg-[#131724]/80 backdrop-blur-sm flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/20">
                <Award className="h-4 w-4" />
              </div>
              <span className="font-semibold text-white/95">Non-Komersial</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full border border-indigo-500/40 bg-[#131724]/80 backdrop-blur-sm flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/20">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <span className="font-semibold text-white/95">Solidaritas Sosial</span>
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <Link href={slide.ctaLink || "/join"}>
              <Button
                size="lg"
                className="rounded-lg px-7 py-3.5 text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/35 transition-all gap-2"
              >
                <span>{slide.ctaText || "Daftar Calon Member"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/events">
              <Button
                variant="outline"
                size="lg"
                className="rounded-lg px-7 py-3.5 text-xs font-bold uppercase tracking-wider border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/15 hover:border-indigo-400/60 transition-all gap-2"
              >
                <span>Lihat Agenda Touring</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR: FULL-WIDTH 4-COLUMN FEATURE STRIP */}
      <div className="w-full bg-[#0d101a]/95 border-t border-white/[0.08] backdrop-blur-md z-20 py-4 sm:py-5">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* 4 Feature Columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/10">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-base sm:text-lg font-bold text-white leading-tight">280+ Rider</p>
                <p className="text-[11px] text-slate-400 font-sans">Anggota Resmi Aktif</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/10">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-base sm:text-lg font-bold text-white leading-tight">142K+ KM</p>
                <p className="text-[11px] text-slate-400 font-sans">Jelajah Aspal Nusantara</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/10">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-base sm:text-lg font-bold text-white leading-tight">100% Safety</p>
                <p className="text-[11px] text-slate-400 font-sans">Zero-Laka SOP Konvoi</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm shadow-indigo-500/10">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-base sm:text-lg font-bold text-white leading-tight">8 Tahun</p>
                <p className="text-[11px] text-slate-400 font-sans">Dedikasi Sewindu</p>
              </div>
            </div>
          </div>

          {/* Carousel Indicators & Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
            <span className="font-mono text-xs text-indigo-400 font-bold">
              0{currentSlide + 1} <span className="text-slate-500 font-normal">/ 0{activeSlides.length}</span>
            </span>

            <div className="flex items-center gap-1.5">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "w-8 bg-indigo-500 shadow-sm shadow-indigo-500/50" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Buka slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-indigo-400 flex items-center justify-center transition-colors"
                aria-label="Slide sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-indigo-400 flex items-center justify-center transition-colors"
                aria-label="Slide berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
