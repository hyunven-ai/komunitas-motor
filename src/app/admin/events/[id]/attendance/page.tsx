"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { verifyAndCheckinAction, manualCheckinAction, type CheckinResultData } from "@/features/events/actions";

interface ParticipantItem {
  id: string;
  memberNumber: string;
  fullName: string;
  motorcycle: string;
  plate: string;
  status: "attended" | "confirmed" | "registered";
  attendedAt?: string;
}

const INITIAL_PARTICIPANTS: ParticipantItem[] = [
  {
    id: "mem-012",
    memberNumber: "BMC-2026-0012",
    fullName: "Bambang Wijaya",
    motorcycle: "Kawasaki Versys 650",
    plate: "B 4421 KBR",
    status: "confirmed",
  },
  {
    id: "mem-001",
    memberNumber: "BMC-2018-0001",
    fullName: "Aryo Perkasa",
    motorcycle: "BMW R1250GS Adv",
    plate: "B 1001 ARY",
    status: "attended",
    attendedAt: "05.15 WIB",
  },
  {
    id: "mem-004",
    memberNumber: "BMC-2018-0004",
    fullName: "Hendrik 'Bison'",
    motorcycle: "Honda Africa Twin",
    plate: "B 4400 BSN",
    status: "attended",
    attendedAt: "05.22 WIB",
  },
  {
    id: "mem-033",
    memberNumber: "BMC-2020-0033",
    fullName: "Teguh Supriyadi",
    motorcycle: "Honda CB500X",
    plate: "F 3321 SO",
    status: "confirmed",
  },
  {
    id: "mem-056",
    memberNumber: "BMC-2021-0056",
    fullName: "Ilham Satria",
    motorcycle: "Suzuki V-Strom 650",
    plate: "B 5500 HMS",
    status: "confirmed",
  },
];

