"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Base Shimmer Element
 */
export function SkeletonBlock({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-white/[0.06] border border-white/[0.04] animate-pulse",
        className
      )}
      {...props}
    />
  );
}

/**
 * 1. Hero Section Skeleton
 * Matches the exact shape of the Hero Documentary Carousel with preview cards
 */
export function HeroSkeleton() {
  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[760px] bg-[#07090D] overflow-hidden flex flex-col justify-end p-6 sm:p-12 lg:p-16 border-b border-white/10">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#0B0D12] to-black/80" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

      {/* Main Content Area */}
      <div className="relative z-10 container mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
        {/* Left Column: Badge, Title, Subtitle, Buttons */}
        <div className="max-w-2xl space-y-5">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-5 w-28 rounded-full bg-red-600/20 border-red-500/30" />
            <SkeletonBlock className="h-5 w-32 rounded-full" />
          </div>

          <div className="space-y-3">
            <SkeletonBlock className="h-12 sm:h-16 w-5/6 rounded-lg" />
            <SkeletonBlock className="h-10 sm:h-14 w-3/5 rounded-lg" />
          </div>

          <div className="space-y-2 pt-1 max-w-lg">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <SkeletonBlock className="h-12 w-44 rounded-md bg-red-600/30" />
            <SkeletonBlock className="h-12 w-36 rounded-md" />
          </div>
        </div>

        {/* Right Column: Mini Sliding Preview Cards (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-36 h-52 rounded-xl bg-[#12141C] p-3 flex flex-col justify-between overflow-hidden shadow-xl"
            >
              <SkeletonBlock className="w-full h-24 rounded-lg" />
              <div className="space-y-1.5">
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Grounded Dispatch Bar Skeleton
 */
export function DispatchBarSkeleton() {
  return (
    <div className="bg-[#10121A] border-y border-white/10 py-3.5">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <SkeletonBlock className="h-4 w-28" />
            <span className="text-neutral-600">&bull;</span>
            <SkeletonBlock className="h-4 w-36" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <SkeletonBlock className="h-4 w-40" />
            <span className="text-neutral-600">&bull;</span>
            <SkeletonBlock className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Spotlight Events Section Skeleton (3 Cards Grid)
 */
export function SpotlightEventsSkeleton() {
  return (
    <section className="py-20 sm:py-28 bg-[#0B0D12] border-b border-white/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-xl">
            <SkeletonBlock className="h-3.5 w-32" />
            <SkeletonBlock className="h-10 w-80 rounded-lg" />
            <SkeletonBlock className="h-4 w-full" />
          </div>
          <SkeletonBlock className="h-9 w-36 rounded-md shrink-0" />
        </div>

        {/* 3 Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-[#12141C] overflow-hidden flex flex-col justify-between shadow-2xl"
            >
              <div>
                {/* Image frame */}
                <div className="relative aspect-[16/9] w-full bg-white/[0.04] p-3 flex justify-between items-start">
                  <SkeletonBlock className="h-5 w-20 rounded bg-red-600/30" />
                  <SkeletonBlock className="h-5 w-24 rounded" />
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <SkeletonBlock className="h-6 w-full" />
                    <SkeletonBlock className="h-6 w-2/3" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <SkeletonBlock className="h-3.5 w-full" />
                    <SkeletonBlock className="h-3.5 w-5/6" />
                  </div>

                  {/* Metadata Lines */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <SkeletonBlock className="h-3.5 w-3.5 rounded-full" />
                      <SkeletonBlock className="h-3.5 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <SkeletonBlock className="h-3.5 w-3.5 rounded-full" />
                      <SkeletonBlock className="h-3.5 w-48" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0">
                <SkeletonBlock className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 4. Media Carousel Skeleton (Gallery & News Side-by-Side)
 */
export function MediaCarouselSkeleton() {
  return (
    <section className="py-20 sm:py-28 bg-[#0B0D12] border-b border-white/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-xl">
            <SkeletonBlock className="h-3.5 w-40" />
            <SkeletonBlock className="h-10 w-96 rounded-lg" />
            <SkeletonBlock className="h-4 w-full" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <SkeletonBlock className="h-8 w-28 rounded-md" />
            <SkeletonBlock className="h-8 w-32 rounded-md" />
          </div>
        </div>

        {/* 2 Symmetrical Cards (50:50) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#12141C] overflow-hidden shadow-2xl"
            >
              {/* Top Bar */}
              <div className="px-5 py-3.5 bg-[#161822] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="h-7 w-7 rounded-lg" />
                  <SkeletonBlock className="h-4 w-36" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="h-5 w-12 rounded" />
                  <div className="flex gap-1">
                    <SkeletonBlock className="h-7 w-7 rounded-md" />
                    <SkeletonBlock className="h-7 w-7 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Image Frame */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-white/[0.04] p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <SkeletonBlock className="h-5 w-24 rounded bg-red-600/30" />
                  <SkeletonBlock className="h-5 w-16 rounded" />
                </div>
                <div className="space-y-2">
                  <SkeletonBlock className="h-3.5 w-28" />
                  <SkeletonBlock className="h-7 w-3/4" />
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3.5 w-full" />
                  <SkeletonBlock className="h-3.5 w-11/12" />
                  <SkeletonBlock className="h-3.5 w-3/4" />
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <SkeletonBlock className="h-3.5 w-28" />
                  <SkeletonBlock className="h-3.5 w-36" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 5. Sponsors Section Skeleton
 */
export function SponsorsSkeleton() {
  return (
    <section className="py-16 sm:py-24 bg-[#08090D] border-b border-white/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <SkeletonBlock className="h-3.5 w-32 mx-auto" />
          <SkeletonBlock className="h-8 w-64 mx-auto rounded-lg" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-white/5 bg-[#12141C]/60 flex items-center justify-center p-4 shadow"
            >
              <SkeletonBlock className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 6. Gallery Grid Skeleton (Used on /gallery)
 */
export function GalleryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-[#12141C] overflow-hidden flex flex-col justify-between shadow-2xl"
        >
          <div className="aspect-[16/10] w-full bg-white/[0.04] p-4 flex justify-between items-start">
            <SkeletonBlock className="h-5 w-20 rounded bg-red-600/20" />
            <SkeletonBlock className="h-5 w-16 rounded" />
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-3.5 w-20" />
            </div>
            <SkeletonBlock className="h-6 w-5/6" />
            <SkeletonBlock className="h-3.5 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

