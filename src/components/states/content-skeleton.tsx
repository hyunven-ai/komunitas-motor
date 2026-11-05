"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/**
 * Base Shimmer Skeleton
 * Renders the tactile bone/asphalt skeleton block with glowing pulse
 */
export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-white/[0.06] border border-white/[0.04]",
        shimmer && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton matching the shape of Touring / Event Card
 */
export function SkeletonEventCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-asphalt/80 overflow-hidden flex flex-col justify-between shadow-xl",
        className
      )}
    >
      <div>
        {/* Aspect ratio featured image shape */}
        <div className="relative aspect-[16/9] w-full bg-white/[0.04] animate-pulse">
          <div className="absolute top-3 left-3 w-24 h-5 rounded-md bg-white/[0.08]" />
          <div className="absolute bottom-3 right-3 w-20 h-5 rounded-md bg-white/[0.08]" />
        </div>

        {/* Content body shape */}
        <div className="p-6 space-y-4">
          {/* Title shape (2 lines) */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-3/5" />
          </div>

          {/* Excerpt shape (3 lines) */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>

          {/* Meta rows (Date, Location, Quota) */}
          <div className="border-t border-white/5 pt-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3.5 w-44" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Button shape */}
      <div className="p-6 pt-0">
        <Skeleton className="h-11 w-full rounded-md bg-white/[0.08]" />
      </div>
    </div>
  );
}

/**
 * Skeleton matching the shape of News Article Card
 */
export function SkeletonNewsCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-asphalt/60 overflow-hidden flex flex-col justify-between shadow-lg",
        className
      )}
    >
      <div>
        <div className="h-48 w-full bg-white/[0.04] relative animate-pulse">
          <div className="absolute top-3 left-3 w-28 h-5 rounded bg-white/[0.08]" />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/6" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
          </div>
        </div>
      </div>
      <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

/**
 * Skeleton matching Admin Data Tables
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-asphalt/50 overflow-hidden",
        className
      )}
    >
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-charcoal border-b border-white/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid grid-cols-4 gap-4 p-4 items-center">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-20 ml-auto rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton matching Member Profile / KTA Card
 */
export function SkeletonMemberCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-muted-gold/30 bg-asphalt p-6 sm:p-8 space-y-6 shadow-2xl",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>
  );
}

