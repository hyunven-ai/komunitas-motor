"use client";

import * as React from "react";
import {
  Globe,
  Smartphone,
  Monitor,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SerpPreviewProps {
  title: string;
  description: string;
  url?: string;
  faviconUrl?: string;
  className?: string;
  showAiBadge?: boolean;
}

export function SerpPreview({
  title,
  description,
  url = "https://borneobikers.com",
  faviconUrl = "/favicon.ico",
  className,
  showAiBadge = true,
}: SerpPreviewProps) {
  const [device, setDevice] = React.useState<"mobile" | "desktop">("desktop");

  const cleanUrl = url.replace(/^https?:\/\//, "");
  const domain = cleanUrl.split("/")[0];
  const path = cleanUrl.split("/").slice(1).join(" › ");

  // SEO Title & Description Length Checks
  const titleLen = title.length;
  const descLen = description.length;

  const isTitleIdeal = titleLen >= 30 && titleLen <= 60;
  const isDescIdeal = descLen >= 80 && descLen <= 160;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-asphalt/90 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-2xl text-left",
        className
      )}
    >
      {/* Device & Mode Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-gold" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-bone">
            Live Google SERP Simulator
          </span>
          {showAiBadge && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
              <Sparkles className="h-3 w-3" /> AI Overview Ready
            </span>
          )}
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-charcoal border border-white/10">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors",
              device === "desktop"
                ? "bg-muted-gold text-charcoal font-bold shadow-sm"
                : "text-bone-muted hover:text-bone"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors",
              device === "mobile"
                ? "bg-muted-gold text-charcoal font-bold shadow-sm"
                : "text-bone-muted hover:text-bone"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Google Search Card Simulation Container */}
      <div
        className={cn(
          "rounded-xl bg-[#202124] p-4 sm:p-5 border border-white/5 space-y-1.5 transition-all shadow-inner font-sans",
          device === "mobile" ? "max-w-sm mx-auto" : "w-full"
        )}
      >
        {/* Favicon & Breadcrumb row */}
        <div className="flex items-center gap-2.5 text-xs text-[#bdc1c6]">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#303134] overflow-hidden shrink-0 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faviconUrl}
              alt="Site Favicon"
              className="w-4 h-4 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/icon.png";
              }}
            />
          </div>
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="font-medium text-[#dadce0] text-[13px] truncate">
              Borneo Brotherhood
            </span>
            <span className="text-[11px] text-[#bdc1c6] font-mono truncate">
              https://{domain}{path ? ` › ${path}` : ""}
            </span>
          </div>
        </div>

        {/* Clickable Blue SERP Title */}
        <h4 className="text-[18px] sm:text-[20px] font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-2 pt-0.5">
          {title || "Borneo Brotherhood — Motorcycle Touring & Brotherhood Portal"}
        </h4>

        {/* Snippet Description */}
        <p className="text-[13px] sm:text-[14px] text-[#bdc1c6] leading-relaxed line-clamp-3">
          {description ||
            "Portal resmi manajemen komunitas motor touring Borneo Brotherhood. Info touring, pendaftaran anggota, KTA digital dengan verifikasi QR, dan forum anggota."}
        </p>
      </div>

      {/* Character Counter & Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
        {/* Title Health */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-charcoal border border-white/5">
          <div className="flex items-center gap-1.5">
            {isTitleIdeal ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )}
            <span className="text-bone-muted">Panjang Judul:</span>
          </div>
          <span
            className={cn(
              "font-bold",
              isTitleIdeal ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {titleLen} / 60 karakter
          </span>
        </div>

        {/* Description Health */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-charcoal border border-white/5">
          <div className="flex items-center gap-1.5">
            {isDescIdeal ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )}
            <span className="text-bone-muted">Panjang Deskripsi:</span>
          </div>
          <span
            className={cn(
              "font-bold",
              isDescIdeal ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {descLen} / 155 karakter
          </span>
        </div>
      </div>
    </div>
  );
}

