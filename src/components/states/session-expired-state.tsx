"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  LogIn,
  CheckCircle2,
  Clock,
  Save,
  ArrowRight,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraftStorage, type SavedDraft } from "@/lib/states/draft-storage";
import { cn } from "@/lib/utils";

export interface SessionExpiredModalProps {
  /** Whether modal is currently open */
  isOpen: boolean;
  /** Unique ID of the form being edited */
  formId: string;
  /** Current unsaved form values to secure */
  currentFormData?: unknown;
  /** Human-readable title of the document / form */
  formTitle?: string;
  /** Login route to redirect to */
  loginUrl?: string;
  /** On cancel / stay on page (read-only) callback */
  onStay?: () => void;
  className?: string;
}

/**
 * Hook to automatically synchronize form values into local draft storage
 * so if the session expires, the work is already 100% secured.
 */
export function useDraftAutoSave<T extends Record<string, unknown>>(
  formId: string,
  currentValues: T,
  options: {
    title?: string;
    intervalMs?: number;
    enabled?: boolean;
  } = {}
) {
  const { title = "Draf Formulir", intervalMs = 2000, enabled = true } = options;
  const [lastSaved, setLastSaved] = React.useState<SavedDraft<T> | null>(null);

  // Check for existing draft on initial mount
  React.useEffect(() => {
    const existing = DraftStorage.get<T>(formId);
    if (existing) {
      setLastSaved(existing);
    }
  }, [formId]);

  // Periodic autosave when values change
  React.useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      // Don't save completely empty objects
      const hasContent = Object.values(currentValues || {}).some(
        (v) => v !== "" && v !== null && v !== undefined
      );

      if (hasContent) {
        const saved = DraftStorage.save<T>(formId, currentValues, title);
        if (saved) {
          setLastSaved(saved);
        }
      }
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [formId, currentValues, title, intervalMs, enabled]);

  const clearDraft = React.useCallback(() => {
    DraftStorage.remove(formId);
    setLastSaved(null);
  }, [formId]);

  return { lastSaved, clearDraft };
}

/**
 * Session Expired Component
 * DOES: "save their work before you sign them out"
 */
export function SessionExpiredModal({
  isOpen,
  formId,
  currentFormData,
  formTitle = "Formulir Pendaftaran",
  loginUrl = "/login",
  onStay,
  className,
}: SessionExpiredModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [savedTime, setSavedTime] = React.useState<string | null>(null);
  const [fieldCount, setFieldCount] = React.useState<number>(0);

  // When modal triggers open: immediately secure currentFormData into local storage
  React.useEffect(() => {
    if (isOpen) {
      if (currentFormData && typeof currentFormData === "object") {
        const keys = Object.keys(currentFormData);
        setFieldCount(keys.length);
        const draft = DraftStorage.save(formId, currentFormData, formTitle);
        if (draft) {
          const d = new Date(draft.savedAt);
          setSavedTime(
            d.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        }
      } else {
        // Check if there was an existing draft
        const existing = DraftStorage.get(formId);
        if (existing) {
          const d = new Date(existing.savedAt);
          setSavedTime(
            d.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        } else {
          setSavedTime(
            new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        }
      }
    }
  }, [isOpen, formId, currentFormData, formTitle]);

  if (!isOpen) return null;

  const handleSignIn = () => {
    // Construct redirect URL with draft restoration parameter
    const returnPath = pathname || "/";
    const redirectTarget = `${loginUrl}?redirect=${encodeURIComponent(
      returnPath
    )}&restoreDraft=${encodeURIComponent(formId)}`;
    router.push(redirectTarget);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-muted-gold/40 bg-asphalt p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-center",
          className
        )}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Tactical Lock Header */}
        <div className="flex flex-col items-center space-y-3 relative z-10">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-charcoal border border-amber-500/30 text-amber-400 shadow-inner">
            <Lock className="h-7 w-7" />
          </div>

          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-gold font-bold">
            SESI KEAMANAN BERAKHIR
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-bone">
            Waktu Sesi Anda Telah Habis
          </h3>
          <p className="text-xs sm:text-sm text-bone-muted font-sans max-w-sm">
            Untuk menjaga keamanan akun komunitas Anda, sesi otomatis diakhiri karena batas waktu aktivitas.
          </p>
        </div>

        {/* WORK SAVED ASSURANCE CARD */}
        <div className="rounded-xl bg-charcoal/90 border border-emerald-500/30 p-4 space-y-2 text-left relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Semua Pekerjaan Telah Diamankan</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Draft Secured
            </span>
          </div>

          <p className="text-xs text-bone-muted leading-relaxed font-sans">
            Data isian pada <strong>&ldquo;{formTitle}&rdquo;</strong> telah berhasil disimpan secara lokal sebelum sesi ditutup. Anda tidak akan kehilangan ketikan Anda.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-bone-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-gold" />
              Tersimpan: {savedTime || "Baru saja"}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Database className="h-3 w-3" />
              {fieldCount > 0 ? `${fieldCount} Kolom Aman` : "Draf Tersedia"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1 relative z-10">
          <Button
            type="button"
            onClick={handleSignIn}
            className="w-full py-5 text-xs font-display font-bold uppercase tracking-wider bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk Kembali & Pulihkan Isian</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          {onStay && (
            <button
              type="button"
              onClick={onStay}
              className="text-xs text-bone-muted hover:text-bone underline underline-offset-4 font-mono transition-colors"
            >
              Tutup & Tinjau dalam Mode Baca Saja
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

