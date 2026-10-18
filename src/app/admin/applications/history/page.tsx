"use client";

import * as React from "react";
import Link from "next/link";
import {
  History,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Phone,
  Mail,
  MapPin,
  Bike,
  Shield,
  RefreshCw,
  Loader2,
  MessageCircle,
  RotateCcw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MembershipApplication } from "@/types/database";

interface ApplicationWithKTA extends MembershipApplication {
  member_number?: string | null;
}

export default function ApplicationsHistoryPage() {
  const [historyApps, setHistoryApps] = React.useState<ApplicationWithKTA[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedApp, setSelectedApp] = React.useState<ApplicationWithKTA | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [actionProcessing, setActionProcessing] = React.useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const fetchHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/applications?scope=history");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHistoryApps(json.data);
      } else {
        setHistoryApps([]);
      }
    } catch (err) {
      console.error("Gagal memuat log riwayat pendaftaran:", err);
      setHistoryApps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRestoreToPending = async (appId: string, applicantName: string) => {
    const confirmRestore = confirm(
      `Apakah Anda yakin ingin mengembalikan pendaftaran atas nama "${applicantName}" kembali ke Antrean Review aktif?`
    );
    if (!confirmRestore) return;

    setActionProcessing(true);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appId,
          status: "pending",
          rejection_reason: null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Remove from history list
        setHistoryApps((prev) => prev.filter((a) => a.id !== appId));
        window.dispatchEvent(new Event("application-status-changed"));
        setActionFeedback(`Pendaftaran ${applicantName} berhasil dikembalikan ke antrean review.`);
        setSelectedApp(null);
      } else {
        alert(json.message || "Gagal mengembalikan berkas pendaftaran.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionProcessing(false);
    }
  };

  const formatWhatsAppUrl = (phone: string, applicantName: string, status: string, kta?: string | null) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formatted = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    let message = "";
    if (status === "approved") {
      message = `Halo Bro/Sis ${applicantName}, selamat! Pendaftaran Anda di Brotherhood Community telah DISETUJUI${
        kta ? ` dengan No. Registrasi/KTA: ${kta}` : ""
      }. Selamat bergabung dalam persaudaraan aspal!`;
    } else {
      message = `Halo Bro/Sis ${applicantName}, terima kasih atas ketertarikan Anda mendaftar di Brotherhood Community. Terkait status review pendaftaran Anda...`;
    }
    return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
  };

  // Filter & Search Logic
  const filteredApps = React.useMemo(() => {
    return historyApps.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch =
        app.full_name?.toLowerCase().includes(q) ||
        app.city?.toLowerCase().includes(q) ||
        app.motorcycle_model?.toLowerCase().includes(q) ||
        app.motorcycle_plate?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.phone_number?.toLowerCase().includes(q) ||
        app.member_number?.toLowerCase().includes(q) ||
        app.id?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [historyApps, statusFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const paginatedApps = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize);
  }, [filteredApps, currentPage, pageSize]);

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const approvedCount = historyApps.filter((a) => a.status === "approved").length;
  const rejectedCount = historyApps.filter((a) => a.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">ARSIP & KEPUTUSAN</Badge>
            <span className="text-xs font-mono text-muted-gold">LOG HISTORY</span>
          </div>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1 flex items-center gap-2.5">
            <History className="h-7 w-7 text-muted-gold" />
            Riwayat Review Pendaftaran
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Arsip riwayat berkas pendaftaran yang telah diproses (disetujui menjadi anggota resmi atau ditolak).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/applications">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1.5 border-white/10 bg-asphalt hover:border-muted-gold/40 text-bone"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-muted-gold" />
              <span>Antrean Review Aktif</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            disabled={isLoading}
            className="text-xs flex items-center gap-2 border-white/10 bg-asphalt hover:border-muted-gold/40 text-bone"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-gold ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan Riwayat</span>
          </Button>
        </div>
      </div>

      {actionFeedback && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs text-emerald-300 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400 hover:text-emerald-200 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-asphalt/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-bone-muted font-mono">
                Total Diproses
              </p>
              <h3 className="text-2xl font-black text-bone mt-0.5">{historyApps.length}</h3>
              <p className="text-[10px] text-bone-muted/80 mt-0.5">Semua berkas yang telah diputuskan</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <History className="h-5 w-5 text-muted-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-mono">
                Pendaftaran Disetujui
              </p>
              <h3 className="text-2xl font-black text-emerald-400 mt-0.5">{approvedCount}</h3>
              <p className="text-[10px] text-emerald-200/70 mt-0.5">KTA terbit & masuk Database Anggota</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-red-300/80 font-mono">
                Pendaftaran Ditolak
              </p>
              <h3 className="text-2xl font-black text-red-400 mt-0.5">{rejectedCount}</h3>
              <p className="text-[10px] text-red-200/70 mt-0.5">Tersimpan beserta catatan alasan</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter, Search & Page Size Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-charcoal/60 p-3 rounded-lg border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-bone-muted" />
          <Input
            placeholder="Cari nama, kota, tipe motor, plat, No. KTA, email, atau telp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-gold shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 rounded-md border border-white/10 bg-asphalt px-2.5 text-xs text-bone focus:outline-none focus:border-muted-gold"
            >
              <option value="all">Semua Keputusan ({historyApps.length})</option>
              <option value="approved">Disetujui ({approvedCount})</option>
              <option value="rejected">Ditolak ({rejectedCount})</option>
            </select>
          </div>

          {/* Items Per Page Toggle */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-[11px] text-bone-muted whitespace-nowrap">Tampilkan:</span>
            <div className="inline-flex rounded-md border border-white/10 bg-asphalt p-0.5">
              {[10, 20, 30, 50].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                    pageSize === size
                      ? "bg-muted-gold text-charcoal font-bold shadow"
                      : "text-bone-muted hover:text-bone"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* History Applications List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="h-8 w-8 text-muted-gold animate-spin" />
          <p className="text-xs text-bone-muted">Memuat log riwayat pendaftaran...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="border-white/10 bg-asphalt/40 p-12 text-center">
          <History className="h-12 w-12 text-bone-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-bone">Belum Ada Riwayat Pendaftaran</h3>
          <p className="text-xs text-bone-muted mt-1 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Tidak ada data riwayat yang cocok dengan filter atau kata kunci pencarian."
              : "Formulir pendaftaran yang telah Anda setujui atau tolak akan otomatis tercatat dan tersimpan rapi di sini."}
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 text-xs border-white/10 text-bone hover:border-white/30"
            >
              Reset Filter Pencarian
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedApps.map((app) => (
            <Card
              key={app.id}
              className={`border transition-colors ${
                app.status === "approved"
                  ? "border-emerald-500/20 bg-asphalt/70 hover:border-emerald-500/40"
                  : "border-red-500/20 bg-asphalt/70 hover:border-red-500/40"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Column: Details */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-serif font-bold text-bone">
                        {app.full_name}
                      </h3>

                      {app.status === "approved" ? (
                        <Badge
                          variant="success"
                          className="text-[10px] flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>DISETUJUI</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="text-[10px] flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/30"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>DITOLAK</span>
                        </Badge>
                      )}

                      {app.member_number && (
                        <Badge
                          variant="gold"
                          className="text-[11px] font-mono font-bold flex items-center gap-1 bg-muted-gold/15 text-muted-gold border-muted-gold/30"
                        >
                          <Award className="h-3 w-3" />
                          <span>KTA: {app.member_number}</span>
                        </Badge>
                      )}

                      <span className="text-[11px] font-mono text-bone-muted">
                        ID: {app.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Metadata Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-bone-muted">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                        <span>Kota: <strong className="text-bone">{app.city}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bike className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                        <span>
                          Motor: <strong className="text-bone">{app.motorcycle_model} ({app.motorcycle_year})</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                        <span>Plat: <strong className="text-bone">{app.motorcycle_plate}</strong></span>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-bone-muted pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-gold shrink-0" /> {app.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-gold shrink-0" /> {app.phone_number}
                      </span>
                      <a
                        href={formatWhatsAppUrl(app.phone_number, app.full_name, app.status, app.member_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>

                    {/* Decision note or review info */}
                    {app.status === "rejected" && app.rejection_reason && (
                      <div className="rounded-md bg-red-950/30 p-2.5 text-xs text-red-300 border border-red-500/20">
                        <p className="font-semibold text-red-200 mb-0.5 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                          Alasan Penolakan:
                        </p>
                        <p className="italic">&ldquo;{app.rejection_reason}&rdquo;</p>
                      </div>
                    )}

                    {app.reviewed_at && (
                      <div className="flex items-center gap-1.5 text-[11px] text-bone-muted/80">
                        <Calendar className="h-3 w-3 text-muted-gold" />
                        <span>
                          Ditinjau pada:{" "}
                          <strong className="text-bone">
                            {new Date(app.reviewed_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex lg:flex-col items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full justify-center gap-1.5 border-white/10 hover:border-muted-gold/40 text-bone"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye className="h-3.5 w-3.5 text-muted-gold" />
                      <span>Detail Lengkap</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full justify-center gap-1.5 border-white/10 hover:border-amber-400/50 hover:bg-amber-950/20 text-bone-muted hover:text-amber-300"
                      disabled={actionProcessing}
                      title="Kembalikan pendaftaran ini ke antrean review jika ingin ditinjau ulang"
                      onClick={() => handleRestoreToPending(app.id, app.full_name)}
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                      <span>Review Ulang</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-bone-muted">
            <div>
              Menampilkan{" "}
              <strong className="text-bone">
                {Math.min((currentPage - 1) * pageSize + 1, filteredApps.length)}
              </strong>{" "}
              sampai{" "}
              <strong className="text-bone">
                {Math.min(currentPage * pageSize, filteredApps.length)}
              </strong>{" "}
              dari <strong className="text-bone">{filteredApps.length}</strong> data riwayat
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 text-xs border-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Sebelumnya
              </Button>

              <span className="px-2 font-mono text-xs text-bone">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-8 px-2.5 text-xs border-white/10 disabled:opacity-30"
              >
                Selanjutnya
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/15 bg-charcoal p-6 text-bone shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedApp.status === "approved" ? "success" : "destructive"}>
                    {selectedApp.status === "approved" ? "DISETUJUI" : "DITOLAK"}
                  </Badge>
                  {selectedApp.member_number && (
                    <Badge variant="gold" className="font-mono">
                      KTA: {selectedApp.member_number}
                    </Badge>
                  )}
                  <span className="text-xs font-mono text-bone-muted">
                    ID: {selectedApp.id}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-black uppercase text-bone mt-1.5">
                  Arsip Formulir: {selectedApp.full_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1.5 text-bone-muted hover:bg-white/5 hover:text-bone transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 py-4 text-xs">
              {/* Review Decision Summary */}
              <div
                className={`rounded-lg p-4 border ${
                  selectedApp.status === "approved"
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                    : "bg-red-950/30 border-red-500/30 text-red-200"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {selectedApp.status === "approved" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-bone">
                      Status Keputusan:{" "}
                      {selectedApp.status === "approved"
                        ? "Disetujui Sebagai Anggota Brotherhood"
                        : "Pendaftaran Tidak Disetujui"}
                    </p>
                    {selectedApp.member_number && (
                      <p className="text-xs text-muted-gold font-mono">
                        Nomor Tanda Anggota (KTA): <strong>{selectedApp.member_number}</strong>
                      </p>
                    )}
                    {selectedApp.rejection_reason && (
                      <p className="text-xs text-red-300">
                        Alasan Penolakan: <em>&ldquo;{selectedApp.rejection_reason}&rdquo;</em>
                      </p>
                    )}
                    {selectedApp.reviewed_at && (
                      <p className="text-[11px] text-bone-muted/80">
                        Waktu Keputusan:{" "}
                        {new Date(selectedApp.reviewed_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Pribadi */}
              <div className="rounded-lg border border-white/5 bg-asphalt/50 p-4 space-y-3">
                <h4 className="font-serif font-bold uppercase tracking-wider text-muted-gold text-[11px]">
                  1. Informasi Pemohon
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-bone-muted">Nama Lengkap:</span>
                    <p className="font-semibold text-bone">{selectedApp.full_name}</p>
                  </div>
                  <div>
                    <span className="text-bone-muted">Domisili / Kota:</span>
                    <p className="font-semibold text-bone">{selectedApp.city}</p>
                  </div>
                  <div>
                    <span className="text-bone-muted">Email:</span>
                    <p className="font-semibold text-bone">{selectedApp.email}</p>
                  </div>
                  <div>
                    <span className="text-bone-muted">Nomor Telepon:</span>
                    <p className="font-semibold text-bone">{selectedApp.phone_number}</p>
                  </div>
                </div>
              </div>

              {/* Data Motor */}
              <div className="rounded-lg border border-white/5 bg-asphalt/50 p-4 space-y-3">
                <h4 className="font-serif font-bold uppercase tracking-wider text-muted-gold text-[11px]">
                  2. Spesifikasi Kendaraan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-bone-muted">Merk & Tipe Motor:</span>
                    <p className="font-semibold text-bone">{selectedApp.motorcycle_model}</p>
                  </div>
                  <div>
                    <span className="text-bone-muted">Tahun Pembuatan:</span>
                    <p className="font-semibold text-bone">{selectedApp.motorcycle_year}</p>
                  </div>
                  <div>
                    <span className="text-bone-muted">Nomor Polisi (Plat):</span>
                    <p className="font-semibold text-bone font-mono uppercase">
                      {selectedApp.motorcycle_plate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kontak Darurat */}
              {(selectedApp.emergency_contact_name || selectedApp.emergency_contact_phone) && (
                <div className="rounded-lg border border-white/5 bg-asphalt/50 p-4 space-y-3">
                  <h4 className="font-serif font-bold uppercase tracking-wider text-muted-gold text-[11px]">
                    3. Kontak Darurat
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-bone-muted">Nama Kontak:</span>
                      <p className="font-semibold text-bone">
                        {selectedApp.emergency_contact_name || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-bone-muted">Nomor Telepon Darurat:</span>
                      <p className="font-semibold text-bone">
                        {selectedApp.emergency_contact_phone || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Motivasi */}
              {selectedApp.reason_to_join && (
                <div className="rounded-lg border border-white/5 bg-asphalt/50 p-4 space-y-2">
                  <h4 className="font-serif font-bold uppercase tracking-wider text-muted-gold text-[11px]">
                    4. Motivasi & Alasan Bergabung
                  </h4>
                  <p className="text-bone italic bg-charcoal/50 p-3 rounded border border-white/5">
                    &ldquo;{selectedApp.reason_to_join}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-950/20"
                onClick={() => handleRestoreToPending(selectedApp.id, selectedApp.full_name)}
                disabled={actionProcessing}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Kembalikan ke Antrean Review
              </Button>

              <div className="flex items-center gap-2">
                <a
                  href={formatWhatsAppUrl(
                    selectedApp.phone_number,
                    selectedApp.full_name,
                    selectedApp.status,
                    selectedApp.member_number
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-emerald-500 text-charcoal hover:bg-emerald-400 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Chat WhatsApp Pemohon</span>
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApp(null)}
                  className="text-xs border-white/10 text-bone hover:border-white/30"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
