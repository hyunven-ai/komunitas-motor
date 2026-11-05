"use client";

import * as React from "react";
import Link from "next/link";
import {
  MessagesSquare,
  Hash,
  Users,
  ShieldAlert,
  Settings,
  Plus,
  Trash2,
  Lock,
  Volume2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DEFAULT_CHAT_ROOMS } from "@/modules/community-chat/services/room.service";
import { SAMPLE_REPORTS } from "@/modules/community-chat/services/moderation.service";
import { SAMPLE_ONLINE_MEMBERS } from "@/modules/community-chat/services/presence.service";
import { ChatRoom, ChatReportItem } from "@/modules/community-chat/types/chat.types";

export default function AdminChatManagementPage() {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "rooms" | "members" | "reports" | "settings"
  >("overview");

  const [rooms, setRooms] = React.useState<ChatRoom[]>(DEFAULT_CHAT_ROOMS);
  const [reports, setReports] = React.useState<ChatReportItem[]>(SAMPLE_REPORTS);
  const [newRoomName, setNewRoomName] = React.useState("");
  const [newRoomCategory, setNewRoomCategory] = React.useState("COMMUNITY");
  const [newRoomDesc, setNewRoomDesc] = React.useState("");
  const [newRoomReadOnly, setNewRoomReadOnly] = React.useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false);
  const [searchMember, setSearchMember] = React.useState("");

  // Settings state
  const [maxUploadMb, setMaxUploadMb] = React.useState(10);
  const [slowModeSeconds, setSlowModeSeconds] = React.useState(0);
  const [savedSettings, setSavedSettings] = React.useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const slug = newRoomName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    const created: ChatRoom = {
      id: `room_${Date.now()}`,
      name: newRoomName.toLowerCase().trim(),
      slug,
      description: newRoomDesc.trim() || undefined,
      category: newRoomCategory as any,
      room_type: "channel",
      is_private: false,
      is_read_only: newRoomReadOnly,
      icon: "Hash",
      position: rooms.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRooms([...rooms, created]);
    setNewRoomName("");
    setNewRoomDesc("");
    setNewRoomReadOnly(false);
    setIsCreatingRoom(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm("Hapus channel ini dari Community Chat?")) {
      setRooms(rooms.filter((r) => r.id !== roomId));
    }
  };

  const handleResolveReport = (reportId: string, action: "resolve" | "dismiss") => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: action === "resolve" ? "resolved" : "dismissed",
              action_taken: action === "resolve" ? "Pesan dihapus & peringatan dikirim" : "Laporan ditolak",
            }
          : r
      )
    );
  };

  const handleSaveSettings = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-crimson/20 text-crimson">
              <MessagesSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-bone tracking-wide uppercase">
              Manajemen Community Chat
            </h1>
          </div>
          <p className="text-xs text-bone-muted">
            Kontrol channel, moderasi pesan, laporan anggota, dan konfigurasi realtime chat komunitas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/community/chat"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-bone transition-colors"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            Buka Chat Live
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 pb-2">
        {[
          { key: "overview", label: "Ringkasan", icon: MessagesSquare },
          { key: "rooms", label: "Kelola Channel", icon: Hash, badge: rooms.length },
          { key: "members", label: "Anggota & Mute", icon: Users },
          {
            key: "reports",
            label: "Laporan Moderasi",
            icon: ShieldAlert,
            badge: reports.filter((r) => r.status === "pending").length,
          },
          { key: "settings", label: "Pengaturan & Limit", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-crimson text-white shadow-lg"
                  : "text-bone-muted hover:text-bone hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#12141C] border-white/5">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-bone-muted uppercase">
                  Total Channel
                </span>
                <div className="text-2xl font-black text-bone">{rooms.length}</div>
                <div className="text-[11px] text-bone-muted">
                  3 Kategori (Community, Touring, Chapter)
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#12141C] border-white/5">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-bone-muted uppercase">
                  Anggota Online
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  {SAMPLE_ONLINE_MEMBERS.filter((m) => m.status === "online").length}
                </div>
                <div className="text-[11px] text-bone-muted">Terpantau aktif di presence engine</div>
              </CardContent>
            </Card>

            <Card className="bg-[#12141C] border-white/5">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-bone-muted uppercase">
                  Laporan Pending
                </span>
                <div className="text-2xl font-black text-amber-400">
                  {reports.filter((r) => r.status === "pending").length}
                </div>
                <div className="text-[11px] text-bone-muted">Perlu peninjauan moderator</div>
              </CardContent>
            </Card>

            <Card className="bg-[#12141C] border-white/5">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-bone-muted uppercase">
                  Realtime Engine
                </span>
                <div className="text-2xl font-black text-blue-400">Supabase</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Postgres Changes Aktif
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Card */}
          <Card className="bg-[#12141C] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-bone">Panduan Kebijakan & Moderasi Chat</CardTitle>
              <CardDescription className="text-xs text-bone-muted">
                Standar operasional chat komunitas motor Borneo Brotherhood
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-bone/80">
              <div>
                1. <strong>Satu Identitas Terpadu:</strong> Anggota otomatis memakai nama, nomor KTA, dan foto profil website resmi tanpa registrasi ulang.
              </div>
              <div>
                2. <strong>Role Hirarki:</strong> Pengurus Utama & Admin memiliki wewenang membuat channel dan mengunci channel. Moderator dapat menghapus pesan dan mem-banned spammer.
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>3. <strong>Channel Khusus:</strong> Channel kategori</span>
                <Badge variant="outline" className="text-[10px]">RIDING & EVENTS</Badge>
                <span>digunakan untuk koordinasi touring lapangan dan sweeper.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Room Management */}
      {activeTab === "rooms" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-bone uppercase tracking-wider">
              Daftar Channel Aktif ({rooms.length})
            </h3>
            <Button
              onClick={() => setIsCreatingRoom(!isCreatingRoom)}
              className="bg-crimson hover:bg-crimson-hover text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Buat Channel Baru
            </Button>
          </div>

          {isCreatingRoom && (
            <Card className="bg-[#181B26] border-crimson/30 animate-in fade-in duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-bone">Formulir Tambah Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRoom} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-bone-muted block mb-1">Nama Channel (#)</label>
                      <Input
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="contoh: rute-pantai"
                        className="bg-[#12141C] border-white/10 text-xs text-bone"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-bone-muted block mb-1">Kategori</label>
                      <select
                        value={newRoomCategory}
                        onChange={(e) => setNewRoomCategory(e.target.value)}
                        className="w-full h-9 rounded-md bg-[#12141C] border border-white/10 px-3 text-xs text-bone focus:outline-none"
                      >
                        <option value="COMMUNITY">COMMUNITY</option>
                        <option value="RIDING & EVENTS">RIDING & EVENTS</option>
                        <option value="CHAPTERS">CHAPTERS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-bone-muted block mb-1">Deskripsi / Topik</label>
                    <Input
                      value={newRoomDesc}
                      onChange={(e) => setNewRoomDesc(e.target.value)}
                      placeholder="Fokus obrolan channel ini..."
                      className="bg-[#12141C] border-white/10 text-xs text-bone"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="readonlyCheck"
                      checked={newRoomReadOnly}
                      onChange={(e) => setNewRoomReadOnly(e.target.checked)}
                      className="accent-crimson w-4 h-4 rounded"
                    />
                    <label htmlFor="readonlyCheck" className="text-xs text-bone cursor-pointer">
                      Kunci Channel (Read-Only pengumuman oleh Pengurus saja)
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button type="submit" className="bg-crimson text-white text-xs">
                      Simpan & Luncurkan Channel
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsCreatingRoom(false)}
                      className="text-xs text-bone-muted"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Rooms Table */}
          <div className="rounded-xl border border-white/5 overflow-hidden bg-[#12141C]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181B26] text-bone-muted font-bold uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tipe & Status</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-bone">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-crimson" />
                      <span>{room.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] border-white/10">
                        {room.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {room.is_read_only ? (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3" /> Read-Only
                        </span>
                      ) : (
                        <span className="text-emerald-400">Publik (Terbuka)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-bone-muted truncate max-w-xs">
                      {room.description || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-bone-muted hover:text-red-400 transition-colors"
                        title="Hapus Channel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Member Management */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-bone uppercase tracking-wider">
              Status & Keaktifan Anggota Chat
            </h3>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-bone-muted" />
              <Input
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Cari anggota..."
                className="bg-[#12141C] border-white/10 pl-9 text-xs text-bone"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 overflow-hidden bg-[#12141C]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181B26] text-bone-muted font-bold uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Nama Anggota</th>
                  <th className="py-3 px-4">Nomor KTA</th>
                  <th className="py-3 px-4">Role Portal</th>
                  <th className="py-3 px-4">Status Chat</th>
                  <th className="py-3 px-4 text-right">Aksi Disipliner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-bone">
                {SAMPLE_ONLINE_MEMBERS.map((m) => (
                  <tr key={m.user_id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold">
                      <div>{m.full_name}</div>
                      {m.username && <div className="text-[10px] text-bone-muted">@{m.username}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400">
                      {m.member_number || "BMC-MEMBER"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="text-[10px] uppercase font-bold">
                        {m.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Aktif Normal
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => alert(`Status mute diaktifkan untuk ${m.full_name}`)}
                        className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[11px] font-semibold transition-colors"
                      >
                        Mute (24 Jam)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Report Management */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-bone uppercase tracking-wider">
            Antrean Laporan Pesan dari Anggota
          </h3>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-bone-muted bg-[#12141C] rounded-xl border border-white/5">
              Tidak ada laporan pelanggaran aktif saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <Card key={rep.id} className="bg-[#12141C] border-white/5">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] uppercase ${
                            rep.status === "pending"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {rep.status}
                        </Badge>
                        <span className="text-xs font-bold text-bone">
                          Channel #{rep.room_name}
                        </span>
                      </div>
                      <p className="text-xs text-bone/90 font-medium">
                        &quot;{rep.message_content}&quot;
                      </p>
                      <div className="text-[11px] text-bone-muted flex items-center gap-2">
                        <span>Pelapor: <strong>{rep.reporter_name}</strong></span>
                        <span>•</span>
                        <span>Alasan: {rep.reason}</span>
                      </div>
                      {rep.action_taken && (
                        <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                          Tindakan: {rep.action_taken}
                        </div>
                      )}
                    </div>

                    {rep.status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          onClick={() => handleResolveReport(rep.id, "resolve")}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5"
                        >
                          Hapus Pesan & Beri Sanksi
                        </Button>
                        <Button
                          onClick={() => handleResolveReport(rep.id, "dismiss")}
                          variant="ghost"
                          className="text-xs text-bone-muted hover:text-bone py-1.5"
                        >
                          Tolak Laporan
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Settings */}
      {activeTab === "settings" && (
        <Card className="bg-[#12141C] border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-bone">
              Konfigurasi & Parameter Keamanan Chat
            </CardTitle>
            <CardDescription className="text-xs text-bone-muted">
              Atur batasan upload file, proteksi spam, dan slow mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-bone-muted block mb-1">
                  Maksimum Ukuran Lampiran (MB)
                </label>
                <Input
                  type="number"
                  value={maxUploadMb}
                  onChange={(e) => setMaxUploadMb(Number(e.target.value))}
                  className="bg-[#181B26] border-white/10 text-xs text-bone"
                />
                <span className="text-[10px] text-bone-muted mt-1 block">
                  Rekomendasi: 10 MB per gambar/dokumen.
                </span>
              </div>

              <div>
                <label className="text-xs text-bone-muted block mb-1">
                  Slow-Mode / Rate Limit (Detik)
                </label>
                <Input
                  type="number"
                  value={slowModeSeconds}
                  onChange={(e) => setSlowModeSeconds(Number(e.target.value))}
                  className="bg-[#181B26] border-white/10 text-xs text-bone"
                  placeholder="0 untuk nonaktif"
                />
                <span className="text-[10px] text-bone-muted mt-1 block">
                  Jeda waktu wajib antar pesan untuk mencegah spamming.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                onClick={handleSaveSettings}
                className="bg-crimson hover:bg-crimson-hover text-white text-xs font-semibold"
              >
                Simpan Konfigurasi Chat
              </Button>
              {savedSettings && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil disimpan!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

