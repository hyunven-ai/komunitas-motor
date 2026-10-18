"use client";

import * as React from "react";
import Link from "next/link";
import {
  Megaphone,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Shield,
  Eye,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  division: string;
  priority: string;
  badgeColor: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [loading, setLoading] = React.useState(true);
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([]);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Modal states
  const [showModal, setShowModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AnnouncementItem | null>(null);

  // Form states
  const [formData, setFormData] = React.useState({
    title: "",
    text: "",
    division: "Divisi Safety Officer",
    priority: "high",
    badgeColor: "gold",
  });

  const loadAnnouncements = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncements(json.data);
      }
    } catch (err) {
      console.error("Error loading announcements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      text: "",
      division: "Divisi Safety Officer",
      priority: "high",
      badgeColor: "gold",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      text: item.content,
      division: item.division,
      priority: item.priority,
      badgeColor: item.badgeColor,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) {
      alert("Harap isi judul dan teks pengumuman.");
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = !!editingItem;
      const url = "/api/admin/announcements";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { id: editingItem.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan pengumuman.");
      }

      await loadAnnouncements();
      setShowModal(false);
      setNotification(json.message || "Pengumuman berhasil disimpan!");
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setNotification("Pengumuman berhasil dihapus.");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">INFORMASI & BROADCAST</Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
            Pengumuman Resmi Pengurus
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Kelola maklumat penting, himbauan keselamatan, dan pengumuman divisi untuk seluruh anggota komunitas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/member">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
              <Eye className="h-3.5 w-3.5 text-muted-gold" />
              <span>Lihat di Dashboard Member</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="default"
            onClick={handleOpenCreate}
            className="text-xs font-bold gap-1.5 shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tambah Pengumuman Baru</span>
          </Button>
        </div>
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
          <p className="text-xs font-mono text-bone-muted">Memuat daftar pengumuman pengurus...</p>
        </div>
      ) : announcements.length === 0 ? (
        <Card className="border-dashed border-white/15 bg-asphalt/40 p-12 text-center space-y-3">
          <Megaphone className="h-10 w-10 text-bone-muted mx-auto" />
          <h3 className="font-serif font-bold text-lg text-bone">Belum Ada Pengumuman</h3>
          <p className="text-xs text-bone-muted max-w-sm mx-auto">
            Terbitkan maklumat pengurus pertama untuk ditampilkan pada portal dashboard seluruh anggota.
          </p>
          <Button
            size="sm"
            variant="default"
            onClick={handleOpenCreate}
            className="text-xs font-bold gap-1.5 mt-2"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Buat Pengumuman Baru</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((item) => {
            const isGold = item.badgeColor === "gold" || item.priority === "high";
            const isRed = item.badgeColor === "red" || item.priority === "urgent";
            const borderColorClass = isRed
              ? "border-l-red-500"
              : isGold
              ? "border-l-muted-gold"
              : "border-l-emerald-500";

            return (
              <Card
                key={item.id}
                className={`border border-white/10 border-l-4 ${borderColorClass} bg-asphalt/60 hover:border-white/20 transition-all p-5 space-y-3`}
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div>
                    <h3 className="font-serif font-bold text-base text-bone">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-bone-muted">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3 text-muted-gold" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 w-8 p-0 text-bone-muted hover:text-bone"
                      title="Edit Pengumuman"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-bone-muted leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isRed ? "text-red-400" : isGold ? "text-muted-gold" : "text-emerald-400"
                    }`}
                  >
                    {item.division}
                  </span>
                  <Badge variant={isRed ? "destructive" : isGold ? "gold" : "success"} className="text-[9px] py-0 px-1.5">
                    {item.priority.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-asphalt border border-muted-gold/40 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <div className="border-b border-white/10 pb-3">
              <Badge variant="gold">
                {editingItem ? "EDIT PENGUMUMAN" : "PENGUMUMAN BARU"}
              </Badge>
              <h3 className="text-xl font-serif font-black uppercase text-bone mt-1">
                {editingItem ? "Edit Maklumat Pengurus" : "Terbitkan Maklumat Pengurus"}
              </h3>
              <p className="text-xs text-bone-muted">
                Pengumuman ini akan langsung muncul di panel samping Dashboard Anggota.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Judul Pengumuman *</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Kewajiban Uji Emisi & Servis Berkala"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="text">Isi / Uraian Maklumat *</Label>
                <Textarea
                  id="text"
                  rows={4}
                  placeholder="Tuliskan isi instruksi, jadwal, atau pengumuman secara rinci..."
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="division">Divisi / Penanggung Jawab *</Label>
                  <select
                    id="division"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full h-10 rounded-md border border-white/15 bg-charcoal px-3 text-xs text-bone focus:outline-none focus:ring-1 focus:ring-muted-gold"
                  >
                    <option value="Divisi Safety Officer">Divisi Safety Officer</option>
                    <option value="Divisi Sosial & Humas">Divisi Sosial & Humas</option>
                    <option value="Sekretariat Pusat">Sekretariat Pusat</option>
                    <option value="Road Captain & Touring">Road Captain & Touring</option>
                    <option value="Bendahara Umum">Bendahara Umum</option>
                    <option value="Divisi Logistik & Rescue">Divisi Logistik & Rescue</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority">Tingkat Prioritas & Aksen *</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        priority: val,
                        badgeColor: val === "urgent" ? "red" : val === "high" ? "gold" : "emerald",
                      });
                    }}
                    className="w-full h-10 rounded-md border border-white/15 bg-charcoal px-3 text-xs text-bone focus:outline-none focus:ring-1 focus:ring-muted-gold"
                  >
                    <option value="high">Penting (Aksen Emas)</option>
                    <option value="urgent">Mendesak / Wajib (Aksen Merah)</option>
                    <option value="normal">Sosial / Informasi (Aksen Hijau)</option>
                  </select>
                </div>
              </div>

              {/* Live Preview */}
              <div className="rounded-lg bg-charcoal/80 border border-white/10 p-3.5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-bone-muted">
                  Pratinjau di Dashboard Member:
                </span>
                <div
                  className={`p-3 rounded-md bg-charcoal/70 border-l-2 ${
                    formData.priority === "urgent"
                      ? "border-red-500"
                      : formData.priority === "high"
                      ? "border-muted-gold"
                      : "border-emerald-500"
                  } space-y-1`}
                >
                  <p className="font-bold text-bone text-xs">
                    {formData.title || "Judul Pengumuman"}
                  </p>
                  <p className="text-bone-muted text-[11px] leading-relaxed">
                    {formData.text || "Isi uraian maklumat pengurus..."}
                  </p>
                  <p
                    className={`text-[10px] font-mono pt-1 ${
                      formData.priority === "urgent"
                        ? "text-red-400"
                        : formData.priority === "high"
                        ? "text-muted-gold"
                        : "text-emerald-400"
                    }`}
                  >
                    {formData.division}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="font-bold gap-1.5">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : "Terbitkan Pengumuman"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
