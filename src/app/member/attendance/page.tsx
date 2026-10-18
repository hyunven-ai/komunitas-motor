"use client";

import * as React from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  QrCode,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  CreditCard,
  History,
  Ticket,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMember } from "@/context/member-context";
import { formatRupiah } from "@/lib/utils";

interface AttendanceTicketItem {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  locationName: string;
  locationAddress: string;
  startTime: string;
  endTime: string;
  eventFee: number;
  eventStatus: string;
  registrationStatus: "registered" | "confirmed" | "attended" | "cancelled";
  registeredAt: string;
  tokenHash: string;
  isAttended: boolean;
  attendedAt: string | null;
  checkinMethod: string | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: "unpaid" | "submitted" | "paid" | "rejected";
  } | null;
}

export default function MemberAttendancePage() {
  const { member } = useMember();
  const [loading, setLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<AttendanceTicketItem[]>([]);
  const [history, setHistory] = React.useState<AttendanceTicketItem[]>([]);
  const [stats, setStats] = React.useState({
    totalRegistered: 0,
    totalAttended: 0,
    attendanceRate: 100,
  });

  const [selectedTicketIndex, setSelectedTicketIndex] = React.useState<number>(0);
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"tickets" | "history">("tickets");

  const activeTicket = tickets[selectedTicketIndex] || null;

  // 1. Fetch attendance & tickets
  React.useEffect(() => {
    let isMounted = true;
    async function loadAttendanceData() {
      try {
        setLoading(true);
        const res = await fetch("/api/member/attendance");
        const json = await res.json();

        if (isMounted && json.success && json.data) {
          setTickets(json.data.tickets || []);
          setHistory(json.data.history || []);
          if (json.data.stats) {
            setStats(json.data.stats);
          }
        }
      } catch (err) {
        console.error("Error loading attendance data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAttendanceData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Generate QR code for selected ticket
  React.useEffect(() => {
    if (!activeTicket?.tokenHash) {
      setQrDataUrl("");
      return;
    }

    QRCode.toDataURL(activeTicket.tokenHash, {
      width: 256,
      margin: 1,
      color: { dark: "#171918", light: "#E9E2D3" },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("Error generating QR:", err));
  }, [activeTicket?.tokenHash]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return (
        new Date(dateStr).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="gold">PRESENSI & TIKET TOURING</Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
            Riwayat Presensi & Check-In Event
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Tunjukkan QR Code ini kepada Road Captain / Panitia saat berkumpul di titik kumpul start.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-charcoal border border-white/10 shrink-0 self-start sm:self-center">
          <Button
            size="sm"
            variant={activeTab === "tickets" ? "default" : "ghost"}
            onClick={() => setActiveTab("tickets")}
            className="text-xs font-semibold gap-1.5"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Tiket Check-In ({tickets.length})</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className="text-xs font-semibold gap-1.5"
          >
            <History className="h-3.5 w-3.5" />
            <span>Riwayat Kehadiran ({history.length})</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-asphalt/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-bone-muted tracking-wider">
                Touring Terdaftar
              </p>
              <p className="text-xl font-bold font-serif text-bone">
                {stats.totalRegistered} Kegiatan
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-charcoal border border-muted-gold/40 flex items-center justify-center text-muted-gold">
              <Calendar className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-asphalt/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-bone-muted tracking-wider">
                Kehadiran Tuntas
              </p>
              <p className="text-xl font-bold font-serif text-emerald-400">
                {stats.totalAttended} Kali Hadir
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-asphalt/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-bone-muted tracking-wider">
                Tingkat Kehadiran
              </p>
              <p className="text-xl font-bold font-serif text-muted-gold">
                {stats.attendanceRate}% On-Time
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-charcoal border border-muted-gold/40 flex items-center justify-center text-muted-gold">
              <Shield className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-gold mx-auto" />
          <p className="text-xs font-mono text-bone-muted">Memuat data tiket dan riwayat presensi...</p>
        </div>
      ) : activeTab === "tickets" ? (
        /* TAB 1: TIKET AKTIF & QR CHECK-IN */
        tickets.length === 0 ? (
          <Card className="border-dashed border-white/15 bg-asphalt/40 p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-charcoal border border-white/10 text-bone-muted">
              <Ticket className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-serif font-black uppercase text-bone">
              Belum Ada Tiket Touring Aktif
            </h2>
            <p className="text-xs text-bone-muted max-w-md mx-auto">
              Anda belum terdaftar pada agenda touring mendatang. Silakan daftarkan diri dan kendaraan
              Anda pada menu Agenda Event untuk mendapatkan tiket dan QR Check-in resmi.
            </p>
            <div className="pt-2">
              <Link href="/member/events">
                <Button variant="default" size="sm" className="gap-2 font-bold text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Jelajahi Agenda Event</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* If more than 1 ticket, show selector tabs */}
            {tickets.length > 1 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {tickets.map((t, idx) => (
                  <Button
                    key={t.registrationId}
                    size="sm"
                    variant={selectedTicketIndex === idx ? "default" : "outline"}
                    onClick={() => setSelectedTicketIndex(idx)}
                    className="text-xs font-medium"
                  >
                    <span>{t.eventTitle}</span>
                  </Button>
                ))}
              </div>
            )}

            {activeTicket && (
              <Card className="border-muted-gold/40 bg-asphalt/80 shadow-2xl p-6 sm:p-8 text-center space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant={activeTicket.isAttended ? "success" : "gold"}>
                      {activeTicket.isAttended ? "SUDAH CHECK-IN / HADIR" : "TIKET SAH & TERDAFTAR"}
                    </Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone">
                    {activeTicket.eventTitle}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-bone-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-gold" />
                      {formatDate(activeTicket.startTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-gold" />
                      Mulai: {formatTime(activeTicket.startTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-gold" />
                      {activeTicket.locationName || "Basecamp Brotherhood"}
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center">
                  <div className="rounded-xl border-2 border-muted-gold/60 bg-bone p-3 shadow-xl">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="QR Check-in Event"
                        className="h-44 w-44 object-contain"
                      />
                    ) : (
                      <div className="h-44 w-44 flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-charcoal animate-pulse" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-muted-gold mt-2 uppercase tracking-widest font-bold">
                    TOKEN: {activeTicket.tokenHash}
                  </p>
                </div>

                {/* Member & Event Verification Summary */}
                <div className="rounded-lg bg-charcoal p-4 text-left text-xs border border-white/5 space-y-2.5 max-w-md mx-auto">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-bone-muted">Nama Peserta</span>
                    <span className="font-bold text-bone">
                      {member?.fullName || "Anggota Brotherhood"} (
                      {member?.memberNumber || "BMC-MEMBER"})
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-bone-muted">Kendaraan</span>
                    <span className="text-bone">
                      {member?.motorcycleModel || "-"} ({member?.motorcyclePlate || "-"})
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-bone-muted">Status Iuran Event</span>
                    <span className="font-bold">
                      {activeTicket.eventFee === 0 ? (
                        <span className="text-emerald-400">Gratis (Khusus Member)</span>
                      ) : activeTicket.invoice?.status === "paid" ? (
                        <span className="text-emerald-400">
                          Lunas ({formatRupiah(activeTicket.eventFee)})
                        </span>
                      ) : activeTicket.invoice?.status === "submitted" ? (
                        <span className="text-amber-400">Menunggu Verifikasi</span>
                      ) : (
                        <span className="text-red-400">
                          Belum Lunas ({formatRupiah(activeTicket.eventFee)})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-bone-muted">Status Kehadiran</span>
                    <span className="font-bold">
                      {activeTicket.isAttended ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Hadir ({activeTicket.attendedAt ? formatTime(activeTicket.attendedAt) : "Terverifikasi"})
                        </span>
                      ) : (
                        <span className="text-muted-gold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Menunggu Check-In Panitia
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons if unpaid */}
                {activeTicket.eventFee > 0 && activeTicket.invoice?.status === "unpaid" && (
                  <div className="pt-2">
                    <Link href={`/member/payments/${activeTicket.invoice.id}`}>
                      <Button variant="gold" size="sm" className="gap-2 font-bold text-xs">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Selesaikan Pembayaran Tagihan</span>
                      </Button>
                    </Link>
                  </div>
                )}

                <p className="text-xs text-bone-muted max-w-md mx-auto">
                  Tunjukkan kode QR di atas kepada Road Captain atau panitia presensi di titik kumpul start. Panitia akan memindai QR ini untuk mencatat kehadiran resmi Anda.
                </p>
              </Card>
            )}
          </div>
        )
      ) : (
        /* TAB 2: RIWAYAT KEHADIRAN LAMPAU */
        <div className="space-y-4">
          {history.length === 0 ? (
            <Card className="border-dashed border-white/15 bg-asphalt/40 p-12 text-center space-y-3">
              <History className="h-10 w-10 text-bone-muted mx-auto" />
              <h3 className="font-serif font-bold text-lg text-bone">Belum Ada Riwayat Presensi</h3>
              <p className="text-xs text-bone-muted max-w-sm mx-auto">
                Riwayat kehadiran touring dan kopdar resmi yang pernah Anda ikuti akan tercatat di sini.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card
                  key={item.registrationId}
                  className="border-white/10 bg-asphalt/60 hover:border-muted-gold/30 transition-colors p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.isAttended ? (
                          <Badge variant="success" className="text-[10px]">
                            HADIR & TERVERIFIKASI
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            TERDAFTAR
                          </Badge>
                        )}
                        <span className="text-xs font-mono text-muted-gold">
                          {formatDate(item.startTime)}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-bone mt-1">
                        {item.eventTitle}
                      </h4>
                      <p className="text-xs text-bone-muted flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-gold" />
                        {item.locationName}
                      </p>
                    </div>

                    <div className="sm:text-right text-xs space-y-1 shrink-0">
                      <p className="text-bone-muted">Waktu Presensi</p>
                      <p className="font-mono font-bold text-bone">
                        {item.attendedAt ? formatTime(item.attendedAt) : item.isAttended ? "Terverifikasi" : "-"}
                      </p>
                      <p className="text-[10px] text-bone-muted">
                        Metode: {item.checkinMethod === "qr_scan" ? "QR Scanner" : item.checkinMethod || "Presensi Panitia"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
