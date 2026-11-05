"use client";

import * as React from "react";
import {
  WifiOff,
  Wifi,
  CheckCircle2,
  HardDrive,
  FileCheck,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Custom hook to monitor online/offline status with graceful state transitions
 */
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = React.useState<boolean>(false);
  const [justReconnected, setJustReconnected] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!window.navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return { isOffline, justReconnected, setIsOffline };
}

export interface OfflineBannerProps {
  /** If provided, overrides internal browser state (useful for testing or simulation) */
  forceOffline?: boolean;
  className?: string;
}

/**
 * Offline State Component
 * DOES NOT replace page content: keeps all rendered & cached context on screen,
 * while clearly informing the user what still works.
 */
export function OfflineBanner({ forceOffline, className }: OfflineBannerProps) {
  const { isOffline: hookOffline, justReconnected } = useOfflineStatus();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isOffline = forceOffline !== undefined ? forceOffline : hookOffline;

  // If online and not recently reconnected, don't show anything
  if (!isOffline && !justReconnected) {
    return null;
  }

  // If just reconnected, show temporary confirmation pill
  if (justReconnected && !isOffline) {
    return (
      <div
        role="status"
        className={cn(
          "fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300 font-mono text-xs",
          className
        )}
      >
        <Wifi className="h-4 w-4 text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold">Koneksi Pulih:</span> Perangkat Anda kembali online.
        </div>
      </div>
    );
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-xl border border-amber-500/40 bg-asphalt/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300",
        className
      )}
    >
      {/* Top alert bar */}
      <div className="h-1 bg-amber-500 w-full animate-pulse" />

      <div className="p-4 space-y-3">
        {/* Header line */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <WifiOff className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-bone">
                  Koneksi Terputus (Mode Offline)
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-semibold">
                  Cached Active
                </span>
              </div>
              <p className="text-[11px] text-bone-muted font-sans">
                Layar tetap aktif. Tidak ada data yang hilang.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-bone-muted hover:text-bone p-1 rounded transition-colors text-xs font-mono flex items-center gap-1"
            aria-label="Rincian fitur yang masih berfungsi"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* What still works - explicitly communicated */}
        <div className="rounded-lg bg-charcoal/80 border border-white/5 p-3 space-y-2">
          <span className="text-[10px] font-mono uppercase text-muted-gold font-bold tracking-widest block">
            Fitur Yang Masih Dapat Anda Gunakan:
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-xs text-bone-muted font-sans">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Konten Tersimpan:</strong> Halaman, berita, dan rute touring yang sudah terbuka tetap bisa dibaca.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Draf Otomatis:</strong> Isian formulir Anda tetap diamankan di memori lokal gawai.
              </span>
            </div>
            {isExpanded && (
              <div className="flex items-start gap-2 pt-1 border-t border-white/5">
                <HardDrive className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sinkronisasi Nanti:</strong> Tindakan kirim data akan diproses otomatis begitu sinyal pulih.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reconnect helper note */}
        <div className="flex items-center justify-between text-[11px] font-mono text-bone-muted/80 pt-1">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-spin [animation-duration:4s] text-amber-400" />
            Menunggu koneksi internet kembali...
          </span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-muted-gold hover:underline font-bold"
          >
            Cek Sinyal
          </button>
        </div>
      </div>
    </aside>
  );
}

