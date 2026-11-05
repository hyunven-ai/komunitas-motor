"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  Lock,
  HelpCircle,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PermissionDeniedProps {
  /** The resource or feature user was trying to access */
  resourceName?: string;
  /** Explicit explanation: WHY you need it */
  whyNeeded?: string;
  /** Required role / permission name */
  requiredRole?: string;
  /** Custom fallback back-route (defaults to window history or home) */
  returnUrl?: string;
  /** Custom label for return button */
  returnLabel?: string;
  /** Optional contact button */
  contactAdminUrl?: string;
  className?: string;
}

export function PermissionDeniedState({
  resourceName = "Halaman / Modul Terproteksi",
  whyNeeded = "Akses modul ini dibatasi demi menjaga integritas data keanggotaan dan keamanan operasional internal komunitas sesuai AD/ART.",
  requiredRole = "Pengurus Resmi (Admin / Divisi Terkait)",
  returnUrl,
  returnLabel = "Kembali ke Halaman Sebelumnya",
  contactAdminUrl = "https://wa.me/6281299887711?text=Halo%20Admin,%20saya%20memerlukan%20akses%20ke%20halaman%20portal",
  className,
}: PermissionDeniedProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (returnUrl) {
      router.push(returnUrl);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div
      role="alert"
      aria-label="Akses Ditolak"
      className={cn(
        "rounded-2xl border border-red-900/50 bg-asphalt/95 backdrop-blur-md p-6 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden",
        className
      )}
    >
      {/* Background Security Shield Motif */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Lock Shield Icon */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-charcoal border border-red-500/40 text-red-500 shadow-xl">
          <div className="absolute inset-0 rounded-2xl bg-red-500/10 animate-ping [animation-duration:3s]" />
          <Lock className="h-8 w-8 relative z-10 stroke-[2]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase font-bold tracking-wider">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>KODE 403: HAK AKSES DIBATASI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-bone">
            Akses Ditolak untuk Modul Ini
          </h2>
          <p className="text-sm font-mono text-muted-gold font-medium">
            Target: &ldquo;{resourceName}&rdquo;
          </p>
        </div>

        {/* EXPLAIN WHY YOU NEED IT */}
        <div className="w-full text-left rounded-xl bg-charcoal/80 border border-white/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-gold font-bold tracking-wider">
            <HelpCircle className="h-4 w-4" />
            <span>Mengapa Otoritas Ini Diperlukan?</span>
          </div>

          <p className="text-xs sm:text-sm text-bone leading-relaxed font-sans">
            {whyNeeded}
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs font-mono text-bone-muted">
            <KeyRound className="h-3.5 w-3.5 text-muted-gold shrink-0" />
            <span>
              Wewenang yang Dibutuhkan:{" "}
              <strong className="text-bone font-semibold">{requiredRole}</strong>
            </span>
          </div>
        </div>

        {/* GIVE A WAY BACK */}
        <div className="w-full pt-4 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted block">
            Jalur Navigasi Kembali Aman:
          </span>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary Way Back */}
            <Button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto px-6 py-5 text-xs font-display font-bold uppercase tracking-wider bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{returnLabel}</span>
            </Button>

            {/* Home alternative */}
            <Link href="/" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto px-5 py-5 text-xs font-display uppercase tracking-wider border-white/20 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span>Beranda Portal</span>
              </Button>
            </Link>

            {/* Contact Helpdesk */}
            {contactAdminUrl && (
              <a
                href={contactAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto px-4 py-5 text-xs font-mono text-bone-muted hover:text-bone border-white/10 flex items-center justify-center gap-1.5"
                >
                  <span>Minta Akses</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

