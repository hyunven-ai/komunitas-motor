"use client";

import * as React from "react";
import {
  Gauge,
  Zap,
  ArrowRight,
  Sparkles,
  ImageOff,
  Check,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlowNetworkProps {
  /** Simulated or actual progress percentage (0 - 100) */
  progress?: number;
  /** Estimated duration remaining in seconds */
  estimatedSeconds?: number;
  /** Callback triggered when user chooses the lighter path */
  onEnableLighterMode?: () => void;
  /** Callback to cancel or abort heavy request */
  onAbort?: () => void;
  className?: string;
}

const LIGHTER_MODE_KEY = "brotherhood_lighter_mode";

/**
 * Hook to manage lighter mode setting across the app
 */
export function useLighterMode() {
  const [isLighterMode, setIsLighterMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(LIGHTER_MODE_KEY);
    if (saved === "true") {
      setIsLighterMode(true);
    }
  }, []);

  const toggleLighterMode = React.useCallback((enable?: boolean) => {
    setIsLighterMode((prev) => {
      const next = enable !== undefined ? enable : !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LIGHTER_MODE_KEY, String(next));
        // Also dispatch custom event for listeners
        window.dispatchEvent(new CustomEvent("lighter-mode-changed", { detail: next }));
      }
      return next;
    });
  }, []);

  return { isLighterMode, toggleLighterMode };
}

/**
 * Slow Network State Component
 * Displays real loading progress and offers an immediate lighter path
 * to save data and speed up access on weak 2G/3G mountain touring routes.
 */
export function SlowNetworkNotice({
  progress: explicitProgress,
  estimatedSeconds = 4,
  onEnableLighterMode,
  onAbort,
  className,
}: SlowNetworkProps) {
  const { isLighterMode, toggleLighterMode } = useLighterMode();
  const [internalProgress, setInternalProgress] = React.useState(28);

  // Smoothly increment progress if not explicitly passed
  React.useEffect(() => {
    if (explicitProgress !== undefined) {
      setInternalProgress(explicitProgress);
      return;
    }

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 94) return prev;
        const delta = Math.floor(Math.random() * 8) + 3;
        return Math.min(94, prev + delta);
      });
    }, 450);

    return () => clearInterval(interval);
  }, [explicitProgress]);

  const currentProgress = Math.min(100, Math.max(0, explicitProgress ?? internalProgress));

  const handleActivateLighterMode = () => {
    toggleLighterMode(true);
    if (onEnableLighterMode) {
      onEnableLighterMode();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-2xl border border-amber-500/40 bg-asphalt/95 backdrop-blur-md p-5 sm:p-6 shadow-2xl space-y-5 overflow-hidden relative",
        className
      )}
    >
      {/* Background tachometer glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with connection diagnosis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Gauge className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-bone">
                Jalur Internet Lambat Terdeteksi
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Low Bandwidth
              </span>
            </div>
            <p className="text-xs text-bone-muted font-sans">
              Sedang mengambil data melalui jalur sinyal lemah (estimasi ~{estimatedSeconds}d).
            </p>
          </div>
        </div>

        {/* Progress Percentage Display */}
        <div className="flex items-baseline gap-1 font-mono text-amber-400 self-end sm:self-auto">
          <span className="text-2xl font-black">{Math.round(currentProgress)}</span>
          <span className="text-xs font-semibold">%</span>
        </div>
      </div>

      {/* Real Progress Meter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px] font-mono text-bone-muted">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-spin [animation-duration:3s] text-amber-400" />
            Mengunduh paket data penting...
          </span>
          <span className="text-bone font-semibold">
            {currentProgress >= 90 ? "Hampir Selesai" : "Sedang Mentransmisi"}
          </span>
        </div>

        {/* Tactical striped progress bar */}
        <div className="h-3 w-full bg-charcoal rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${currentProgress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.15)_75%,transparent_75%,transparent)] bg-[length:12px_12px] animate-[move-stripe_1s_linear_infinite]" />
          </div>
        </div>
      </div>

      {/* The Lighter Path Offer */}
      <div className="rounded-xl bg-charcoal/80 border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-gold" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-bone">
              Tersedia Opsi Akses Cepat (Lighter Path)
            </h4>
          </div>
          {isLighterMode && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Mode Ringan Aktif
            </span>
          )}
        </div>

        <p className="text-xs text-bone-muted leading-relaxed font-sans">
          Jangan tunggu lebih lama saat sinyal di jalur touring minim. Aktifkan Mode Ringan untuk menonaktifkan gambar resolusi ultra-tinggi dan memprioritaskan teks & jadwal penting.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="button"
            onClick={handleActivateLighterMode}
            className="px-4 py-4 text-xs font-display font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-charcoal shadow-lg flex items-center gap-2"
          >
            <ImageOff className="h-3.5 w-3.5" />
            <span>Aktifkan Mode Hemat Data</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          {onAbort && (
            <Button
              type="button"
              variant="outline"
              onClick={onAbort}
              className="px-3 py-4 text-xs font-mono text-bone-muted hover:text-bone border-white/10"
            >
              Lewati Proses
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

