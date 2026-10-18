"use client";

import * as React from "react";
import Link from "next/link";
import {
  Download,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Calendar,
  Users,
  Coins,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  History,
  PlusCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  XCircle,
  Building2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah } from "@/lib/utils";

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  notes: string;
  accountId?: string;
  accountName?: string;
  referenceNumber?: string;
}

interface EventFinancialReport {
  eventId: string;
  eventName: string;
  eventDate: string;
  participantsCount: number;
  ticketPrice: number;
  totalRegistrationIncome: number;
  sponsorshipIncome: number;
  sponsorships?: ExpenseItem[];
  totalIncome: number;
  expenses: ExpenseItem[];
  totalExpense: number;
  netSurplus: number;
  status: "completed" | "ongoing" | "planning";
}

interface FinanceAccount {
  id: string;
  name: string;
  account_number?: string | null;
  is_active: boolean;
}

const PRESET_EXPENSE_CATEGORIES = [
  "Villa & Penginapan Pantai/Gunung",
  "Konsumsi & BBQ Malam",
  "Kaos, Patch Bordir & Merchandise",
  "First Aid Kit & Logistik Medis",
  "Bantuan BBM Sweeper & Road Captain",
  "Sewa Cafe & Venue Kumpul",
  "Dokumentasi Foto & Video Cinematic",
  "Perijinan, Pengawalan & Parkir",
  "Doorprize & Souvenir",
  "Lain-lain / Operasional Umum",
];

