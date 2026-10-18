"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Copy,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  eventId: string;
  eventName: string;
  eventLocation?: string;
  eventStartTime?: string | null;
  amount: number;
  status: "unpaid" | "submitted" | "paid" | "rejected";
  dueDate: string;
  createdAt: string;
  payments?: any[];
  latestPayment?: any;
}

interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export default function MemberPaymentsPage() {
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [bankAccounts, setBankAccounts] = React.useState<{
    bca: BankAccountInfo;
    mandiri: BankAccountInfo;
  }>({
    bca: {
      bankName: "BANK CENTRAL ASIA (BCA)",
      accountNumber: "8839-0192-81",
      accountHolder: "Brotherhood Motorcycle Community",
    },
    mandiri: {
      bankName: "BANK MANDIRI",
      accountNumber: "133-00-29381-00",
      accountHolder: "Brotherhood Community Kas",
    },
  });
  const [loading, setLoading] = React.useState<boolean>(true);
  const [copiedBank, setCopiedBank] = React.useState<string | null>(null);

  const fetchInvoices = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/member/invoices", {
        headers,
        cache: "no-store",
      });

      const json = await res.json();
      if (json.success && json.data) {
        setInvoices(json.data.invoices || []);
        if (json.data.bankAccounts) {
          setBankAccounts(json.data.bankAccounts);
        }
      }
    } catch (err) {
      console.error("Gagal memuat invoice:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCopy = (bank: string, number: string) => {
    const cleanNum = number.replace(/[^0-9]/g, "");
    navigator.clipboard.writeText(cleanNum);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const getStatusBadge = (status: InvoiceItem["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="success" className="text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>LUNAS</span>
          </Badge>
        );
      case "submitted":
        return (
          <Badge
            variant="outline"
            className="text-[10px] text-amber-400 border-amber-500/40 bg-amber-950/20 gap-1"
          >
            <Clock className="h-3 w-3" />
            <span>MENUNGGU VERIFIKASI</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="text-[10px] gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>BUKTI DITOLAK</span>
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] text-red-400 border-red-500/40 bg-red-950/20"
          >
            MENUNGGU PEMBAYARAN
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <Badge variant="gold">KEUANGAN & IURAN</Badge>
        <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
          Invoice & Riwayat Pembayaran Event
        </h1>
        <p className="text-xs text-bone-muted mt-0.5">
          Komunitas tidak memungut iuran bulanan wajib. Seluruh pembayaran terkait partisipasi dalam agenda touring tertentu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Invoices List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-white/10 bg-asphalt/60">
            <CardHeader>
              <CardTitle className="text-lg">Daftar Tagihan & Bukti Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-14 space-y-3">
                  <Loader2 className="h-8 w-8 text-muted-gold animate-spin" />
                  <p className="text-xs text-bone-muted">Memuat daftar tagihan event Anda...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <Receipt className="h-10 w-10 text-bone-muted mx-auto opacity-40" />
                  <h4 className="text-sm font-bold text-bone">Belum Ada Tagihan Event Aktif</h4>
                  <p className="text-xs text-bone-muted max-w-md mx-auto leading-relaxed">
                    Tagihan iuran touring akan otomatis terbit di halaman ini saat Anda mendaftar event berbayar pada menu <strong>Agenda Event</strong>.
                  </p>
                  <div className="pt-2">
                    <Link href="/member/events">
                      <Button variant="outline" size="sm" className="text-xs gap-1.5 border-muted-gold/40 text-muted-gold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Lihat Agenda Event</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className={`p-4 rounded-lg border transition-all ${
                      inv.status === "unpaid"
                        ? "bg-charcoal border-muted-gold/40 shadow-sm shadow-muted-gold/5"
                        : "bg-charcoal/80 border-white/5"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-muted-gold text-xs">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[11px] text-bone-muted">&bull; Jatuh Tempo: {inv.dueDate}</span>
                      </div>
                      {getStatusBadge(inv.status)}
                    </div>

                    <div className="pt-3 pb-2">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-bone">
                        {inv.eventName}
                      </h4>
                      {inv.eventLocation && (
                        <p className="text-xs text-bone-muted mt-0.5">Lokasi: {inv.eventLocation}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
                      <div>
                        <span className="text-[10px] uppercase text-bone-muted block">Jumlah Tagihan</span>
                        <span className="text-base font-mono font-bold text-muted-gold">
                          {formatRupiah(inv.amount)}
                        </span>
                      </div>

                      <div>
                        {inv.status === "unpaid" ? (
                          <Link href={`/member/payments/${inv.id}`}>
                            <Button size="sm" variant="gold" className="text-xs font-bold gap-1 shadow-md">
                              <span>Bayar / Unggah Bukti</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        ) : inv.status === "submitted" ? (
                          <span className="text-xs font-mono text-amber-400 font-medium">
                            Menunggu Verifikasi Bendahara
                          </span>
                        ) : (
                          <Badge variant="success" className="text-xs">
                            Terverifikasi Lunas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Official Community Bank Accounts */}
        <div className="space-y-4">
          <Card className="border-white/10 bg-asphalt/60">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-2 text-muted-gold">
                <Building2 className="h-4 w-4" />
                <span>Rekening Resmi Komunitas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              {/* BCA Account */}
              <div className="p-3.5 bg-charcoal rounded-md border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase text-muted-gold font-mono font-bold">
                    {bankAccounts.bca.bankName}
                  </p>
                  <button
                    onClick={() => handleCopy("BCA", bankAccounts.bca.accountNumber)}
                    className="text-[11px] text-bone-muted hover:text-muted-gold flex items-center gap-1 font-mono"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedBank === "BCA" ? "Tersalin!" : "Salin"}</span>
                  </button>
                </div>
                <p className="font-mono font-bold text-muted-gold text-lg">
                  {bankAccounts.bca.accountNumber}
                </p>
                <p className="text-bone font-medium text-xs">
                  a.n. {bankAccounts.bca.accountHolder}
                </p>
              </div>

              {/* Mandiri Account */}
              <div className="p-3.5 bg-charcoal rounded-md border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase text-muted-gold font-mono font-bold">
                    {bankAccounts.mandiri.bankName}
                  </p>
                  <button
                    onClick={() => handleCopy("MANDIRI", bankAccounts.mandiri.accountNumber)}
                    className="text-[11px] text-bone-muted hover:text-muted-gold flex items-center gap-1 font-mono"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedBank === "MANDIRI" ? "Tersalin!" : "Salin"}</span>
                  </button>
                </div>
                <p className="font-mono font-bold text-muted-gold text-lg">
                  {bankAccounts.mandiri.accountNumber}
                </p>
                <p className="text-bone font-medium text-xs">
                  a.n. {bankAccounts.mandiri.accountHolder}
                </p>
              </div>

              <div className="p-3 bg-charcoal/60 rounded-md border border-white/5 space-y-1 text-bone-muted text-[11px]">
                <p className="font-bold text-bone">Instruksi Pembayaran:</p>
                <p className="leading-relaxed">
                  1. Lakukan transfer sesuai nominal tagihan yang tertera.
                  <br />
                  2. Simpan struk fisik atau tangkapan layar m-banking.
                  <br />
                  3. Klik tombol &ldquo;Bayar / Unggah Bukti&rdquo; pada invoice dan unggah bukti transfer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
