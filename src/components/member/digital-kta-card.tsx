"use client";

import * as React from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { QrCode, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DigitalKtaCardProps {
  fullName?: string;
  memberNumber?: string;
  nrta?: string;
  motorcyclePlate?: string;
  motorcycleModel?: string;
  joinedDate?: string;
  validUntil?: string;
  photoUrl?: string | null;
  qrDataUrl?: string;
  status?: string;
  className?: string;
  priority?: boolean;
}

/**
 * DigitalKtaCard
 * High-tech official KTA card for Borneo Brotherhood Motorcycle Community.
 * Renders dynamically on top of the official graphic template (/images/kta-template.webp)
 * with proportional container queries and pixel-precision border radius matching the card boundary.
 */
export function DigitalKtaCard({
  fullName = "BAMBANG WIJAYA",
  memberNumber = "BMC-2024-0012",
  nrta,
  motorcyclePlate = "KB 4521 XX",
  motorcycleModel,
  joinedDate = "Oktober 2024",
  validUntil = "SEUMUR HIDUP",
  photoUrl,
  qrDataUrl,
  status = "active",
  className,
  priority = false,
}: DigitalKtaCardProps) {
  // Format fallback NRTA if not explicitly provided
  const displayNrta = React.useMemo(() => {
    if (nrta) return nrta;
    if (!memberNumber) return "NRTA-001";
    const digitsOnly = memberNumber.replace(/[^0-9]/g, "");
    const cleanNum = digitsOnly ? digitsOnly.slice(-4) : "0001";
    return `NRTA-${cleanNum}`;
  }, [nrta, memberNumber]);

  const isActive = status?.toLowerCase() === "active";

  // Auto-generate high-res, edge-to-edge QR Code if not supplied externally
  const [autoQr, setAutoQr] = React.useState<string>("");

  React.useEffect(() => {
    if (qrDataUrl) return;

    const token = memberNumber || "BMC-OFFICIAL";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://brotherhood.id";
    const targetUrl = `${origin}/verify/card/${token}`;

    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 0,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((dataUri) => setAutoQr(dataUri))
      .catch((err) => console.error("Failed to generate KTA QR:", err));
  }, [qrDataUrl, memberNumber]);

  const activeQr = qrDataUrl || autoQr;

  return (
    <div
      className={cn(
        "@container relative w-full aspect-[1024/682] select-none overflow-hidden",
        "rounded-[22px] sm:rounded-[32px] md:rounded-[36px]",
        "border border-red-500/20",
        "shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(220,38,38,0.2)]",
        className
      )}
      style={{
        borderRadius: "clamp(20px, 8.8%, 42px)",
      }}
    >
      {/* 1. High-Tech Card Template Graphic */}
      <Image
        src="/images/kta-template.webp"
        alt="KTA Digital Borneo Brotherhood"
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 500px, 600px"
        className="object-cover pointer-events-none select-none"
      />

      {/* 2. Photo / Avatar Slot (FOTO ANGGOTA Frame) */}
      <div
        className="absolute overflow-hidden flex items-center justify-center pointer-events-none"
        style={{
          left: "6.84%",
          top: "26.54%",
          width: "20.12%",
          height: "43.11%",
          borderRadius: "clamp(6px, 2.3%, 14px)",
        }}
      >
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={fullName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 120px, 150px"
          />
        ) : (
          /* When no custom photo is uploaded, template's native red shield & 'FOTO ANGGOTA' shines through */
          null
        )}
      </div>

      {/* 3. Member Name Slot ("NAMA ANGGOTA") */}
      <div
        className="absolute flex items-center px-1 pointer-events-none"
        style={{
          left: "31.0%",
          top: "35.8%",
          width: "34.0%",
          height: "4.4%",
        }}
      >
        <span className="font-display font-extrabold text-white uppercase tracking-wider truncate text-[clamp(9px,2.8cqw,17px)] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {fullName}
        </span>
      </div>

      {/* 4. Member Number Slot ("No. ANGGOTA") */}
      <div
        className="absolute flex items-center px-1 pointer-events-none"
        style={{
          left: "31.0%",
          top: "49.3%",
          width: "34.0%",
          height: "5.2%",
        }}
      >
        <span className="font-mono font-extrabold text-red-400 tracking-wider truncate text-[clamp(8px,2.4cqw,15px)] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {memberNumber}
        </span>
      </div>

      {/* 5. NRTA Slot ("NRTA:") */}
      <div
        className="absolute flex items-center px-1 pointer-events-none"
        style={{
          left: "31.0%",
          top: "61.9%",
          width: "17.0%",
          height: "5.0%",
        }}
      >
        <span className="font-mono font-bold text-white tracking-tight sm:tracking-normal whitespace-nowrap text-[clamp(8px,2.1cqw,13px)] leading-none">
          {displayNrta}
        </span>
      </div>

      {/* 6. Plate Number Slot ("Plat:") - Spacious & Non-Truncating */}
      <div
        className="absolute flex items-center px-1 pointer-events-none"
        style={{
          left: "53.2%",
          top: "61.9%",
          width: "18.0%",
          height: "5.0%",
        }}
      >
        <span className="font-mono font-bold text-white tracking-tight sm:tracking-normal whitespace-nowrap text-[clamp(8px,2.1cqw,13px)] leading-none">
          {motorcyclePlate || "-"}
        </span>
      </div>

      {/* 7. Validity Slot ("Berlaku s/d:") */}
      <div
        className="absolute flex items-center px-1 pointer-events-none"
        style={{
          left: "34.8%",
          top: "75.4%",
          width: "37.0%",
          height: "5.5%",
        }}
      >
        <span className="font-mono font-bold text-neutral-100 uppercase tracking-wider truncate text-[clamp(8px,2.3cqw,13px)] leading-none">
          {validUntil}
        </span>
      </div>

      {/* 8. Masa Berlaku Value Pill (Bottom Left) - Centered in Capsule */}
      <div
        className="absolute flex items-center justify-center text-center pointer-events-none"
        style={{
          left: "20.2%",
          top: "85.0%",
          width: "18.0%",
          height: "3.8%",
        }}
      >
        <span className="font-mono font-medium text-neutral-200 whitespace-nowrap text-[clamp(7px,1.8cqw,11px)] leading-none">
          {validUntil === "SEUMUR HIDUP" ? "Seumur Hidup" : validUntil}
        </span>
      </div>

      {/* 9. Joined Date Value Pill ("Bergabung:") - Centered in Capsule */}
      <div
        className="absolute flex items-center justify-center text-center pointer-events-none"
        style={{
          left: "17.6%",
          top: "89.6%",
          width: "17.4%",
          height: "3.8%",
        }}
      >
        <span className="font-mono font-medium text-neutral-300 whitespace-nowrap text-[clamp(7px,1.8cqw,11px)] leading-none">
          {joinedDate}
        </span>
      </div>

      {/* 10. QR Code Frame (Bracketed Scanner Target at Bottom Right) - Full Size Fill */}
      <div
        className="absolute flex items-center justify-center p-[2%] pointer-events-none"
        style={{
          left: "80.47%",
          top: "68.62%",
          width: "14.16%",
          height: "21.70%",
        }}
      >
        {activeQr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeQr}
            alt="Verifikasi QR KTA"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-1">
            <QrCode className="w-full h-full text-neutral-800 animate-pulse" />
          </div>
        )}
      </div>

      {/* 11. Dynamic Status Override (If not Active) */}
      {!isActive && (
        <div
          className="absolute flex items-center justify-center bg-amber-950/90 border border-amber-500 rounded-full px-2"
          style={{
            left: "80.5%",
            top: "14%",
            width: "14.5%",
            height: "5.5%",
          }}
        >
          <span className="text-[clamp(6px,1.8cqw,10px)] font-mono font-bold text-amber-300 uppercase tracking-wider">
            {status}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * DigitalKtaCardBack
 * The official reverse side of the KTA card with bylaws, terms, and authentication tokens.
 */
export function DigitalKtaCardBack({
  memberNumber = "BMC-2024-0012",
  verificationToken,
  className,
}: {
  memberNumber?: string;
  verificationToken?: string;
  className?: string;
}) {
  const displayToken = React.useMemo(() => {
    if (verificationToken) {
      return verificationToken.replace("bmc_tok_", "").slice(0, 14).toUpperCase();
    }
    return memberNumber ? `BMC-SEC-${memberNumber.slice(-4)}` : "BMC-OFFICIAL";
  }, [verificationToken, memberNumber]);

  return (
    <div
      className={cn(
        "@container relative w-full aspect-[1024/682] select-none overflow-hidden",
        "rounded-[22px] sm:rounded-[32px] md:rounded-[36px]",
        "border border-red-500/30",
        "bg-gradient-to-br from-[#14161F] via-[#0E1015] to-[#07080B] text-white p-6 sm:p-8 flex flex-col justify-between",
        "shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(220,38,38,0.2)]",
        className
      )}
      style={{
        borderRadius: "clamp(20px, 8.8%, 42px)",
      }}
    >
      {/* Background Carbon & Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      {/* Back Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/40 bg-red-950/40 text-red-400">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-xs sm:text-sm text-white">
              BORNEO BROTHERHOOD INDONESIA
            </h4>
            <p className="text-[8px] sm:text-[9px] font-mono tracking-wider text-neutral-400 uppercase">
              Ketentuan Pemegang Kartu Tanda Anggota (KTA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 text-[9px] font-mono font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" />
          <span>RESMI</span>
        </div>
      </div>

      {/* Back Bylaws */}
      <div className="relative z-10 space-y-1.5 sm:space-y-2 text-[8px] sm:text-[10px] text-neutral-300 leading-relaxed font-sans py-2">
        <p className="flex items-start gap-1.5">
          <span className="font-mono text-red-400 font-bold">1.</span>
          <span>Kartu ini adalah bukti sah keanggotaan resmi Borneo Brotherhood Motorcycle Community Indonesia.</span>
        </p>
        <p className="flex items-start gap-1.5">
          <span className="font-mono text-red-400 font-bold">2.</span>
          <span>Wajib ditunjukkan saat touring resmi, registrasi kopdar, klaim diskon merchant mitra, dan musyawarah komunitas.</span>
        </p>
        <p className="flex items-start gap-1.5">
          <span className="font-mono text-red-400 font-bold">3.</span>
          <span>Hak penggunaan kartu melekat sah pada pemilik terdaftar dan tidak dapat dipindahtangankan kepada pihak lain.</span>
        </p>
        <p className="flex items-start gap-1.5">
          <span className="font-mono text-red-400 font-bold">4.</span>
          <span>Pemegang kartu wajib mematuhi seluruh AD/ART komunitas, kode etik bikers santun, dan ikrar safety riding (Zero Accident).</span>
        </p>
      </div>

      {/* Back Footer */}
      <div className="relative z-10 border-t border-white/10 pt-2.5 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-neutral-400">
        <span className="uppercase text-neutral-300 font-semibold">
          Sekretariat Pusat Borneo Brotherhood
        </span>
        <span className="text-red-400 font-bold">
          SECURITY TOKEN: {displayToken}
        </span>
      </div>
    </div>
  );
}
