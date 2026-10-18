"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Filter,
  Receipt,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  History,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/utils";

interface PendingPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  eventName: string;
  amount: number;
  bankName: string;
  accountName: string;
  proofUrl: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface FinanceAccount {
  id: string;
  name: string;
  account_number?: string | null;
  is_active: boolean;
}

export default function AdminFinancePage() {
  const [payments, setPayments] = React.useState<PendingPayment[]>([]);
  const [accounts, setAccounts] = React.useState<FinanceAccount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals
  const [previewPayment, setPreviewPayment] = React.useState<PendingPayment | null>(null);
  const [rejectingPayment, setRejectingPayment] = React.useState<PendingPayment | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [approvingPayment, setApprovingPayment] = React.useState<PendingPayment | null>(null);
  const [selectedAccount, setSelectedAccount] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [notification, setNotification] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch data from backend
  const loadFinanceData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/finance");
      const json = await res.json();

      if (json.success && json.data) {
        setPayments(json.data.payments || []);
        setAccounts(json.data.accounts || []);
        if (json.data.accounts && json.data.accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(json.data.accounts[0].id);
        }
      } else {
        setNotification({
          type: "error",
          message: json.message || "Gagal memuat data kas & verifikasi pembayaran.",
        });
      }
    } catch (err: unknown) {
      console.error("Fetch finance error:", err);
      setNotification({
        type: "error",
        message: "Gagal menghubungkan ke server keuangan.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  React.useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  // Ensure default selected account when accounts load
  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const filteredPayments = payments.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.memberName.toLowerCase().includes(q) ||
        item.memberNumber.toLowerCase().includes(q) ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.eventName.toLowerCase().includes(q) ||
        item.bankName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const approvedCount = payments.filter((p) => p.status === "approved").length;
  const rejectedCount = payments.filter((p) => p.status === "rejected").length;

  const handleApprove = async () => {
    if (!approvingPayment) return;
    if (!selectedAccount) {
      setNotification({ type: "error", message: "Pilih rekening tujuan kas terlebih dahulu." });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          paymentId: approvingPayment.id,
          accountId: selectedAccount,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setNotification({ type: "success", message: json.message });
        setApprovingPayment(null);
        if (previewPayment?.id === approvingPayment.id) setPreviewPayment(null);
        window.dispatchEvent(new Event("finance-status-changed"));
        await loadFinanceData();
      } else {
        setNotification({ type: "error", message: json.message || "Gagal menyetujui pembayaran." });
      }
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat memproses persetujuan: " + (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingPayment) return;
    if (!rejectReason || rejectReason.trim().length < 5) {
      setNotification({ type: "error", message: "Masukkan alasan penolakan minimal 5 karakter." });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          paymentId: rejectingPayment.id,
          reason: rejectReason,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setNotification({ type: "success", message: json.message });
        setRejectingPayment(null);
        setRejectReason("");
        if (previewPayment?.id === rejectingPayment.id) setPreviewPayment(null);
        window.dispatchEvent(new Event("finance-status-changed"));
        await loadFinanceData();
      } else {
        setNotification({ type: "error", message: json.message || "Gagal menolak pembayaran." });
      }
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat menolak pembayaran: " + (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">MANAJEMEN KAS & BENDAHARA</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Verifikasi Pembayaran & Buku Kas
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Verifikasi manual transfer bank anggota dan pencatatan buku kas secara atomik real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadFinanceData}
            disabled={isLoading}
            className="text-xs gap-1.5 text-bone-muted hover:text-bone"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </Button>

          <Link href="/admin/finance/transactions">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-white/15 hover:border-muted-gold">
              <Receipt className="h-3.5 w-3.5 text-muted-gold" />
              <span>Buku Kas & Transaksi</span>
            </Button>
          </Link>
          <Link href="/admin/finance/reports">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-white/15 hover:border-muted-gold">
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-gold" />
              <span>Laporan Event</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        <Link
          href="/admin/finance"
          className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-muted-gold text-charcoal shadow flex items-center gap-1.5"
        >
          <span>Verifikasi Pembayaran</span>
          <span className="px-1.5 py-0.2 rounded-full bg-charcoal text-muted-gold text-[10px] font-mono">
            {pendingCount}
          </span>
        </Link>
        <Link
          href="/admin/finance/transactions"
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-bone-muted hover:text-bone hover:bg-white/5"
        >
          Buku Kas (Ledger)
        </Link>
        <Link
          href="/admin/finance/reports"
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-bone-muted hover:text-bone hover:bg-white/5 whitespace-nowrap"
        >
          Laporan Keuangan Event
        </Link>
        <Link
          href="/admin/finance/logs"
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-bone-muted hover:text-bone hover:bg-white/5 whitespace-nowrap flex items-center gap-1.5"
        >
          <History className="h-3.5 w-3.5 text-muted-gold" />
          <span>Log Riwayat Aktivitas</span>
        </Link>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-lg border text-xs shadow-lg animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/80 border-red-500/40 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-bone-muted hover:text-bone text-xs underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari anggota, nomor KTA, invoice, bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs sm:w-72 bg-asphalt border-white/10"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-bone-muted mr-1 shrink-0" />
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "pending"
                ? "bg-muted-gold text-charcoal font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Menunggu ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "approved"
                ? "bg-muted-gold text-charcoal font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Lunas / Disetujui ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "rejected"
                ? "bg-muted-gold text-charcoal font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Ditolak ({rejectedCount})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-muted-gold text-charcoal font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Semua ({payments.length})
          </button>
        </div>
      </div>

      {/* Payment Queue List */}
      <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Antrean Verifikasi Bukti Transfer Manual</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-gold" />}
          </CardTitle>
          <span className="text-xs text-bone-muted">
            Total {filteredPayments.length} Pembayaran Ditampilkan
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-bone-muted text-xs gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-muted-gold" />
              <span>Menghubungkan ke database kas dan memuat antrean pembayaran...</span>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-bone-muted text-xs">
              Tidak ada data pembayaran yang sesuai dengan kriteria filter saat ini.
            </div>
          ) : (
            filteredPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-lg bg-charcoal border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:border-white/10"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-bone text-sm">{p.memberName}</span>
                    <Badge variant="gold" className="text-[10px] font-mono">
                      {p.memberNumber}
                    </Badge>
                    <span className="text-xs font-mono text-muted-gold">{p.invoiceNumber}</span>
                    {p.status === "pending" && (
                      <Badge variant="gold" className="text-[10px] animate-pulse">
                        MENUNGGU VERIFIKASI
                      </Badge>
                    )}
                    {p.status === "approved" && (
                      <Badge variant="success" className="text-[10px]">
                        LUNAS & TERCATAT DI KAS
                      </Badge>
                    )}
                    {p.status === "rejected" && (
                      <Badge variant="destructive" className="text-[10px]">
                        DITOLAK
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-bone-muted">
                    Event: <strong className="text-bone">{p.eventName}</strong> &bull; Nominal:{" "}
                    <strong className="text-muted-gold font-mono text-sm">{formatRupiah(p.amount)}</strong>
                  </p>

                  <p className="text-[11px] text-bone-muted">
                    Pengirim: <strong className="text-bone">{p.bankName}</strong> a.n.{" "}
                    <strong className="text-bone">{p.accountName}</strong> &bull; Waktu: {p.submittedAt}
                  </p>

                  {p.rejectionReason && (
                    <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-500/20">
                      <strong>Alasan Penolakan:</strong> {p.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1 border-white/10 hover:border-muted-gold"
                    onClick={() => setPreviewPayment(p)}
                  >
                    <Eye className="h-3.5 w-3.5 text-muted-gold" />
                    <span>Lihat Bukti Struk</span>
                  </Button>

                  {p.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                        onClick={() => setApprovingPayment(p)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Setujui</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs gap-1"
                        onClick={() => setRejectingPayment(p)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Tolak</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* MODAL: VIEW PROOF / STRUK */}
      {previewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif font-black uppercase text-base text-bone">
                  Bukti Pembayaran Transfer
                </h3>
                <span className="font-mono text-xs text-muted-gold">
                  {previewPayment.invoiceNumber}
                </span>
              </div>
              <button
                onClick={() => setPreviewPayment(null)}
                className="text-bone-muted hover:text-bone text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-charcoal p-2 flex flex-col items-center justify-center">
                {previewPayment.proofUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewPayment.proofUrl}
                    alt="Bukti Transfer"
                    className="max-h-80 w-auto rounded object-contain shadow-inner"
                  />
                ) : (
                  <div className="py-12 text-center text-xs text-bone-muted">
                    Tidak ada gambar bukti struk terlampir.
                  </div>
                )}
                {previewPayment.proofUrl && (
                  <a
                    href={previewPayment.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-[11px] text-muted-gold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Buka Gambar Asli Resolusi Penuh</span>
                  </a>
                )}
              </div>

              <div className="p-3 bg-charcoal rounded-lg border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-bone-muted">Nama Anggota:</span>
                  <span className="font-bold text-bone">
                    {previewPayment.memberName} ({previewPayment.memberNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-muted">Event:</span>
                  <span className="font-bold text-bone">{previewPayment.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-muted">Bank Pengirim:</span>
                  <span className="font-bold text-bone">{previewPayment.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-muted">Atas Nama:</span>
                  <span className="font-bold text-bone">{previewPayment.accountName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-bone-muted">Nominal:</span>
                  <span className="font-mono font-bold text-sm text-muted-gold">
                    {formatRupiah(previewPayment.amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewPayment(null)}
                className="text-xs"
              >
                Tutup
              </Button>
              {previewPayment.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setRejectingPayment(previewPayment);
                    }}
                  >
                    Tolak
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => {
                      setApprovingPayment(previewPayment);
                    }}
                  >
                    Setujui & Bukukan Kas
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE PAYMENT */}
      {approvingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-muted-gold/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Badge variant="gold">VERIFIKASI & BUKUKAN KAS</Badge>
              <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                Persetujuan Pembayaran
              </h3>
              <p className="text-xs text-bone-muted mt-0.5">
                Konfirmasi bahwa dana telah masuk mutasi bank. Entri kas masuk akan dibukukan secara atomik ke buku kas organisasi.
              </p>
            </div>

            <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-bone-muted">Anggota:</span>
                <span className="font-bold text-bone">{approvingPayment.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Nominal:</span>
                <span className="font-mono font-bold text-muted-gold">
                  {formatRupiah(approvingPayment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Invoice:</span>
                <span className="font-mono text-bone">{approvingPayment.invoiceNumber}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accountDestination" className="text-xs flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-gold" />
                <span>Tujuan Rekening Kas Komunitas *</span>
              </Label>
              <select
                id="accountDestination"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
              >
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} {acc.account_number ? `(${acc.account_number})` : ""}
                    </option>
                  ))
                ) : (
                  <option value="">Memuat rekening kas...</option>
                )}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => setApprovingPayment(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isProcessing}
                onClick={handleApprove}
                className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Konfirmasi & Bukukan Kas</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT PAYMENT */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-red-500/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Badge variant="destructive">TOLAK PEMBAYARAN</Badge>
              <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                Alasan Penolakan Pembayaran
              </h3>
              <p className="text-xs text-bone-muted mt-0.5">
                Alasan ini akan disimpan di sistem dan diteruskan kepada anggota untuk perbaikan struk atau transfer ulang.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rejectReason" className="text-xs">
                Catatan / Alasan Penolakan *
              </Label>
              <Textarea
                id="rejectReason"
                rows={3}
                placeholder="Contoh: Nominal transfer tidak sesuai tagihan (kurang Rp 50.000) atau foto struk buram/terpotong."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="text-xs bg-charcoal border-white/10"
              />
              <p className="text-[10px] text-bone-muted">Minimal 5 karakter.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => {
                  setRejectingPayment(null);
                  setRejectReason("");
                }}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isProcessing}
                onClick={handleReject}
                className="text-xs font-bold gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Tolak Pembayaran</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
