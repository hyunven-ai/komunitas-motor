"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Ticket,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface MemberEventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string | null;
  locationName: string;
  locationAddress?: string | null;
  mapLink?: string | null;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  capacity: number;
  fee: number;
  registeredCount: number;
  isRegistered: boolean;
  registrationId?: string;
  registrationStatus?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceStatus?: "unpaid" | "submitted" | "paid" | "rejected";
  invoiceAmount?: number;
  isPastDeadline: boolean;
  isFull: boolean;
}

function cleanDescription(desc?: string): string {
  if (!desc) return "";
  return desc.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return "-";
  try {
    const s = new Date(start);
    const dateStr = s.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeStr = s.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return `${dateStr} (${timeStr} WIB)`;
  } catch {
    return start;
  }
}

export default function MemberEventsPage() {
  const [events, setEvents] = React.useState<MemberEventItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [registeringId, setRegisteringId] = React.useState<string | null>(null);
  const [confirmEvent, setConfirmEvent] = React.useState<MemberEventItem | null>(null);
  const [notes, setNotes] = React.useState<string>("");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchEvents = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/member/events", {
        headers,
        cache: "no-store",
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat event:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = async () => {
    if (!confirmEvent) return;
    setRegisteringId(confirmEvent.id);
    setFeedback(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/member/events", {
        method: "POST",
        headers,
        body: JSON.stringify({
          eventId: confirmEvent.id,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", message: json.message });
        setConfirmEvent(null);
        setNotes("");
        await fetchEvents();
      } else {
        setFeedback({ type: "error", message: json.message || "Gagal mendaftar event." });
      }
    } catch (err) {
      console.error("Register event error:", err);
      setFeedback({ type: "error", message: "Terjadi kesalahan jaringan saat mendaftar event." });
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <Badge variant="gold">PORTAL EVENT</Badge>
        <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
          Agenda Touring & Pendaftaran
        </h1>
        <p className="text-xs text-bone-muted mt-0.5">
          Daftarkan motor dan diri Anda untuk kegiatan touring & kopi darat resmi komunitas.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-lg border text-xs shadow-md ${
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
              : "border-red-500/40 bg-red-950/60 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3">
          <Loader2 className="h-8 w-8 text-muted-gold animate-spin" />
          <p className="text-xs text-bone-muted">Memuat agenda touring terbaru dari server...</p>
        </div>
      ) : events.length === 0 ? (
        <Card className="border-white/10 bg-asphalt/40 p-12 text-center space-y-3">
          <Calendar className="h-10 w-10 text-bone-muted mx-auto opacity-40" />
          <h3 className="text-base font-bold text-bone">Belum Ada Agenda Event Terbuka</h3>
          <p className="text-xs text-bone-muted max-w-md mx-auto">
            Pengurus belum mempublikasikan agenda touring baru saat ini. Silakan pantau berkala untuk pengumuman jadwal touring mendatang.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const desc = cleanDescription(event.description);

            return (
              <Card
                key={event.id}
                className={`transition-all ${
                  event.isRegistered
                    ? "border-muted-gold/40 bg-asphalt/80 shadow-md shadow-muted-gold/5"
                    : "border-white/10 bg-asphalt/60 hover:border-white/20"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 flex-1">
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {event.isRegistered ? (
                          event.fee === 0 || event.invoiceStatus === "paid" ? (
                            <>
                              <Badge variant="gold" className="text-[10px]">
                                {event.fee === 0 ? "TERDAFTAR (GRATIS)" : "TERDAFTAR & LUNAS"}
                              </Badge>
                              {event.invoiceNumber && (
                                <span className="text-xs font-mono text-emerald-400 font-bold">
                                  #{event.invoiceNumber}
                                </span>
                              )}
                            </>
                          ) : event.invoiceStatus === "submitted" ? (
                            <>
                              <Badge
                                variant="outline"
                                className="text-[10px] text-amber-400 border-amber-500/40 bg-amber-950/20"
                              >
                                MENUNGGU VERIFIKASI PEMBAYARAN
                              </Badge>
                              {event.invoiceNumber && (
                                <span className="text-xs font-mono text-amber-400 font-bold">
                                  #{event.invoiceNumber}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Badge
                                variant="destructive"
                                className="text-[10px] bg-red-950/60 text-red-300 border-red-500/30"
                              >
                                BELUM DIBAYAR
                              </Badge>
                              {event.invoiceNumber && (
                                <span className="text-xs font-mono text-red-400 font-bold">
                                  #{event.invoiceNumber}
                                </span>
                              )}
                            </>
                          )
                        ) : event.isPastDeadline ? (
                          <Badge variant="secondary" className="text-[10px]">
                            PENDAFTARAN DITUTUP
                          </Badge>
                        ) : event.isFull ? (
                          <Badge variant="destructive" className="text-[10px]">
                            KUOTA PENUH
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] text-emerald-400 border-emerald-500/30">
                            PENDAFTARAN DIBUKA
                          </Badge>
                        )}

                        <span className="text-xs font-mono text-muted-gold">
                          {event.fee === 0 ? "Gratis Khusus Member" : formatRupiah(event.fee)}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-xl font-serif font-bold text-bone">{event.title}</h3>

                      {/* Description */}
                      {desc && (
                        <p className="text-xs text-bone-muted line-clamp-2 max-w-3xl leading-relaxed">
                          {desc}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div className="flex flex-wrap gap-y-2 gap-x-5 text-xs text-bone-muted pt-1">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Calendar className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span>{formatDateRange(event.startTime, event.endTime)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span>{event.locationName}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-mono">
                          <Users className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span>
                            {event.registeredCount} / {event.capacity || "∞"} rider terdaftar
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {event.isRegistered ? (
                        event.fee === 0 || event.invoiceStatus === "paid" ? (
                          <Link href={`/member/attendance?eventId=${event.id}`}>
                            <Button variant="gold" size="sm" className="font-bold text-xs gap-1.5 shadow-md">
                              <Ticket className="h-3.5 w-3.5" />
                              <span>Lihat Tiket & QR Check-In</span>
                            </Button>
                          </Link>
                        ) : event.invoiceStatus === "submitted" ? (
                          <Link href="/member/payments">
                            <Button variant="outline" size="sm" className="text-xs gap-1.5 text-amber-400 border-amber-500/30">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Cek Status Invoice</span>
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/member/payments/${event.invoiceId}`}>
                            <Button variant="gold" size="sm" className="font-bold text-xs gap-1.5">
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Bayar Tagihan ({formatRupiah(event.fee)})</span>
                            </Button>
                          </Link>
                        )
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={event.isPastDeadline || event.isFull || registeringId === event.id}
                          onClick={() => setConfirmEvent(event)}
                          className="text-xs font-bold gap-1.5 border-muted-gold/40 hover:border-muted-gold hover:text-muted-gold"
                        >
                          <span>Daftar Sekarang</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL KONFIRMASI PENDAFTARAN */}
      {confirmEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-muted-gold/40 bg-asphalt p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">KONFIRMASI PENDAFTARAN EVENT</Badge>
                <h3 className="text-lg font-serif font-black uppercase text-bone mt-1">
                  {confirmEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setConfirmEvent(null)}
                className="text-bone-muted hover:text-bone text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-charcoal rounded-lg border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-bone-muted">Waktu Pelaksanaan:</span>
                <span className="font-mono text-bone">{formatDateRange(confirmEvent.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Titik Kumpul / Lokasi:</span>
                <span className="text-bone font-medium">{confirmEvent.locationName}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2">
                <span className="text-bone-muted">Biaya / Iuran Partisipasi:</span>
                <span className="font-mono font-bold text-muted-gold text-sm">
                  {confirmEvent.fee === 0 ? "Gratis Khusus Member" : formatRupiah(confirmEvent.fee)}
                </span>
              </div>
            </div>

            {confirmEvent.fee > 0 && (
              <p className="text-[11px] text-bone-muted leading-relaxed">
                Catatan: Setelah konfirmasi pendaftaran, sistem akan otomatis menerbitkan invoice tagihan yang dapat dibayar melalui menu <strong>Invoice & Iuran</strong>.
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={!!registeringId}
                onClick={() => setConfirmEvent(null)}
              >
                Batal
              </Button>
              <Button
                variant="gold"
                size="sm"
                disabled={!!registeringId}
                onClick={handleRegister}
                className="font-bold gap-1.5"
              >
                {registeringId ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <span>Konfirmasi Pendaftaran</span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