export default function AdminFinanceReportsPage() {
  const [reports, setReports] = React.useState<EventFinancialReport[]>([]);
  const [accounts, setAccounts] = React.useState<FinanceAccount[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<EventFinancialReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modals for Expenses
  const [showAddExpenseModal, setShowAddExpenseModal] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseItem | null>(null);
  const [deletingExpense, setDeletingExpense] = React.useState<ExpenseItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [formType, setFormType] = React.useState<"expense" | "income">("expense");
  const [formCategory, setFormCategory] = React.useState(PRESET_EXPENSE_CATEGORIES[0]);
  const [formCustomCategory, setFormCustomCategory] = React.useState("");
  const [formAmount, setFormAmount] = React.useState("");
  const [formAccountId, setFormAccountId] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formReference, setFormReference] = React.useState("");

  // Notifications
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadReportsData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/finance/reports");
      const json = await res.json();

      if (json.success && json.data) {
        const reportList = json.data.reports || [];
        const accountList = json.data.accounts || [];

        setReports(reportList);
        setAccounts(accountList);

        if (accountList.length > 0 && !formAccountId) {
          setFormAccountId(accountList[0].id);
        }

        if (reportList.length > 0) {
          setSelectedEvent((prev) => {
            if (prev) {
              const found = reportList.find((e: EventFinancialReport) => e.eventId === prev.eventId);
              return found || reportList[0];
            }
            return reportList[0];
          });
        }
      } else {
        setErrorMessage(json.message || "Gagal memuat laporan keuangan event.");
      }
    } catch (err: unknown) {
      console.error("Fetch reports error:", err);
      setErrorMessage("Gagal menghubungkan ke server laporan.");
    } finally {
      setIsLoading(false);
    }
  }, [formAccountId]);

  React.useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  // Open Add Modal
  const handleOpenAdd = (type: "expense" | "income" = "expense") => {
    setFormType(type);
    setFormCategory(type === "expense" ? PRESET_EXPENSE_CATEGORIES[0] : "Sponsorship & Donasi");
    setFormCustomCategory("");
    setFormAmount("");
    setFormDescription("");
    setFormReference("");
    if (accounts.length > 0) {
      setFormAccountId(accounts[0].id);
    }
    setShowAddExpenseModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ExpenseItem, type: "expense" | "income" = "expense") => {
    setEditingExpense(item);
    setFormType(type);
    if (PRESET_EXPENSE_CATEGORIES.includes(item.category)) {
      setFormCategory(item.category);
      setFormCustomCategory("");
    } else {
      setFormCategory("custom");
      setFormCustomCategory(item.category);
    }
    setFormAmount(String(item.amount));
    setFormAccountId(item.accountId || (accounts[0]?.id || ""));
    setFormDescription(item.notes);
    setFormReference(item.referenceNumber || "");
  };

  // Submit Add Expense
  const handleSubmitAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const finalCategory = formCategory === "custom" ? formCustomCategory : formCategory;
    if (!finalCategory || !finalCategory.trim()) {
      setErrorMessage("Kategori harus diisi.");
      return;
    }

    const numAmount = Number(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Nominal harus berupa angka lebih besar dari 0.");
      return;
    }

    if (!formDescription || formDescription.trim().length < 3) {
      setErrorMessage("Keterangan peruntukan pengeluaran minimal 3 karakter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/finance/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.eventId,
          accountId: formAccountId,
          type: formType,
          amount: numAmount,
          category: finalCategory.trim(),
          description: formDescription.trim(),
          referenceNumber: formReference.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage(json.message);
        setShowAddExpenseModal(false);
        await loadReportsData();
        window.dispatchEvent(new Event("finance-status-changed"));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(json.message || "Gagal mencatat pengeluaran event.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        "Terjadi kesalahan saat menyimpan: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Expense
  const handleSubmitEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const finalCategory = formCategory === "custom" ? formCustomCategory : formCategory;
    if (!finalCategory || !finalCategory.trim()) {
      setErrorMessage("Kategori harus diisi.");
      return;
    }

    const numAmount = Number(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Nominal harus berupa angka lebih besar dari 0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/finance/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingExpense.id,
          accountId: formAccountId,
          type: formType,
          amount: numAmount,
          category: finalCategory.trim(),
          description: formDescription.trim(),
          referenceNumber: formReference.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage(json.message);
        setEditingExpense(null);
        await loadReportsData();
        window.dispatchEvent(new Event("finance-status-changed"));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(json.message || "Gagal memperbarui pengeluaran.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        "Terjadi kesalahan saat memperbarui: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Expense
  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/finance/reports?id=${deletingExpense.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage(json.message);
        setDeletingExpense(null);
        await loadReportsData();
        window.dispatchEvent(new Event("finance-status-changed"));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(json.message || "Gagal menghapus pengeluaran.");
      }
    } catch (err: unknown) {
      setErrorMessage(
        "Terjadi kesalahan saat menghapus: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = (report: EventFinancialReport) => {
    const lines = [
      `LAPORAN KEUANGAN KEGIATAN EVENT`,
      `Event: ${report.eventName}`,
      `Tanggal: ${report.eventDate}`,
      `Peserta: ${report.participantsCount} Rider | HTM: ${report.ticketPrice}`,
      `Generated: ${new Date().toLocaleString("id-ID")}`,
      ``,
      `--- REKAP PENERIMAAN ---`,
      `Uraian,Nominal (IDR)`,
      `Iuran Registrasi Peserta,${report.totalRegistrationIncome}`,
      `Sponsorship & Bantuan Donasi,${report.sponsorshipIncome}`,
      `TOTAL PEMASUKAN,${report.totalIncome}`,
      ``,
      `--- RINCIAN PENGELUARAN LOGISTIK & OPERASIONAL ---`,
      `Kategori,Rekening,No. Nota,Nominal (IDR),Keterangan`,
      ...report.expenses.map(
        (e) => `"${e.category}","${e.accountName || "-"}","${e.referenceNumber || "-"} ",${e.amount},"${e.notes.replace(/"/g, '""')}"`
      ),
      `TOTAL PENGELUARAN,${report.totalExpense}`,
      ``,
      `--- HASIL AKHIR ---`,
      `SURPLUS / (DEFISIT),${report.netSurplus}`,
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan_keuangan_${report.eventName.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">AKUNTABILITAS & LAPORAN</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Laporan Keuangan Event
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Manajemen pos anggaran pengeluaran operasional touring, penerimaan sponsor, dan hasil sisa kas (surplus).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadReportsData}
            disabled={isLoading}
            className="text-xs gap-1.5 text-bone-muted hover:text-bone"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </Button>

          {selectedEvent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(selectedEvent)}
              className="text-xs gap-1.5 border-white/15 hover:border-muted-gold"
            >
              <Download className="h-3.5 w-3.5 text-muted-gold" />
              <span>Ekspor Laporan Event (CSV)</span>
            </Button>
          )}
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
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-bone-muted hover:text-bone hover:bg-white/5 whitespace-nowrap"
        >
          Buku Kas (Ledger)
        </Link>
        <Link
          href="/admin/finance/reports"
          className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-muted-gold text-charcoal shadow whitespace-nowrap"
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

      {/* Success / Error Messages */}
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

      {isLoading && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-bone-muted text-xs gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-gold" />
          <span>Menghitung rekapitulasi keuangan event dari database...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center text-xs text-bone-muted bg-asphalt/40 rounded-xl border border-white/10">
          Belum ada data event atau transaksi keuangan yang tercatat.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Selector List */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase text-bone-muted">Pilih Agenda Touring</h2>
            <div className="space-y-2">
              {reports.map((report) => (
                <div
                  key={report.eventId}
                  onClick={() => setSelectedEvent(report)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedEvent?.eventId === report.eventId
                      ? "bg-asphalt border-muted-gold shadow-lg"
                      : "bg-charcoal border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-gold">
                      {report.eventDate}
                    </span>
                    <Badge
                      variant={report.status === "completed" ? "success" : "gold"}
                      className="text-[9px]"
                    >
                      {report.status === "completed" ? "SELESAI" : "SEDANG BERJALAN"}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-bone text-xs mt-1.5 line-clamp-2">
                    {report.eventName}
                  </h3>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                    <span className="text-bone-muted">{report.participantsCount} Peserta</span>
                    <span
                      className={`font-mono font-bold ${
                        report.netSurplus >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {report.netSurplus >= 0 ? "+" : ""}{formatRupiah(report.netSurplus)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Event Financial Report Detail */}
          {selectedEvent && (
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-white/10 bg-asphalt/80 backdrop-blur-sm">
                <CardHeader className="border-b border-white/10 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-muted-gold">
                        {selectedEvent.eventDate}
                      </span>
                      <CardTitle className="text-xl font-serif font-black uppercase text-bone mt-1">
                        {selectedEvent.eventName}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={selectedEvent.status === "completed" ? "success" : "gold"}
                      className="text-xs self-start sm:self-auto"
                    >
                      {selectedEvent.status === "completed" ? "LPJ FINAL" : "LPJ SEMENTARA"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-charcoal rounded-lg border border-white/5">
                      <span className="text-[11px] text-bone-muted block">Total Pemasukan</span>
                      <span className="text-lg font-mono font-bold text-emerald-400 block mt-0.5">
                        {formatRupiah(selectedEvent.totalIncome)}
                      </span>
                      <span className="text-[10px] text-bone-muted">
                        Iuran &amp; Bantuan Sponsor
                      </span>
                    </div>

                    <div className="p-3 bg-charcoal rounded-lg border border-white/5">
                      <span className="text-[11px] text-bone-muted block">Total Pengeluaran</span>
                      <span className="text-lg font-mono font-bold text-red-400 block mt-0.5">
                        {formatRupiah(selectedEvent.totalExpense)}
                      </span>
                      <span className="text-[10px] text-bone-muted">
                        {selectedEvent.expenses.length} Pos Biaya Terdata
                      </span>
                    </div>

                    <div className="p-3 bg-charcoal rounded-lg border border-muted-gold/20">
                      <span className="text-[11px] text-muted-gold block">Surplus / Sisa Kas</span>
                      <span
                        className={`text-lg font-mono font-bold block mt-0.5 ${
                          selectedEvent.netSurplus >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {selectedEvent.netSurplus >= 0 ? "+" : ""}
                        {formatRupiah(selectedEvent.netSurplus)}
                      </span>
                      <span className="text-[10px] text-bone-muted">
                        {selectedEvent.netSurplus >= 0 ? "Kas surplus event" : "Defisit anggaran"}
                      </span>
                    </div>
                  </div>

                  {/* Revenue Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono uppercase text-bone-muted flex items-center gap-1.5">
                        <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Rincian Penerimaan Event</span>
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenAdd("income")}
                        className="text-xs h-7 gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Tambah Sponsor/Donasi</span>
                      </Button>
                    </div>

                    <div className="p-3 bg-charcoal rounded-lg border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-bone">
                          Iuran Registrasi ({selectedEvent.participantsCount} Peserta Terkonfirmasi @ {formatRupiah(selectedEvent.ticketPrice)})
                        </span>
                        <span className="font-mono font-bold text-bone">
                          {formatRupiah(selectedEvent.totalRegistrationIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-bone">Sponsorship &amp; Dukungan Finansial Terdata</span>
                        <span className="font-mono font-bold text-bone">
                          {formatRupiah(selectedEvent.sponsorshipIncome)}
                        </span>
                      </div>

                      {selectedEvent.sponsorships && selectedEvent.sponsorships.length > 0 && (
                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                          {selectedEvent.sponsorships.map((s) => (
                            <div key={s.id} className="flex justify-between items-center text-[11px] text-bone-muted pl-3">
                              <div>
                                <span>&bull; {s.notes} ({s.category})</span>
                                <span className="ml-1 text-[10px] text-muted-gold">via {s.accountName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-emerald-400">+{formatRupiah(s.amount)}</span>
                                <button
                                  onClick={() => handleOpenEdit(s, "income")}
                                  className="text-muted-gold hover:text-bone p-0.5"
                                  title="Edit Sponsor"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setDeletingExpense(s)}
                                  className="text-red-400 hover:text-red-200 p-0.5"
                                  title="Hapus Sponsor"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expenses Section with Add/Edit/Delete Controls */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-mono uppercase text-bone-muted flex items-center gap-1.5">
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
                        <span>Rincian Pos Pengeluaran Logistik & Operasional</span>
                      </h4>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleOpenAdd("expense")}
                        className="text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-500 text-white self-start sm:self-auto"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>+ Tambah Pos Pengeluaran Event</span>
                      </Button>
                    </div>

                    {selectedEvent.expenses.length === 0 ? (
                      <div className="p-8 text-center bg-charcoal rounded-lg border border-dashed border-white/10 space-y-3">
                        <p className="text-xs text-bone-muted">
                          Belum ada pos pengeluaran operasional yang dicatat untuk event ini.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenAdd("expense")}
                          className="text-xs gap-1.5 border-white/15 hover:border-red-500"
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-red-400" />
                          <span>Catat Pengeluaran Pertama</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-white/5 bg-charcoal">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] font-mono uppercase text-bone-muted">
                            <tr>
                              <th className="py-2.5 px-3">Kategori Pos</th>
                              <th className="py-2.5 px-3">Keterangan / Peruntukan</th>
                              <th className="py-2.5 px-3">Rekening Sumber</th>
                              <th className="py-2.5 px-3">No. Nota</th>
                              <th className="py-2.5 px-3 text-right">Nominal (IDR)</th>
                              <th className="py-2.5 px-3 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {selectedEvent.expenses.map((exp) => (
                              <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-bone whitespace-nowrap">
                                  {exp.category}
                                </td>
                                <td className="py-2.5 px-3 text-bone-muted text-[11px] max-w-xs">
                                  {exp.notes}
                                </td>
                                <td className="py-2.5 px-3 text-bone-muted text-[11px] whitespace-nowrap">
                                  {exp.accountName || "Kas Komunitas"}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[10px] text-muted-gold whitespace-nowrap">
                                  {exp.referenceNumber || "-"}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400 whitespace-nowrap">
                                  {formatRupiah(exp.amount)}
                                </td>
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleOpenEdit(exp, "expense")}
                                      className="p-1 rounded text-muted-gold hover:text-bone hover:bg-white/5 transition-colors"
                                      title="Edit Pengeluaran"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingExpense(exp)}
                                      className="p-1 rounded text-red-400 hover:text-red-200 hover:bg-red-950/40 transition-colors"
                                      title="Hapus Pengeluaran"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-white/[0.02] border-t border-white/10 font-bold">
                            <tr>
                              <td colSpan={4} className="py-2.5 px-3 text-bone text-right">
                                Total Pengeluaran Logistik &amp; Operasional:
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-red-400">
                                {formatRupiah(selectedEvent.totalExpense)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportCSV(selectedEvent)}
                      className="text-xs gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5 text-muted-gold" />
                      <span>Unduh Berkas LPJ (.csv)</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD EXPENSE / SPONSOR */}
      {showAddExpenseModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-muted-gold/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant={formType === "expense" ? "destructive" : "gold"}>
                  {formType === "expense" ? "PENGELUARAN EVENT" : "PEMASUKAN EVENT"}
                </Badge>
                <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                  {formType === "expense" ? "Catat Pos Pengeluaran Event" : "Catat Dana Sponsor / Donasi"}
                </h3>
                <p className="text-xs text-bone-muted mt-0.5 line-clamp-1">
                  Untuk event: <strong className="text-bone">{selectedEvent.eventName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-bone-muted hover:text-bone text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Tipe / Sumber Rekening */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Rekening Kas *</Label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.account_number ? `(${acc.account_number})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nominal */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Nominal (Rupiah) *</Label>
                  <Input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="Contoh: 1500000"
                    className="text-xs bg-charcoal border-white/10 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <Label className="text-xs">Kategori Pos *</Label>
                {formType === "expense" ? (
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    {PRESET_EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">-- Masukkan Kategori Lainnya --</option>
                  </select>
                ) : (
                  <Input
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Contoh: Sponsor Oli, Donasi Road Captain"
                    className="text-xs bg-charcoal border-white/10"
                    required
                  />
                )}

                {formCategory === "custom" && (
                  <Input
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="Ketik kategori pengeluaran kustom..."
                    className="text-xs bg-charcoal border-white/10 mt-1.5"
                    required
                  />
                )}
              </div>

              {/* No. Bukti / Nota */}
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor Bukti / Nota / Kwitansi (Opsional)</Label>
                <Input
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  placeholder="Contoh: NOTA-VILLA-01, PO-MERCH-2026"
                  className="text-xs bg-charcoal border-white/10 font-mono"
                />
              </div>

              {/* Keterangan */}
              <div className="space-y-1.5">
                <Label className="text-xs">Keterangan &amp; Rincian Peruntukan *</Label>
                <Textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Booking 2 Villa tepi pantai Pangandaran untuk 40 orang peserta dan panitia..."
                  className="text-xs bg-charcoal border-white/10"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowAddExpenseModal(false)}
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
                      <span>Simpan ke Pengeluaran Event</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXPENSE / SPONSOR */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-muted-gold/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">EDIT POS KEUANGAN</Badge>
                <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                  Ubah Rincian Pos Keuangan Event
                </h3>
              </div>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-bone-muted hover:text-bone text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEditExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Rekening Kas *</Label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.account_number ? `(${acc.account_number})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Nominal (Rupiah) *</Label>
                  <Input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="text-xs bg-charcoal border-white/10 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <Label className="text-xs">Kategori Pos *</Label>
                {formType === "expense" ? (
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold"
                  >
                    {PRESET_EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">-- Masukkan Kategori Lainnya --</option>
                  </select>
                ) : (
                  <Input
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="text-xs bg-charcoal border-white/10"
                    required
                  />
                )}

                {formCategory === "custom" && (
                  <Input
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="Ketik kategori kustom..."
                    className="text-xs bg-charcoal border-white/10 mt-1.5"
                    required
                  />
                )}
              </div>

              {/* No. Bukti / Nota */}
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor Bukti / Nota / Kwitansi</Label>
                <Input
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  className="text-xs bg-charcoal border-white/10 font-mono"
                />
              </div>

              {/* Keterangan */}
              <div className="space-y-1.5">
                <Label className="text-xs">Keterangan &amp; Rincian Peruntukan *</Label>
                <Textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="text-xs bg-charcoal border-white/10"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setEditingExpense(null)}
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
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-red-500/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                <AlertTriangle className="h-3 w-3" />
                <span>HAPUS POS KEUANGAN EVENT</span>
              </Badge>
              <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                Hapus Catatan Pos Ini?
              </h3>
              <p className="text-xs text-bone-muted mt-0.5">
                Pos pengeluaran ini akan dihapus dari laporan event dan buku kas umum komunitas.
              </p>
            </div>

            <div className="p-3 bg-charcoal rounded-lg border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-bone-muted">Kategori:</span>
                <span className="font-bold text-bone">{deletingExpense.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Nominal:</span>
                <span className="font-mono font-bold text-red-400">
                  {formatRupiah(deletingExpense.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">Keterangan:</span>
                <span className="text-bone truncate max-w-[200px]">
                  {deletingExpense.notes}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setDeletingExpense(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="text-xs font-bold gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Hapus Sekarang</span>
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
