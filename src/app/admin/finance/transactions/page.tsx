"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Download,
  Filter,
  CheckCircle2,
  Building2,
  CreditCard,
  Loader2,
  RefreshCw,
  Coins,
  Pencil,
  Trash2,
  History,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/utils";
import { manualTransactionSchema, type ManualTransactionInput } from "@/features/finance/schemas";

interface TransactionEntry {
  id: string;
  type: "income" | "expense";
  accountId: string;
  accountName: string;
  category: string;
  description: string;
  referenceNumber?: string;
  amount: number;
  date: string;
  rawDate?: string;
  isFromPayment?: boolean;
  paymentId?: string;
}

interface FinanceAccount {
  id: string;
  name: string;
  account_number?: string | null;
  accountHolder?: string | null;
  is_active: boolean;
}

interface AccountBalance {
  id: string;
  name: string;
  accountNumber?: string | null;
  accountHolder?: string | null;
  balance: number;
  income: number;
  expense: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  accountBalances: AccountBalance[];
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = React.useState<TransactionEntry[]>([]);
  const [accounts, setAccounts] = React.useState<FinanceAccount[]>([]);
  const [summary, setSummary] = React.useState<SummaryData>({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    accountBalances: [],
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<TransactionEntry | null>(null);
  const [deletingTransaction, setDeletingTransaction] = React.useState<TransactionEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Notifications
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form for Add
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    setValue: setValueAdd,
    formState: { errors: errorsAdd },
  } = useForm<ManualTransactionInput>({
    resolver: zodResolver(manualTransactionSchema),
    defaultValues: {
      type: "expense",
      accountId: "",
      category: "Logistik & Akomodasi",
      amount: 150000,
      description: "",
      referenceNumber: "",
    },
  });

  // Form for Edit
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = useForm<ManualTransactionInput>({
    resolver: zodResolver(manualTransactionSchema),
  });

  const loadTransactionsData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/finance/transactions");
      const json = await res.json();

      if (json.success && json.data) {
        setTransactions(json.data.transactions || []);
        setAccounts(json.data.accounts || []);
        if (json.data.summary) {
          setSummary(json.data.summary);
        }
        if (json.data.accounts && json.data.accounts.length > 0) {
          setValueAdd("accountId", json.data.accounts[0].id);
        }
      } else {
        setErrorMessage(json.message || "Gagal memuat daftar buku kas.");
      }
    } catch (err: unknown) {
      console.error("Fetch transactions error:", err);
      setErrorMessage("Gagal menghubungkan ke server kas & transaksi.");
    } finally {
      setIsLoading(false);
    }
  }, [setValueAdd]);

  React.useEffect(() => {
    loadTransactionsData();
  }, [loadTransactionsData]);

  const filtered = transactions.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.accountName.toLowerCase().includes(q) ||
        (t.referenceNumber && t.referenceNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Submit Add
  const onSubmitTransaction = async (data: ManualTransactionInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage("Transaksi kas berhasil dicatat di buku kas!");
        setShowAddModal(false);
        resetAdd({
          type: "expense",
          accountId: accounts.length > 0 ? accounts[0].id : "",
          category: "Logistik & Akomodasi",
          amount: 150000,
          description: "",
          referenceNumber: "",
        });
        await loadTransactionsData();
        window.dispatchEvent(new Event("finance-status-changed"));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(json.message || "Gagal menyimpan transaksi.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        "Terjadi kesalahan saat menyimpan transaksi: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleStartEdit = (t: TransactionEntry) => {
    setEditingTransaction(t);
    setValueEdit("type", t.type);
    setValueEdit("accountId", t.accountId);
    setValueEdit("category", t.category);
    setValueEdit("amount", t.amount);
    setValueEdit("description", t.description);
    setValueEdit("referenceNumber", t.referenceNumber || "");
  };

  // Submit Edit
  const onSubmitEdit = async (data: ManualTransactionInput) => {
    if (!editingTransaction) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/finance/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTransaction.id,
          ...data,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage("Transaksi kas berhasil diperbarui!");
        setEditingTransaction(null);
        await loadTransactionsData();
        window.dispatchEvent(new Event("finance-status-changed"));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(json.message || "Gagal mengubah transaksi.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        "Terjadi kesalahan saat memperbarui transaksi: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/admin/finance/transactions?id=${deletingTransaction.id}`,
        { method: "DELETE" }
      );

      const json = await res.json();

      if (json.success) {
        setSuccessMessage("Transaksi kas berhasil dihapus dari buku kas!");
        setDeletingTransaction(null);
        await loadTransactionsData();
        window.dispatchEvent(new Event("finance-status-changed"));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(json.message || "Gagal menghapus transaksi.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        "Terjadi kesalahan saat menghapus transaksi: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Tanggal",
      "Tipe",
      "Rekening Kas",
      "Kategori",
      "Deskripsi",
      "Referensi / Nota",
      "Nominal (IDR)",
    ];
    const rows = filtered.map((t) => [
      t.id,
      t.date,
      t.type === "income" ? "KAS MASUK" : "KAS KELUAR",
      `"${t.accountName}"`,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.referenceNumber || "-"}"`,
      t.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `buku_kas_brotherhood_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">BUKU KAS & TRANSAKSI</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Buku Kas Umum Komunitas
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Pencatatan real-time seluruh arus kas masuk dan kas keluar organisasi secara transparan dan akuntabel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadTransactionsData}
            disabled={isLoading}
            className="text-xs gap-1.5 text-bone-muted hover:text-bone"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 border-white/15 hover:border-muted-gold"
          >
            <Download className="h-3.5 w-3.5 text-muted-gold" />
            <span>Ekspor CSV</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Catat Transaksi Manual</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <Link
          href="/admin/finance"
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-bone-muted hover:text-bone hover:bg-white/5 whitespace-nowrap"
        >
          Verifikasi Pembayaran
        </Link>
        <Link
          href="/admin/finance/transactions"
          className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-muted-gold text-charcoal shadow whitespace-nowrap"
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

      {/* Success / Error Toast */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs shadow-lg animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 text-xs shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="underline text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Kas Masuk */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase text-bone-muted flex items-center justify-between">
              <span>Total Kas Masuk</span>
              <ArrowDownRight className="h-4 w-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {formatRupiah(summary.totalIncome)}
            </div>
            <p className="text-[11px] text-bone-muted mt-1">
              Dari iuran pendaftaran event & sponsor
            </p>
          </CardContent>
        </Card>

        {/* Total Kas Keluar */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase text-bone-muted flex items-center justify-between">
              <span>Total Kas Keluar</span>
              <ArrowUpRight className="h-4 w-4 text-red-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-red-400">
              {formatRupiah(summary.totalExpense)}
            </div>
            <p className="text-[11px] text-bone-muted mt-1">
              Logistik, akomodasi, & operasional
            </p>
          </CardContent>
        </Card>

        {/* Saldo Bersih Kas Komunitas */}
        <Card className="border-muted-gold/30 bg-asphalt/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-gold flex items-center justify-between">
              <span>Saldo Kas Komunitas</span>
              <Wallet className="h-4 w-4 text-muted-gold" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-bone">
              {formatRupiah(summary.netBalance)}
            </div>
            <p className="text-[11px] text-bone-muted mt-1">
              Total saldo likuid saat ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Balances Breakdown */}
      {summary.accountBalances && summary.accountBalances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {summary.accountBalances.map((acc) => (
            <div
              key={acc.id}
              className="p-3 rounded-lg bg-charcoal border border-white/5 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-bone block">{acc.name}</span>
                <span className="text-[10px] font-mono text-bone-muted">
                  {acc.accountNumber
                    ? `${acc.accountNumber}${acc.accountHolder ? ` • a.n. ${acc.accountHolder}` : ""}`
                    : "Kas Tunai Fisik (HQ)"}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-mono font-bold block ${
                    acc.balance >= 0 ? "text-muted-gold" : "text-red-400"
                  }`}
                >
                  {formatRupiah(acc.balance)}
                </span>
                <span className="text-[10px] text-bone-muted">Saldo Akun</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari deskripsi, kategori, rekening, nomor nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs sm:w-80 bg-asphalt border-white/10"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-bone-muted mr-1 shrink-0" />
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              typeFilter === "all"
                ? "bg-muted-gold text-charcoal font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter("income")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              typeFilter === "income"
                ? "bg-emerald-600 text-white font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Kas Masuk
          </button>
          <button
            onClick={() => setTypeFilter("expense")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              typeFilter === "expense"
                ? "bg-red-600 text-white font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Kas Keluar
          </button>
        </div>
      </div>

      {/* Transactions Table Card */}
      <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Rincian Mutasi Buku Kas</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-gold" />}
          </CardTitle>
          <span className="text-xs text-bone-muted">
            {filtered.length} Transaksi Tercatat
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal/80 border-b border-white/10 text-bone-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Rekening</th>
                  <th className="py-3 px-4">Kategori & Keterangan</th>
                  <th className="py-3 px-4">No. Referensi</th>
                  <th className="py-3 px-4 text-right">Nominal (IDR)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-bone">
                {isLoading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-bone-muted">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-gold" />
                        <span>Memuat buku kas...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-bone-muted">
                      Tidak ada transaksi kas yang sesuai dengan pencarian filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-bone-muted whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {t.type === "income" ? (
                          <Badge variant="success" className="text-[10px] gap-1 font-mono">
                            <ArrowDownRight className="h-3 w-3" />
                            <span>MASUK</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px] gap-1 font-mono">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>KELUAR</span>
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-bone font-medium whitespace-nowrap">
                        {t.accountName}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-semibold text-bone">{t.category}</div>
                        <div className="text-bone-muted text-[11px] line-clamp-2">
                          {t.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-gold whitespace-nowrap">
                        {t.referenceNumber || "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={t.type === "income" ? "text-emerald-400" : "text-red-400"}
                        >
                          {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(t)}
                            className="h-7 w-7 p-0 text-muted-gold hover:text-bone hover:bg-white/10"
                            title="Edit Transaksi"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingTransaction(t)}
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-200 hover:bg-red-950/40"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL: ADD MANUAL TRANSACTION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-muted-gold/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">ENTRI BUKU KAS</Badge>
                <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                  Catat Transaksi Manual
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-bone-muted hover:text-bone text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdd(onSubmitTransaction)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Tipe Transaksi */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Jenis Arus Kas *</Label>
                  <select
                    {...registerAdd("type")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    <option value="expense">Kas Keluar (Pengeluaran)</option>
                    <option value="income">Kas Masuk (Penerimaan)</option>
                  </select>
                </div>

                {/* Rekening Kas */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Rekening Kas *</Label>
                  <select
                    {...registerAdd("accountId")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.account_number ? `(${acc.account_number}${acc.accountHolder ? ` a.n. ${acc.accountHolder}` : ""})` : ""}
                      </option>
                    ))}
                  </select>
                  {errorsAdd.accountId && (
                    <p className="text-[10px] text-red-400">{errorsAdd.accountId.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Kategori */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Kategori Transaksi *</Label>
                  <Input
                    {...registerAdd("category")}
                    placeholder="Contoh: Logistik, Konsumsi, Bensin"
                    className="text-xs bg-charcoal border-white/10"
                  />
                  {errorsAdd.category && (
                    <p className="text-[10px] text-red-400">{errorsAdd.category.message}</p>
                  )}
                </div>

                {/* Nominal */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Nominal (Rupiah) *</Label>
                  <Input
                    type="number"
                    {...registerAdd("amount", { valueAsNumber: true })}
                    placeholder="150000"
                    className="text-xs bg-charcoal border-white/10 font-mono"
                  />
                  {errorsAdd.amount && (
                    <p className="text-[10px] text-red-400">{errorsAdd.amount.message}</p>
                  )}
                </div>
              </div>

              {/* No. Referensi / Nota */}
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor Referensi / Nota / Invoice (Opsional)</Label>
                <Input
                  {...registerAdd("referenceNumber")}
                  placeholder="Contoh: NOTA-0812, PO-KAOS-2026, SPON-CASTROL"
                  className="text-xs bg-charcoal border-white/10 font-mono"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-xs">Deskripsi & Rincian Pengeluaran/Penerimaan *</Label>
                <Textarea
                  rows={3}
                  {...registerAdd("description")}
                  placeholder="Jelaskan peruntukan dana secara lengkap dan dapat dipertanggungjawabkan..."
                  className="text-xs bg-charcoal border-white/10"
                />
                {errorsAdd.description && (
                  <p className="text-[10px] text-red-400">{errorsAdd.description.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs font-bold gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Simpan ke Buku Kas</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TRANSACTION */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-muted-gold/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">PERUBAHAN TRANSAKSI</Badge>
                <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                  Edit Transaksi Kas
                </h3>
              </div>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-bone-muted hover:text-bone text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Tipe Transaksi */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Jenis Arus Kas *</Label>
                  <select
                    {...registerEdit("type")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    <option value="expense">Kas Keluar (Pengeluaran)</option>
                    <option value="income">Kas Masuk (Penerimaan)</option>
                  </select>
                </div>

                {/* Rekening Kas */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Rekening Kas *</Label>
                  <select
                    {...registerEdit("accountId")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.account_number ? `(${acc.account_number}${acc.accountHolder ? ` a.n. ${acc.accountHolder}` : ""})` : ""}
                      </option>
                    ))}
                  </select>
                  {errorsEdit.accountId && (
                    <p className="text-[10px] text-red-400">{errorsEdit.accountId.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Kategori */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Kategori Transaksi *</Label>
                  <Input
                    {...registerEdit("category")}
                    placeholder="Contoh: Logistik, Konsumsi, Bensin"
                    className="text-xs bg-charcoal border-white/10"
                  />
                  {errorsEdit.category && (
                    <p className="text-[10px] text-red-400">{errorsEdit.category.message}</p>
                  )}
                </div>

                {/* Nominal */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Nominal (Rupiah) *</Label>
                  <Input
                    type="number"
                    {...registerEdit("amount", { valueAsNumber: true })}
                    placeholder="150000"
                    className="text-xs bg-charcoal border-white/10 font-mono"
                  />
                  {errorsEdit.amount && (
                    <p className="text-[10px] text-red-400">{errorsEdit.amount.message}</p>
                  )}
                </div>
              </div>

              {/* No. Referensi / Nota */}
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor Referensi / Nota / Invoice (Opsional)</Label>
                <Input
                  {...registerEdit("referenceNumber")}
                  placeholder="Contoh: NOTA-0812, PO-KAOS-2026, SPON-CASTROL"
                  className="text-xs bg-charcoal border-white/10 font-mono"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-xs">Deskripsi & Rincian Transaksi *</Label>
                <Textarea
                  rows={3}
                  {...registerEdit("description")}
                  placeholder="Jelaskan peruntukan dana..."
                  className="text-xs bg-charcoal border-white/10"
                />
                {errorsEdit.description && (
                  <p className="text-[10px] text-red-400">{errorsEdit.description.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setEditingTransaction(null)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs font-bold gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-red-500/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                <AlertTriangle className="h-3 w-3" />
                <span>KONFIRMASI PENGHAPUSAN</span>
              </Badge>
              <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                Hapus Transaksi Kas?
              </h3>
              <p className="text-xs text-bone-muted mt-0.5">
                Tindakan ini akan menghapus catatan transaksi dari buku kas dan menyesuaikan saldo akun kas secara otomatis. Riwayat penghapusan akan dicatat pada audit log.
              </p>
            </div>

            <div className="p-3 bg-charcoal rounded-lg border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-bone-muted">Kategori:</span>
                <span className="font-bold text-bone">{deletingTransaction.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Nominal:</span>
                <span className="font-mono font-bold text-red-400">
                  {formatRupiah(deletingTransaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Rekening:</span>
                <span className="font-medium text-bone">{deletingTransaction.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Deskripsi:</span>
                <span className="text-bone truncate max-w-[200px]">
                  {deletingTransaction.description}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingTransaction(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="text-xs font-bold gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Hapus Transaksi</span>
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
