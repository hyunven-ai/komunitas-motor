"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Knowledge base of field-specific remediation tips ("how to fix it")
 */
export const FIELD_FIX_TIPS: Record<string, { rule: string; example: string }> = {
  fullName: {
    rule: "Masukkan nama lengkap resmi sesuai KTP tanpa singkatan berlebihan.",
    example: "Contoh: Budi Santoso",
  },
  username: {
    rule: "Username terdiri dari 3-30 karakter (huruf, angka, strip, titik, atau underscore) tanpa spasi. Ini akan menjadi ID login Anda.",
    example: "Contoh: rider_borneo atau bambang99",
  },
  email: {
    rule: "Gunakan format alamat email aktif yang valid dengan domain terdaftar.",
    example: "Contoh: budi.santoso@gmail.com",
  },
  phoneNumber: {
    rule: "Gunakan nomor WhatsApp aktif diawali kode '08' atau '628' (10-14 digit).",
    example: "Contoh: 081234567890 atau 6281234567890",
  },
  idCardNumber: {
    rule: "NIK KTP wajib terdiri tepat dari 16 digit angka tanpa tanda spasi/strip.",
    example: "Contoh: 3201012345670001",
  },
  drivingLicenseNumber: {
    rule: "Nomor SIM C wajib terdiri dari 12-14 digit angka sesuai kartu SIM aktif.",
    example: "Contoh: 123456789012",
  },
  motorcycleModel: {
    rule: "Tuliskan merk, tipe, dan kapasitas silinder motor yang digunakan.",
    example: "Contoh: Honda CB500X / Yamaha XSR 155",
  },
  motorcyclePlate: {
    rule: "Gunakan format nomor plat kendaraan Indonesia yang valid.",
    example: "Contoh: B 1234 XYZ atau D 4567 ABC",
  },
  motorcycleYear: {
    rule: "Tahun perakitan motor harus berupa angka 4 digit antara 1970 hingga tahun ini.",
    example: "Contoh: 2021",
  },
  city: {
    rule: "Tuliskan nama kota domisili tempat Anda tinggal saat ini.",
    example: "Contoh: Bandung, Jawa Barat",
  },
  emergencyContactPhone: {
    rule: "Nomor kontak darurat (keluarga/kerabat) harus aktif & berbeda dari nomor Anda.",
    example: "Contoh: 081987654321",
  },
  reasonToJoin: {
    rule: "Tuliskan motivasi Anda minimal 20 karakter untuk pertimbangan dewan pengurus.",
    example: "Contoh: Ingin memperluas silaturahmi sesama rider dan berpartisipasi dalam bakti sosial.",
  },
  password: {
    rule: "Gunakan minimal 8 karakter dengan perpaduan huruf dan minimal 1 digit angka.",
    example: "Contoh: Bikers2026!",
  },
};

export interface InlineFieldErrorProps {
  /** The error message string */
  error?: string | { message?: string };
  /** Field identifier to lookup smart remediation tips */
  fieldName?: string;
  /** Explicit manual "how to fix it" tip */
  fixTip?: string;
  className?: string;
}

/**
 * Inline Form Error Indicator
 * DOES: "flag the exact field, inline, with how to fix it"
 */
export function InlineFieldError({
  error,
  fieldName,
  fixTip,
  className,
}: InlineFieldErrorProps) {
  const errorMessage =
    typeof error === "string" ? error : error?.message ? String(error.message) : null;

  if (!errorMessage) return null;

  // Lookup smart suggestion tip
  const smartTip = fieldName ? FIELD_FIX_TIPS[fieldName] : null;
  const resolutionText = fixTip || (smartTip ? `${smartTip.rule} (${smartTip.example})` : null);

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-red-500/40 bg-red-950/40 p-2.5 mt-1.5 space-y-1.5 text-left animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
    >
      {/* 1. Flag the exact error message */}
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
        <span>{errorMessage}</span>
      </div>

      {/* 2. Concrete instruction: WITH HOW TO FIX IT */}
      {resolutionText && (
        <div className="flex items-start gap-1.5 text-[11px] text-bone-muted pl-5 font-sans leading-relaxed border-t border-red-500/10 pt-1">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-bone font-medium">Cara Memperbaiki:</strong>{" "}
            {resolutionText}
          </span>
        </div>
      )}
    </div>
  );
}

export interface ValidatedFieldProps {
  label: string;
  required?: boolean;
  error?: string | { message?: string };
  fieldName?: string;
  fixTip?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Validated Field Wrapper
 * Surrounds an input with high-visibility error boundaries and inline fix guides
 */
export function ValidatedField({
  label,
  required,
  error,
  fieldName,
  fixTip,
  hint,
  children,
  className,
}: ValidatedFieldProps) {
  const hasError = Boolean(
    typeof error === "string" ? error : error?.message
  );

  return (
    <div className={cn("space-y-1.5 text-left", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-medium text-bone uppercase tracking-wider flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {hint && !hasError && (
          <span className="text-[10px] font-mono text-bone-muted/70">{hint}</span>
        )}
      </div>

      {/* Input container with dynamic error styling */}
      <div
        className={cn(
          "relative transition-all rounded-md",
          hasError && "ring-1 ring-red-500 rounded-md"
        )}
      >
        {children}
      </div>

      {/* Flag exact field inline with how to fix it */}
      <InlineFieldError
        error={error}
        fieldName={fieldName}
        fixTip={fixTip}
      />
    </div>
  );
}

