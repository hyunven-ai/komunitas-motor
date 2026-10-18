"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Shield,
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
    }, 7000);

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
      className="relative overflow-hidden bg-[#0A0C0F] min-h-[580px] lg:h-[calc(88vh)] lg:min-h-[640px] lg:max-h-[820px] flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Background Documentary Photos */}
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
            alt={`${s.headlinePart1} ${s.headlineGold}`}
            className={`w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
              idx === currentSlide ? "scale-105" : "scale-100"
            }`}
          />

          {/* Documentary Scrim: Deep dark gradient on text side for crisp legibility, transparent on image focal point */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C0F]/95 via-[#0A0C0F]/80 via-45% to-[#0A0C0F]/25" />
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#0A0C0F]/90 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0A0C0F] to-transparent pointer-events-none" />
        </div>
      ))}

      {/* Main Editorial Hero Content */}
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 z-20 w-full flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-5">
          {/* Documentary Dispatch Stamp */}
          <div className="inline-flex items-center gap-2.5 text-xs font-mono tracking-widest text-neutral-400 uppercase">
            <span className="h-1.5 w-6 bg-red-600 rounded-full" />
            <span className="text-white font-medium">Brotherhood MC</span>
            <span className="text-neutral-600">&bull;</span>
            <span>{slide.location || "Jalur Touring Nusantara"}</span>
          </div>

          {/* Bold Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tight text-[#F5F5F2] leading-[1.02]">
            {slide.headlinePart1}{" "}
            <span className="text-red-500">{slide.headlineGold}</span>
          </h1>

          {/* Tagline Sub-bullet from Slider Settings */}
          {slide.taglineSub && (
            <p className="text-xs sm:text-sm font-mono text-neutral-300 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{slide.taglineSub}</span>
            </p>
          )}

          {/* Concise Supporting Copy */}
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl font-sans font-normal">
            {slide.subtitle}
          </p>

          {/* Single Primary Action + Editorial Secondary Link */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href={slide.ctaLink || "/join"}>
              <Button
                size="lg"
                className="rounded-md px-7 py-3 text-xs font-display font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors gap-2"
              >
                <span>{slide.ctaText || "Daftar Calon Anggota"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {slide.ctaLink !== "/events" ? (
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-4 py-3 text-xs font-display font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
              >
                <span>Lihat Agenda Touring</span>
                <ArrowRight className="h-3.5 w-3.5 text-red-500" />
              </Link>
            ) : (
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-4 py-3 text-xs font-display font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
              >
                <span>Pelajari Profil &amp; SOP</span>
                <ArrowRight className="h-3.5 w-3.5 text-red-500" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grounded Editorial Footer Bar */}
      <div className="w-full bg-[#0E1017]/95 border-t border-white/10 backdrop-blur-sm z-20 py-3.5 sm:py-4">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Real Community Context */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-red-500" />
              <span className="text-neutral-200">Zero-Incident Discipline</span>
            </div>
            {slide.location && (
              <div className="hidden md:flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                <span className="text-neutral-200">{slide.location}</span>
              </div>
            )}
            {slide.date && (
              <div className="hidden lg:flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                <span>{slide.date}</span>
              </div>
            )}
          </div>

          {/* Minimal Editorial Slide Switcher */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <span className="font-mono text-xs text-neutral-400">
              <strong className="text-white">0{currentSlide + 1}</strong> / 0{activeSlides.length}
            </span>

            <div className="flex items-center gap-1">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    idx === currentSlide ? "w-6 bg-red-600" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-white/10">
              <button
                onClick={prevSlide}
                className="h-7 w-7 rounded border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Slide sebelumnya"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={nextSlide}
                className="h-7 w-7 rounded border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Slide berikutnya"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
