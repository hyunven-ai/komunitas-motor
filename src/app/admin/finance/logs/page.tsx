"use client";

import * as React from "react";
import Link from "next/link";
import {
  History,
  Download,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  Clock,
  User,
  ShieldAlert,
  ArrowRight,
  Eye,
  FileText,
  CreditCard,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";

interface AuditLogItem {
  id: string;
  action: string;
  actionLabel: string;
  badgeVariant: "success" | "destructive" | "gold" | "outline" | "secondary";
  entityType: string;
  entityId: string;
  operatorName: string;
  oldData: any;
  newData: any;
  ipAddress: string;
  timestamp: string;
  rawTimestamp: string;
}

export default function AdminFinanceLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState<string>("all");
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null);

  const loadLogs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/finance/logs");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat log keuangan:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((item) => {
    if (actionFilter !== "all" && item.action !== actionFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const newStr = JSON.stringify(item.newData || "").toLowerCase();
      const oldStr = JSON.stringify(item.oldData || "").toLowerCase();
      return (
        item.actionLabel.toLowerCase().includes(q) ||
        item.operatorName.toLowerCase().includes(q) ||
        item.ipAddress.toLowerCase().includes(q) ||
        newStr.includes(q) ||
        oldStr.includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Waktu", "Aksi", "Operator", "Entitas", "IP Address", "Detail Perubahan"];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actionLabel}"`,
      `"${l.operatorName}"`,
      `"${l.entityType}"`,
      `"${l.ipAddress}"`,
      `"${JSON.stringify(l.newData || l.oldData || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `log_keuangan_brotherhood_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE_TRANSACTION":
        return <CreditCard className="h-4 w-4 text-emerald-400" />;
      case "UPDATE_TRANSACTION":
        return <Edit className="h-4 w-4 text-amber-400" />;
      case "DELETE_TRANSACTION":
        return <Trash2 className="h-4 w-4 text-red-400" />;
      case "APPROVE_PAYMENT":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "REJECT_PAYMENT":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-muted-gold" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">AKUNTABILITAS & AUDIT TRAIL</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Log Riwayat Aktivitas Keuangan
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Audit trail transparan mencatat setiap penambahan, pengubahan, penghapusan mutasi kas, dan verifikasi transfer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadLogs}
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
            <span>Ekspor Log (CSV)</span>
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
          className="px-3.5 py-1.5 rounded-md text-xs font-medium text-bone-muted hover:text-bone hover:bg-white/5 whitespace-nowrap"
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
          className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-muted-gold text-charcoal shadow whitespace-nowrap flex items-center gap-1.5"
        >
          <History className="h-3.5 w-3.5" />
          <span>Log Riwayat Aktivitas</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari aksi, operator, IP, atau keterangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs sm:w-80 bg-asphalt border-white/10"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-bone-muted mr-1 shrink-0" />
          <button
            onClick={() => setActionFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              actionFilter === "all"
                ? "bg-muted-gold text-charcoal font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Semua ({logs.length})
          </button>
          <button
            onClick={() => setActionFilter("CREATE_TRANSACTION")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              actionFilter === "CREATE_TRANSACTION"
                ? "bg-emerald-600 text-white font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Pencatatan Kas
          </button>
          <button
            onClick={() => setActionFilter("UPDATE_TRANSACTION")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              actionFilter === "UPDATE_TRANSACTION"
                ? "bg-amber-600 text-white font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Perubahan (Edit)
          </button>
          <button
            onClick={() => setActionFilter("DELETE_TRANSACTION")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              actionFilter === "DELETE_TRANSACTION"
                ? "bg-red-600 text-white font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Penghapusan
          </button>
          <button
            onClick={() => setActionFilter("APPROVE_PAYMENT")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              actionFilter === "APPROVE_PAYMENT"
                ? "bg-emerald-600 text-white font-bold"
                : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
            }`}
          >
            Persetujuan Transfer
          </button>
        </div>
      </div>

      {/* Logs Table Card */}
      <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Daftar Log Audit Finansial</span>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-gold" />}
          </CardTitle>
          <span className="text-xs text-bone-muted">
            {filteredLogs.length} Catatan Aktivitas
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal/80 border-b border-white/10 text-bone-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Jenis Aksi</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Rincian Perubahan</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-center">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-bone">
                {isLoading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-bone-muted">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-gold" />
                        <span>Memuat log aktivitas...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-bone-muted">
                      Belum ada catatan aktivitas keuangan yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((item) => {
                    const dataDesc =
                      item.newData?.description ||
                      item.oldData?.description ||
                      item.newData?.reason ||
                      item.oldData?.reason ||
                      item.newData?.note ||
                      "-";

                    const dataAmount =
                      item.newData?.amount || item.oldData?.amount || null;

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono text-bone-muted whitespace-nowrap">
                          {item.timestamp}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getActionIcon(item.action)}
                            <Badge variant={item.badgeVariant} className="text-[10px]">
                              {item.actionLabel}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-bone">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-gold" />
                            <span>{item.operatorName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <div className="text-bone font-medium truncate">{dataDesc}</div>
                          {dataAmount && (
                            <div className="text-[11px] font-mono text-muted-gold">
                              Nominal: {formatRupiah(dataAmount)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-bone-muted whitespace-nowrap">
                          {item.ipAddress}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLog(item)}
                            className="text-xs h-7 gap-1 text-muted-gold hover:text-bone hover:bg-white/5"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Detail</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-xl border border-muted-gold/40 bg-asphalt p-6 text-bone shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant={selectedLog.badgeVariant}>{selectedLog.actionLabel}</Badge>
                <h3 className="font-serif font-black uppercase text-base text-bone mt-1">
                  Detail Audit Trail Keuangan
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-bone-muted hover:text-bone text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-charcoal rounded-lg border border-white/5">
                <div>
                  <span className="text-bone-muted block">Waktu Pencatatan:</span>
                  <span className="font-mono text-bone font-bold">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-bone-muted block">Operator:</span>
                  <span className="text-bone font-bold">{selectedLog.operatorName}</span>
                </div>
                <div className="mt-1">
                  <span className="text-bone-muted block">Entitas / ID:</span>
                  <span className="font-mono text-muted-gold text-[11px] truncate block">
                    {selectedLog.entityType} ({selectedLog.entityId})
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-bone-muted block">IP Address:</span>
                  <span className="font-mono text-bone text-[11px]">{selectedLog.ipAddress}</span>
                </div>
              </div>

              {/* Old Data vs New Data */}
              {selectedLog.oldData && (
                <div className="space-y-1">
                  <span className="font-bold text-red-400 block uppercase tracking-wider text-[11px]">
                    Data Sebelum Perubahan (Old Data):
                  </span>
                  <pre className="p-3 bg-charcoal rounded-lg border border-red-500/20 text-bone text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newData && (
                <div className="space-y-1">
                  <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[11px]">
                    Data Sesudah Perubahan (New Data):
                  </span>
                  <pre className="p-3 bg-charcoal rounded-lg border border-emerald-500/20 text-bone text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
