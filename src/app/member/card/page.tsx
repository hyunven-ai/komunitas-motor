"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Shield,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMember } from "@/context/member-context";

export default function DigitalCardPage() {
  const { member, loading } = useMember();
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");
  const [isFlipped, setIsFlipped] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Secure verification token (from member record or member number)
  const verificationToken = member?.qrVerificationToken || member?.memberNumber || "";
  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/card/${verificationToken || "loading"}`
      : `http://localhost:3000/verify/card/${verificationToken || "loading"}`;

  React.useEffect(() => {
    if (!verificationToken) return;
    // Generate QR Code containing strictly the verification URL (No sensitive PII inside the QR)
    QRCode.toDataURL(verificationUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: "#171918",
        light: "#E9E2D3",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [verificationUrl, verificationToken]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <Badge variant="gold">KARTU TANDA ANGGOTA DIGITAL (KTA)</Badge>
        <h1 className="text-3xl font-serif font-black uppercase text-bone">
          Kartu Identitas Resmi Brotherhood
        </h1>
        <p className="text-sm text-bone-muted max-w-lg mx-auto">
          Tunjukkan KTA ini saat registrasi touring, verifikasi kopdar, dan klaim benefit rekanan bengkel resmi Brotherhood.
        </p>
      </div>

      {/* Card Display Container */}
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Interactive Flip Card */}
        <div className="w-full max-w-[430px] aspect-[1.586/1] perspective-1000">
          <div
            className={`relative w-full h-full duration-500 rounded-2xl shadow-2xl transition-transform transform-style-3d cursor-pointer ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
            title="Klik untuk membalik kartu"
          >
            {/* FRONT OF THE CARD */}
            <div className="absolute inset-0 backface-hidden rounded-2xl border-2 border-muted-gold/50 bg-gradient-to-br from-[#1c1e1c] via-[#161816] to-[#0e100e] p-6 text-bone shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Subtle background texture & watermark */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-muted-gold/10 blur-2xl pointer-events-none" />
              <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
                <Shield className="w-48 h-48" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-muted-gold/60 bg-charcoal shadow-inner">
                    <Shield className="h-5 w-5 text-muted-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black tracking-widest text-sm text-bone uppercase leading-none">
                      BROTHERHOOD
                    </h3>
                    <p className="text-[8px] font-mono tracking-widest text-muted-gold uppercase mt-0.5">
                      Motorcycle Community &bull; Indonesia
                    </p>
                  </div>
                </div>
                <Badge variant="gold" className="text-[9px] py-0.5 px-2 font-mono tracking-wider">
                  ACTIVE
                </Badge>
              </div>

              {/* Card Body: Photo & Member Details */}
              <div className="flex items-center gap-4 py-2 relative z-10">
                {/* Photo / Avatar */}
                <div className="h-24 w-20 rounded-lg border border-muted-gold/50 bg-charcoal flex flex-col items-center justify-center shrink-0 overflow-hidden shadow-md relative">
                  <div className="h-full w-full bg-gradient-to-t from-asphalt to-charcoal flex flex-col items-center justify-center">
                    <Shield className="h-8 w-8 text-muted-gold/50 mb-1" />
                    <span className="text-[8px] font-mono text-bone-muted uppercase">RIDER</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 overflow-hidden">
                  <p className="text-[9px] uppercase tracking-widest text-bone-muted">Nama Anggota</p>
                  <p className="text-base font-bold font-serif text-bone uppercase tracking-wide truncate">
                    {member?.fullName || "Anggota Brotherhood"}
                  </p>
                  <p className="text-xs font-mono font-bold text-muted-gold">
                    No: {member?.memberNumber || "BMC-MEMBER"}
                  </p>
                  <div className="pt-1 flex flex-wrap gap-x-3 text-[10px] text-bone-muted font-sans">
                    <span>{member?.motorcycleModel || "-"}</span>
                    <span>Plat: {member?.motorcyclePlate || "-"}</span>
                    <span>Gol. Darah: {member?.bloodType || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Joined Date & QR Code Preview */}
              <div className="flex items-end justify-between border-t border-white/10 pt-2.5 relative z-10">
                <div className="text-[9px] text-bone-muted space-y-0.5">
                  <p>Masa Berlaku: <strong className="text-bone">Seumur Hidup</strong></p>
                  <p>Bergabung: <strong className="text-muted-gold">{member?.joinedDate || "-"}</strong></p>
                </div>

                {/* QR Code Canvas */}
                <div className="rounded-md border border-muted-gold/40 bg-bone p-1 shadow-md">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="Verification QR Code"
                      className="h-12 w-12"
                    />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-charcoal animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BACK OF THE CARD */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 border-muted-gold/50 bg-gradient-to-br from-[#161816] to-[#0e100e] p-6 text-bone shadow-2xl flex flex-col justify-between">
              <div className="border-b border-white/10 pb-2">
                <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-muted-gold">
                  Ketentuan Pemegang Kartu
                </h4>
              </div>

              <div className="space-y-2 text-[10px] text-bone-muted leading-relaxed">
                <p>1. Kartu ini adalah bukti keabsahan keanggotaan resmi Brotherhood Motorcycle Community.</p>
                <p>2. Tidak dapat dipindahtangankan kepada pihak lain yang tidak berhak.</p>
                <p>3. Pemegang kartu wajib mematuhi seluruh kode etik, AD/ART, dan ikrar safety riding.</p>
                <p>4. Verifikasi keabsahan kartu dapat dilakukan dengan memindai kode QR melalui kamera ponsel.</p>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[9px] font-mono text-muted-gold">
                <span>SEKRETARIAT BROTHERHOOD</span>
                <span>TOKEN: {member?.qrVerificationToken ? member.qrVerificationToken.replace("bmc_tok_", "").slice(0, 12).toUpperCase() : "BMC-OFFICIAL"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flip Instruction Hint */}
        <p className="text-xs text-bone-muted flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-muted-gold" />
          <span>Klik kartu di atas untuk melihat sisi sebaliknya.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="default"
            onClick={handlePrint}
            className="gap-2 text-xs font-bold"
          >
            <Download className="h-4 w-4" />
            <span>Cetak / Simpan KTA</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="gap-2 text-xs"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Tautan Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-muted-gold" />
                <span>Salin Tautan Verifikasi</span>
              </>
            )}
          </Button>

          <Link
            href={verificationToken ? `/verify/card/${verificationToken}` : "#"}
            target={verificationToken ? "_blank" : undefined}
          >
            <Button
              variant="ghost"
              disabled={!verificationToken || loading}
              className="gap-2 text-xs text-bone-muted hover:text-bone"
            >
              <ExternalLink className="h-4 w-4 text-muted-gold" />
              <span>Buka Halaman Verifikasi Publik</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Security Details Section */}
      <Card className="border-white/10 bg-asphalt/50 mt-8">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-muted-gold">
            <Lock className="h-5 w-5" />
            <h3 className="font-serif font-bold text-base text-bone">
              Keamanan Verifikasi KTA Tanpa Bocor Data Pribadi
            </h3>
          </div>
          <p className="text-xs text-bone-muted leading-relaxed">
            Sesuai standar keamanan sistem informasi komunitas, kode QR pada kartu tidak menyimpan NIK KTP, alamat rumah, atau data rahasia lainnya secara mentah. Kode QR hanya berisi token acak kriptografis yang diverifikasi langsung oleh server Supabase untuk menampilkan status keanggotaan yang sah dan valid.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
