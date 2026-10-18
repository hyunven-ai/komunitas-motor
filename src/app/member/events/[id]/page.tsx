import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Phone,
  FileCheck,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

export const metadata = {
  title: "Detail Keikutsertaan Event — Portal Member",
};

export default async function MemberEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adminSupabase = createAdminClient();
  const supabase = await createServerSupabase();

  // 1. Fetch Event
  const { data: event, error: eventErr } = await adminSupabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (eventErr || !event) {
    notFound();
  }

  // 2. Fetch User & Member
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let member = null;
  let registration = null;
  let invoice = null;

  if (user) {
    const { data: memData } = await adminSupabase
      .from("members")
      .select("id, full_name, member_number")
      .eq("user_id", user.id)
      .maybeSingle();

    member = memData;

    if (member) {
      // Check registration
      const { data: regData } = await adminSupabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", id)
        .eq("member_id", member.id)
        .maybeSingle();

      registration = regData;

      // Check invoice
      const { data: invData } = await adminSupabase
        .from("event_invoices")
        .select("*")
        .eq("event_id", id)
        .eq("member_id", member.id)
        .maybeSingle();

      invoice = invData;
    }
  }

  const isFree = !event.fee || event.fee === 0;
  const isRegistered = !!registration;
  const isPaid = isFree || invoice?.status === "paid";
  const isSubmitted = invoice?.status === "submitted";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/member/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-bone-muted hover:text-muted-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Agenda Event Saya</span>
        </Link>
      </div>

      {/* Main Status Header */}
      <Card className="border-muted-gold/40 bg-asphalt/80 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isRegistered ? (
                <Badge variant={isPaid ? "success" : isSubmitted ? "warning" : "gold"}>
                  {isPaid
                    ? "TERDAFTAR & LUNAS"
                    : isSubmitted
                    ? "MENUNGGU VERIFIKASI"
                    : "BELUM DIBAYAR"}
                </Badge>
              ) : (
                <Badge variant="outline">BELUM TERDAFTAR</Badge>
              )}
              <span className="text-xs font-mono text-muted-gold">
                {event.category?.toUpperCase() || "TOURING"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone">
              {event.title}
            </h1>
            <p className="text-xs text-bone-muted">
              {formatDate(event.start_time)}
              {event.end_time && ` s/d ${formatDate(event.end_time)}`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {isRegistered ? (
              <Link href="/member/attendance">
                <Button size="sm" variant="default" className="text-xs font-bold gap-2">
                  <QrCode className="h-4 w-4" />
                  <span>Buka Tiket Presensi QR</span>
                </Button>
              </Link>
            ) : (
              <Link href="/member/events">
                <Button size="sm" variant="gold" className="text-xs font-bold">
                  Daftar Sekarang di Agenda
                </Button>
              </Link>
            )}

            {!isPaid && invoice && (
              <Link href={`/member/payments/${invoice.id}`}>
                <Button size="sm" variant="secondary" className="text-xs font-bold gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Bayar Tagihan</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-bone-muted">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-bone-muted">Status Pembayaran</span>
            <p
              className={`font-bold flex items-center gap-1.5 ${
                isPaid ? "text-emerald-400" : isSubmitted ? "text-amber-400" : "text-bone"
              }`}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Lunas {isFree ? "(Gratis)" : `(${formatRupiah(event.fee)})`}
                </>
              ) : isSubmitted ? (
                <>
                  <Clock className="h-3.5 w-3.5" /> Menunggu Verifikasi
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  Belum Dibayar ({formatRupiah(event.fee)})
                </>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase text-bone-muted">Nomor Invoice</span>
            <p className="font-mono font-bold text-muted-gold">
              {invoice?.invoice_number ? `#${invoice.invoice_number}` : isFree ? "GRATIS" : "-"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase text-bone-muted">Lokasi / Titik Kumpul</span>
            <p className="font-bold text-bone flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-gold shrink-0" />
              <span>{event.location_name || "Basecamp Brotherhood"}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Itinerary & Meeting Point */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-gold" />
              <span>Deskripsi & Instruksi Kegiatan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-bone-muted">
            <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
              <p className="font-semibold text-bone">Deskripsi Acara</p>
              <div
                className="text-[11px] leading-relaxed text-bone-muted prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: event.description || "<p>Tidak ada rincian tambahan.</p>",
                }}
              />
            </div>
            <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
              <p className="font-semibold text-bone">Kelayakan BBM & Kendaraan</p>
              <p className="text-[11px]">
                Wajib tiba di meeting point dengan tangki bahan bakar terisi penuh (Full Tank) dan
                kondisi ban serta rem optimal.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-gold" />
              <span>Kontak Petugas Touring (Road Captain)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-bone-muted">
            <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
              <p className="font-semibold text-bone">Sekretariat Brotherhood</p>
              <p className="text-muted-gold font-mono">+62 812-3344-5566</p>
              <p className="text-[10px]">Pusat koordinasi dan informasi resmi kegiatan</p>
            </div>
            <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
              <p className="font-semibold text-bone">Tim Safety Officer & Sweeper</p>
              <p className="text-muted-gold font-mono">+62 813-7788-9900</p>
              <p className="text-[10px]">Sweeper penutup barisan & bantuan teknis darurat</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