export default function EventAttendanceScannerPage() {
  const params = useParams();
  const eventId = (params?.id as string) || "evt-south-2026";

  const [activeTab, setActiveTab] = React.useState<"camera" | "manual">("camera");
  const [scannerStarted, setScannerStarted] = React.useState(false);
  const [scannerError, setScannerError] = React.useState<string | null>(null);
  const [lastResult, setLastResult] = React.useState<{
    success: boolean;
    message: string;
    data?: CheckinResultData;
  } | null>(null);

  const [participants, setParticipants] = React.useState<ParticipantItem[]>(INITIAL_PARTICIPANTS);
  const [searchManual, setSearchManual] = React.useState("");

  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const isProcessingRef = React.useRef(false);

  // Start Camera QR Scanner
  const startScanner = async () => {
    setScannerError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;

          // Call server checkin action
          const res = await verifyAndCheckinAction({
            eventId,
            tokenHash: decodedText,
          });

          setLastResult(res);

          if (res.success && res.data) {
            // Update local participants state
            setParticipants((prev) =>
              prev.map((p) =>
                p.memberNumber === res.data?.memberNumber
                  ? { ...p, status: "attended", attendedAt: res.data.checkedInAt }
                  : p
              )
            );
          }

          // Reset scan lock after 2 seconds
          setTimeout(() => {
            isProcessingRef.current = false;
          }, 2000);
        },
        () => {
          // ignore frame decode misses
        }
      );

      setScannerStarted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengakses kamera ponsel";
      setScannerError(msg);
      setScannerStarted(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerStarted) {
      try {
        await scannerRef.current.stop();
        setScannerStarted(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Manual Check-in Handler
  const handleManualCheckin = async (participant: ParticipantItem) => {
    const res = await manualCheckinAction(eventId, participant.id);
    setLastResult(res);

    if (res.success) {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id
            ? { ...p, status: "attended", attendedAt: res.data?.checkedInAt || "05.30 WIB" }
            : p
        )
      );
    }
  };

  // Test scan trigger for local testing without camera
  const handleTestScan = async (type: "valid" | "duplicate" | "invalid") => {
    const token =
      type === "valid"
        ? "evt_att_token_touring_selatan_bw0012"
        : type === "duplicate"
        ? "evt_att_token_touring_selatan_bw0012"
        : "evt_att_token_invalid_fake";

    const res = await verifyAndCheckinAction({ eventId, tokenHash: token });
    setLastResult(res);

    if (res.success && res.data) {
      setParticipants((prev) =>
        prev.map((p) =>
          p.memberNumber === res.data?.memberNumber
            ? { ...p, status: "attended", attendedAt: res.data.checkedInAt }
            : p
        )
      );
    }
  };

  const attendedCount = participants.filter((p) => p.status === "attended").length;
  const totalCount = participants.length;

  const filteredManual = participants.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchManual.toLowerCase()) ||
      p.memberNumber.toLowerCase().includes(searchManual.toLowerCase()) ||
      p.plate.toLowerCase().includes(searchManual.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs text-bone-muted hover:text-muted-gold mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Manajemen Event</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="gold">OPERATOR PRESENSI</Badge>
            <span className="text-xs font-mono text-muted-gold">Event ID: {eventId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
            Scanner Presensi QR di Lokasi Start
          </h1>
        </div>

        {/* Attendance Counter Badge */}
        <div className="rounded-xl border border-muted-gold/40 bg-asphalt px-4 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wider text-bone-muted">Kehadiran Peserta</p>
          <p className="text-xl font-mono font-bold text-emerald-400">
            {attendedCount} / {totalCount} Hadir
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-lg border border-white/10 bg-asphalt p-1">
        <button
          onClick={() => {
            setActiveTab("camera");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${
            activeTab === "camera"
              ? "bg-muted-gold text-charcoal shadow-sm"
              : "text-bone-muted hover:text-bone"
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Kamera Scanner QR</span>
        </button>

        <button
          onClick={() => {
            stopScanner();
            setActiveTab("manual");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${
            activeTab === "manual"
              ? "bg-muted-gold text-charcoal shadow-sm"
              : "text-bone-muted hover:text-bone"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Lookup Presensi Manual ({totalCount})</span>
        </button>
      </div>

      {/* SCANNER NOTIFICATION POPUP */}
      {lastResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            lastResult.success
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100"
              : "bg-red-950/80 border-red-500/50 text-red-100"
          }`}
        >
          {lastResult.success ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <p className="font-bold text-sm">
              {lastResult.success ? "Check-In Berhasil!" : "Gagal Melakukan Check-In"}
            </p>
            <p className="text-xs opacity-90">{lastResult.message}</p>
            {lastResult.data && (
              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono font-semibold text-emerald-300">
                <span>Rider: {lastResult.data.memberName}</span>
                <span>No. KTA: {lastResult.data.memberNumber}</span>
                <span>Waktu: {lastResult.data.checkedInAt}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setLastResult(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: CAMERA SCANNER */}
      {activeTab === "camera" && (
        <div className="space-y-6">
          <Card className="border-muted-gold/40 bg-asphalt/80 p-6 flex flex-col items-center text-center space-y-4">
            {/* Viewport for html5-qrcode */}
            <div className="w-full max-w-sm aspect-square bg-charcoal rounded-xl border-2 border-dashed border-muted-gold/50 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div id="reader" className="w-full h-full" />

              {!scannerStarted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-charcoal/90 space-y-3 z-10">
                  <QrCode className="h-16 w-16 text-muted-gold/60 animate-pulse" />
                  <p className="text-xs text-bone-muted max-w-xs">
                    Posisikan kamera ponsel ke kode QR tiket peserta untuk mencatat kehadiran secara atomik.
                  </p>
                  <Button
                    onClick={startScanner}
                    size="sm"
                    className="font-bold text-xs gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Aktifkan Kamera Scanner</span>
                  </Button>
                </div>
              )}
            </div>

            {scannerError && (
              <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/60 border border-red-500/30 p-3 rounded-lg max-w-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{scannerError}</span>
              </div>
            )}

            {scannerStarted && (
              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopScanner}
                  className="text-xs gap-1.5"
                >
                  <CameraOff className="h-4 w-4" />
                  <span>Matikan Kamera</span>
                </Button>
              </div>
            )}

            {/* Quick Test Triggers (For testing on Laptop / Desktop without camera) */}
            <div className="border-t border-white/5 pt-4 w-full max-w-sm">
              <p className="text-[10px] font-mono uppercase text-muted-gold mb-2 flex items-center justify-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Quick Simulate Check-In
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-emerald-400 border-emerald-500/30"
                  onClick={() => handleTestScan("valid")}
                >
                  Simulasi Scan Valid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-400 border-red-500/30"
                  onClick={() => handleTestScan("invalid")}
                >
                  Simulasi Token Palsu
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MANUAL LOOKUP FALLBACK */}
      {activeTab === "manual" && (
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Daftar Peserta Terdaftar ({filteredManual.length})</span>
              <span className="text-xs text-bone-muted font-normal">
                Fallback jika kamera peserta retak atau perangkat bermasalah
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-bone-muted" />
              <Input
                placeholder="Cari nama peserta, nomor KTA, atau nomor plat motor..."
                value={searchManual}
                onChange={(e) => setSearchManual(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="divide-y divide-white/5">
              {filteredManual.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-bone text-sm">{p.fullName}</span>
                      <span className="font-mono text-xs text-muted-gold font-bold">
                        {p.memberNumber}
                      </span>
                    </div>
                    <p className="text-xs text-bone-muted">
                      {p.motorcycle} &bull; Plat: <strong className="text-bone">{p.plate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {p.status === "attended" ? (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>HADIR ({p.attendedAt || "Tercatat"})</span>
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs font-bold gap-1.5"
                        onClick={() => handleManualCheckin(p)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Check-In Manual</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
