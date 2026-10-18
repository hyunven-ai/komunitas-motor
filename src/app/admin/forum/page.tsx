"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReportedItem {
  id: string;
  topicId: string;
  topicTitle: string;
  authorName: string;
  authorNumber: string;
  reportedBy: string;
  reason: string;
  reportedAt: string;
  snippet: string;
  status: "pending" | "resolved" | "dismissed";
}

interface ModTopic {
  id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  isHidden?: boolean;
  date: string;
}

export default function AdminForumPage() {
  const [loading, setLoading] = React.useState(true);
  const [reports, setReports] = React.useState<ReportedItem[]>([]);
  const [topics, setTopics] = React.useState<ModTopic[]>([]);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/forum");
      const json = await res.json();
      if (json.success && json.data) {
        setReports(json.data.reports || []);
        setTopics(json.data.topics || []);
      }
    } catch (err) {
      console.error("Error loading admin forum data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;

  const handleResolveReport = async (
    reportId: string,
    action: "dismiss" | "delete_content" | "warn_member"
  ) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolveReport",
          reportId,
          value: action === "dismiss" ? "dismissed" : "resolved",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: action === "dismiss" ? "dismissed" : "resolved" } : r))
        );
        setNotification(json.message || "Status laporan berhasil diperbarui.");
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error("Error resolving report:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePin = async (topicId: string, currentPin: boolean) => {
    try {
      const res = await fetch("/api/admin/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "togglePin",
          topicId,
          value: !currentPin,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTopics((prev) =>
          prev.map((t) => (t.id === topicId ? { ...t, isPinned: !currentPin } : t))
        );
        setNotification(json.message);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };

  const handleToggleLock = async (topicId: string, currentLock: boolean) => {
    try {
      const res = await fetch("/api/admin/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleLock",
          topicId,
          value: !currentLock,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTopics((prev) =>
          prev.map((t) => (t.id === topicId ? { ...t, isLocked: !currentLock } : t))
        );
        setNotification(json.message);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error("Error toggling lock:", err);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus topik ini dari forum?")) return;
    try {
      const res = await fetch("/api/admin/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteTopic",
          topicId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTopics((prev) => prev.filter((t) => t.id !== topicId));
        setNotification(json.message || "Topik diskusi berhasil dihapus.");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error("Error deleting topic:", err);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return (
        date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
        " WIB"
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">MODERASI & TERTIB ANGGOTA</Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
            Pengawasan Konten & Laporan Anggota
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Tinjau laporan postingan dari anggota, sematkan topik penting (PIN), dan kunci topik bermasalah.
          </p>
        </div>

        <Link href="/member/forum">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
            <Eye className="h-3.5 w-3.5 text-muted-gold" />
            <span>Lihat Forum Publik Member</span>
          </Button>
        </Link>
      </div>

      {notification && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-gold mx-auto" />
          <p className="text-xs font-mono text-bone-muted">Memuat data moderasi forum...</p>
        </div>
      ) : (
        <>
          {/* 1. REPORTED CONTENT QUEUE */}
          <Card className="border-red-500/30 bg-asphalt/80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                  <span>Antrean Laporan Pelanggaran Komunitas</span>
                </div>
                <Badge variant="destructive" className="text-[10px] font-mono">
                  {pendingReportsCount} LAPORAN AKTIF
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.filter((r) => r.status === "pending").length === 0 ? (
                <div className="p-6 rounded-lg bg-charcoal/50 border border-white/5 text-center text-xs text-bone-muted space-y-1">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto opacity-70" />
                  <p className="font-bold text-bone">Forum Bersih dan Teratur</p>
                  <p>Tidak ada laporan pelanggaran yang belum terselesaikan.</p>
                </div>
              ) : (
                reports
                  .filter((r) => r.status === "pending")
                  .map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-lg bg-charcoal border border-red-500/20 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-[10px]">
                            DILAPORKAN
                          </Badge>
                          <span className="font-bold text-bone text-xs">{rep.topicTitle}</span>
                        </div>
                        <span className="text-[11px] text-bone-muted font-mono">
                          {formatRelativeTime(rep.reportedAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-bone-muted">Penulis:</span>{" "}
                          <strong className="text-bone">{rep.authorName}</strong>{" "}
                          <span className="text-[10px] font-mono text-muted-gold">
                            ({rep.authorNumber})
                          </span>
                        </div>
                        <div>
                          <span className="text-bone-muted">Pelapor:</span>{" "}
                          <span className="text-bone">{rep.reportedBy}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-asphalt/80 border border-white/5 text-xs text-bone-muted space-y-1">
                        <span className="text-[10px] uppercase font-bold text-red-400">
                          Alasan Pelaporan:
                        </span>
                        <p className="text-bone">{rep.reason}</p>
                      </div>

                      {rep.snippet && rep.snippet !== "-" && (
                        <div className="text-[11px] text-bone-muted italic bg-black/30 p-2 rounded border border-white/5">
                          Cuplikan konten: &ldquo;{rep.snippet}&rdquo;
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isProcessing}
                          onClick={() => handleResolveReport(rep.id, "dismiss")}
                          className="text-xs text-bone-muted hover:text-bone"
                        >
                          Abaikan Laporan
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isProcessing}
                          onClick={() => {
                            if (rep.topicId) {
                              handleDeleteTopic(rep.topicId);
                            }
                            handleResolveReport(rep.id, "delete_content");
                          }}
                          className="text-xs"
                        >
                          Hapus Topik & Selesaikan
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isProcessing}
                          onClick={() => handleResolveReport(rep.id, "warn_member")}
                          className="text-xs font-bold"
                        >
                          Tandai Selesai
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* 2. FORUM TOPICS MODERATION LIST */}
          <Card className="border-white/10 bg-asphalt/80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Daftar Seluruh Topik Diskusi ({topics.length})</span>
                <span className="text-xs text-bone-muted font-normal">
                  Kelola status pin, kunci balasan, atau hapus postingan
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topics.length === 0 ? (
                <div className="p-8 text-center text-xs text-bone-muted">
                  Belum ada topik yang dibuat di forum.
                </div>
              ) : (
                topics.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-lg bg-charcoal border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {t.isPinned && (
                          <Badge variant="gold" className="text-[10px] gap-1 py-0 px-2 font-bold">
                            <Pin className="h-2.5 w-2.5" /> PINNED
                          </Badge>
                        )}
                        {t.isLocked && (
                          <Badge variant="destructive" className="text-[10px] gap-1 py-0 px-2 font-bold">
                            <Lock className="h-2.5 w-2.5" /> LOCKED
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px]">
                          {t.category}
                        </Badge>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-bone">{t.title}</h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-bone-muted">
                        <span>Penulis: <strong className="text-bone">{t.author}</strong></span>
                        <span>&bull;</span>
                        <span>Tanggal: {t.date}</span>
                        <span>&bull;</span>
                        <span>{t.replies} balasan</span>
                        <span>&bull;</span>
                        <span>{t.views} dilihat</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={t.isPinned ? "default" : "outline"}
                        onClick={() => handleTogglePin(t.id, t.isPinned)}
                        className="text-xs gap-1.5 h-8"
                        title={t.isPinned ? "Lepaskan Pin" : "Sematkan di Atas"}
                      >
                        <Pin className="h-3 w-3" />
                        <span>{t.isPinned ? "Pinned" : "Pin"}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={t.isLocked ? "destructive" : "outline"}
                        onClick={() => handleToggleLock(t.id, t.isLocked)}
                        className="text-xs gap-1.5 h-8"
                        title={t.isLocked ? "Buka Kunci Diskusi" : "Kunci Diskusi"}
                      >
                        {t.isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        <span>{t.isLocked ? "Buka" : "Kunci"}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTopic(t.id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8"
                        title="Hapus Topik"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
