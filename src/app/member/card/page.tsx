"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
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
import { DigitalKtaCard, DigitalKtaCardBack } from "@/components/member/digital-kta-card";

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
      width: 400,
      margin: 0,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
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
        <div className="w-full max-w-[460px] aspect-[1024/682] perspective-1000">
          <div
            className={`relative w-full h-full duration-500 rounded-[22px] sm:rounded-[36px] transition-transform transform-style-3d cursor-pointer ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
            title="Klik untuk membalik kartu"
          >
            {/* FRONT OF THE CARD */}
            <div className="absolute inset-0 backface-hidden">
              <DigitalKtaCard
                fullName={member?.fullName || "Anggota Brotherhood"}
                memberNumber={member?.memberNumber || "BMC-2024-0012"}
                motorcyclePlate={member?.motorcyclePlate || "-"}
                motorcycleModel={member?.motorcycleModel}
                joinedDate={member?.joinedDate || "Oktober 2024"}
                photoUrl={member?.avatarUrl}
                qrDataUrl={qrDataUrl}
                status={member?.status || "active"}
                priority
              />
            </div>

            {/* BACK OF THE CARD */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <DigitalKtaCardBack
                memberNumber={member?.memberNumber || "BMC-2024-0012"}
                verificationToken={member?.qrVerificationToken}
              />
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
