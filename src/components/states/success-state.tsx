"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  Clock,
  MessageSquare,
  Sparkles,
  Download,
  Calendar,
  Home,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NextStepItem {
  stepNumber: number;
  title: string;
  description: string;
  timeframe?: string;
  icon?: LucideIcon;
}

export interface SuccessStateProps {
  /** 1. CONFIRM: Main confirmation title */
  title: string;
  /** Subtitle or confirmation message */
  subtitle?: string;
  /** Unique reference number or ID */
  referenceId?: string;
  /** 2. REASSURE: Specific reassurance statement on privacy, data safety, or status */
  reassuranceMessage?: string;
  /** Contact info where confirmation was dispatched (e.g. email or WhatsApp) */
  dispatchedTo?: string;
  /** 3. WHAT HAPPENS NEXT: Ordered roadmap of subsequent steps */
  nextSteps?: NextStepItem[];
  /** Primary action button */
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  /** Optional custom slotted action card or interactive elements */
  children?: React.ReactNode;
  className?: string;
}

const DEFAULT_NEXT_STEPS: NextStepItem[] = [
  {
    stepNumber: 1,
    title: "Verifikasi Berkas Calon Anggota",
    description: "Tim Divisi Keanggotaan memeriksa keabsahan SIM C & dokumen kendaraan Anda.",
    timeframe: "Maksimal 1 x 24 Jam Kerja",
  },
  {
    stepNumber: 2,
    title: "Penerbitan Nomor KTA Digital",
    description: "Nomor Registrasi Anggota (NRA) dan QR code keanggotaan resmi diterbitkan di portal.",
    timeframe: "Setelah Verifikasi",
  },
  {
    stepNumber: 3,
    title: "Undangan Grup WhatsApp & Orientasi Kopdar",
    description: "Sekretariat menyertakan Anda dalam barisan briefing touring dan penyerahan merchandise.",
    timeframe: "Agenda Kopdar Terdekat",
  },
];

export function SuccessState({
  title = "Pengajuan Berhasil Diproses!",
  subtitle = "Permintaan Anda telah tercatat secara resmi dalam sistem portal komunitas.",
  referenceId,
  reassuranceMessage = "Data pribadi dan berkas Anda telah dienkripsi dengan standar keamanan tinggi. Privasi Anda terjaga dan tidak disebarluaskan.",
  dispatchedTo,
  nextSteps = DEFAULT_NEXT_STEPS,
  primaryAction,
  secondaryAction,
  children,
  className,
}: SuccessStateProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyReference = () => {
    if (!referenceId) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const PrimaryIcon = primaryAction?.icon || ArrowRight;
  const SecondaryIcon = secondaryAction?.icon || Home;

  return (
    <div
      role="region"
      aria-label="Konfirmasi Keberhasilan"
      className={cn(
        "rounded-2xl border border-emerald-500/40 bg-asphalt/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8",
        className
      )}
    >
      {/* Top emerald glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. CONFIRM SECTION */}
      <div className="flex flex-col items-center text-center space-y-4 relative z-10">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-charcoal border border-emerald-500/40 text-emerald-400 shadow-xl">
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/15 animate-ping [animation-duration:2.5s]" />
          <CheckCircle2 className="h-9 w-9 relative z-10 stroke-[2.2]" />
        </div>

        <div className="space-y-1.5 max-w-lg">
          <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
            STATUS: RESMI TERVERIFIKASI & TERKIRIM
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-bone">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-bone-muted font-sans leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Reference Badge with Copy */}
        {referenceId && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal border border-white/10 shadow-inner">
            <span className="text-[10px] font-mono text-bone-muted uppercase tracking-wider">
              No. Registrasi:
            </span>
            <code className="text-xs font-mono font-bold text-muted-gold tracking-wide">
              {referenceId}
            </code>
            <button
              type="button"
              onClick={handleCopyReference}
              aria-label="Salin Nomor Registrasi"
              className="p-1 rounded text-bone-muted hover:text-bone hover:bg-white/10 transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. REASSURE SECTION */}
      <div className="rounded-xl bg-charcoal/80 border border-emerald-500/20 p-4 sm:p-5 space-y-2 relative z-10">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Jaminan Privasi & Keamanan Data</span>
        </div>
        <p className="text-xs text-bone-muted leading-relaxed font-sans">
          {reassuranceMessage}
        </p>
        {dispatchedTo && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-bone-muted">
            <Clock className="h-3.5 w-3.5 text-muted-gold shrink-0" />
            <span>
              Bukti registrasi otomatis diteruskan ke:{" "}
              <strong className="text-bone">{dispatchedTo}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 3. SHOW WHAT HAPPENS NEXT SECTION */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-gold font-bold tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Langkah Selanjutnya (Next Steps):</span>
          </div>
          <span className="text-[10px] font-mono text-bone-muted">
            Alur Proses Komunitas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextSteps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="rounded-xl border border-white/10 bg-charcoal/60 p-4 space-y-2 flex flex-col justify-between hover:border-muted-gold/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted-gold/20 text-muted-gold text-xs font-mono font-bold">
                      {step.stepNumber}
                    </span>
                    {step.timeframe && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {step.timeframe}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-display font-bold uppercase tracking-wide text-bone">
                    {step.title}
                  </h4>
                  <p className="text-xs text-bone-muted font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {StepIcon && (
                  <div className="pt-2 text-muted-gold">
                    <StepIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional custom slotted content (e.g. WhatsApp Approval Callout) */}
      {children && <div className="relative z-10">{children}</div>}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 relative z-10">
        {primaryAction && (
          primaryAction.href ? (
            <Link href={primaryAction.href} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-6 py-5 text-xs font-display font-bold uppercase tracking-wider bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg flex items-center justify-center gap-2">
                <span>{primaryAction.label}</span>
                <PrimaryIcon className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto px-6 py-5 text-xs font-display font-bold uppercase tracking-wider bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg flex items-center justify-center gap-2"
            >
              <span>{primaryAction.label}</span>
              <PrimaryIcon className="h-4 w-4" />
            </Button>
          )
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-5 py-5 text-xs font-display uppercase tracking-wider border-white/20 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <SecondaryIcon className="h-4 w-4" />
                <span>{secondaryAction.label}</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto px-5 py-5 text-xs font-display uppercase tracking-wider border-white/20 hover:bg-white/5 flex items-center justify-center gap-2"
            >
              <SecondaryIcon className="h-4 w-4" />
              <span>{secondaryAction.label}</span>
            </Button>
          )
        )}
      </div>
    </div>
  );
}

