"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Server,
  WifiOff,
  UserX,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  classifyError,
  type ClassifiedError,
  type FaultAttribution,
} from "@/lib/states/error-classifier";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  /** Error object, string message, or pre-classified error */
  error?: unknown;
  /** Contextual fallback title */
  contextTitle?: string;
  /** Custom override for what went wrong */
  whatWentWrong?: string;
  /** Custom override for fault attribution */
  whoseFault?: string;
  /** Custom override for steps to fix */
  howToFixSteps?: string[];
  /** Primary retry or fix callback */
  onRetry?: () => void;
  /** Primary action button label */
  retryLabel?: string;
  /** Back navigation callback */
  onBack?: () => void;
  /** Secondary navigation link */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

const FAULT_BADGE_STYLE: Record<
  FaultAttribution,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  server: {
    label: "Kesalahan Sistem Internal",
    icon: Server,
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  network: {
    label: "Kendala Sinyal / Jaringan Anda",
    icon: WifiOff,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  user: {
    label: "Ketidaksesuaian Isian Pengguna",
    icon: UserX,
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  auth: {
    label: "Otoritas / Kunci Sesi",
    icon: ShieldAlert,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  unknown: {
    label: "Kendala Sistem Tidak Terduga",
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export function ErrorState({
  error,
  contextTitle,
  whatWentWrong,
  whoseFault,
  howToFixSteps,
  onRetry,
  retryLabel,
  onBack,
  secondaryAction,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  // Classify error using state engine
  const classified: ClassifiedError = React.useMemo(() => {
    return classifyError(error, contextTitle);
  }, [error, contextTitle]);

  const resolvedTitle = whatWentWrong || classified.whatWentWrong;
  const resolvedFault = whoseFault || classified.faultParty;
  const resolvedSteps = howToFixSteps || classified.howToFix.steps;
  const resolvedActionLabel = retryLabel || classified.howToFix.actionLabel || "Coba Lagi";

  const faultMeta = FAULT_BADGE_STYLE[classified.fault] || FAULT_BADGE_STYLE.unknown;
  const FaultIcon = faultMeta.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "relative rounded-2xl border border-red-900/40 bg-asphalt/90 backdrop-blur-md p-6 sm:p-10 overflow-hidden shadow-2xl",
        className
      )}
    >
      {/* Top red emergency warning bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {/* Header Icon + 3-Tier Classification Label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-950/60 border border-red-700/40 text-red-400 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-red-400 font-bold block">
                DIAGNOSIS KEGAGALAN SISTEM
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-bone">
                {resolvedTitle}
              </h2>
            </div>
          </div>

          {/* Whose fault badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono self-start sm:self-auto",
              faultMeta.color
            )}
          >
            <FaultIcon className="h-3.5 w-3.5" />
            <span>{faultMeta.label}</span>
          </div>
        </div>

        {/* Breakdown Grid: What Went Wrong & Whose Fault */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: What went wrong & explanation */}
          <div className="rounded-xl border border-white/10 bg-charcoal/70 p-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-muted-gold font-semibold tracking-wider">
              1. Apa yang Terjadi?
            </span>
            <p className="text-xs text-bone-muted leading-relaxed font-sans">
              {classified.explanation}
            </p>
          </div>

          {/* Card 2: Whose fault */}
          <div className="rounded-xl border border-white/10 bg-charcoal/70 p-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-muted-gold font-semibold tracking-wider">
              2. Tanggung Jawab / Pihak Terkait:
            </span>
            <p className="text-xs text-bone leading-relaxed font-medium">
              {resolvedFault}
            </p>
            <p className="text-[11px] text-bone-muted/80">
              {classified.fault === "server"
                ? "Sistem sedang mengisolasi kesalahan agar data komunitas tidak rusak."
                : classified.fault === "network"
                ? "Paket data gagal sampai ke server karena interupsi jalur sinyal."
                : "Harap periksa kecocokan data sebelum mengirim ulang."}
            </p>
          </div>
        </div>

        {/* Section 3: How to fix it */}
        <div className="rounded-xl border border-muted-gold/30 bg-charcoal/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-gold font-bold tracking-wider flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted-gold/20 text-muted-gold text-[10px]">
                3
              </span>
              Cara Memperbaiki Masalah Ini:
            </span>
            <span className="text-[10px] font-mono text-bone-muted">
              Solusi Terpandu
            </span>
          </div>

          <p className="text-sm font-medium text-bone">
            {classified.howToFix.primaryStep}
          </p>

          <ul className="space-y-1.5 text-xs text-bone-muted font-sans list-disc list-inside">
            {resolvedSteps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="px-5 py-5 text-xs font-display font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{resolvedActionLabel}</span>
            </Button>
          )}

          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="px-4 py-5 text-xs font-display uppercase tracking-wider border-white/20 hover:bg-white/5 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
          )}

          {secondaryAction && secondaryAction.href && (
            <Link href={secondaryAction.href}>
              <Button
                variant="outline"
                className="px-4 py-5 text-xs font-display uppercase tracking-wider border-white/20 hover:bg-white/5"
              >
                {secondaryAction.label}
              </Button>
            </Link>
          )}

          {/* Technical Diagnostics Collapsible Toggle */}
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-bone-muted/60 hover:text-bone-muted transition-colors"
            >
              <span>{showDetails ? "Sembunyikan Log Teknis" : "Lihat Kode Teknis"}</span>
              {showDetails ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Technical Details */}
        {showDetails && (
          <div className="rounded-lg bg-black/60 border border-white/5 p-3 text-[11px] font-mono text-bone-muted space-y-1 break-all">
            <div className="text-red-400 font-semibold">
              Kode Status: {classified.statusCode || "N/A"}
            </div>
            <div>
              Pesan Asli:{" "}
              {typeof classified.originalError === "object"
                ? JSON.stringify(classified.originalError)
                : String(classified.originalError || "Tidak ada detail ekstra")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

