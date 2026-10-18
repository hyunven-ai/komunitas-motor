"use client";

import * as React from "react";
import Link from "next/link";
import {
  Target,
  HeartHandshake,
  AlertTriangle,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  RotateCcw,
  Loader2,
  BookOpen,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  OrganizationProfile,
  OrganizationPledgeItem,
  DEFAULT_ORGANIZATION_PROFILE,
} from "@/features/organization/types";

export default function AdminOrganizationPage() {
  const [profile, setProfile] = React.useState<OrganizationProfile>(DEFAULT_ORGANIZATION_PROFILE);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"visi" | "misi" | "sop" | "sejarah">("visi");
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch initial data
  const loadProfile = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/organization");
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat profil organisasi:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json();

      if (json.success) {
        setNotification({
          type: "success",
          message: "Visi, Misi Pokok, dan SOP Jalanan berhasil disimpan ke database!",
        });
        setTimeout(() => setNotification(null), 4500);
      } else {
        setNotification({
          type: "error",
          message: json.message || "Gagal menyimpan perubahan.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Terjadi kesalahan koneksi saat menyimpan perubahan.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin memulihkan seluruh teks visi, misi, dan SOP ke draf bawaan asli Brotherhood?"
      )
    ) {
      setProfile(DEFAULT_ORGANIZATION_PROFILE);
      setNotification({
        type: "success",
        message: "Data dikembalikan ke draf default. Klik 'Simpan Semua Perubahan' untuk menetapkan.",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Mission handlers
  const handleAddMission = () => {
    setProfile((prev) => ({
      ...prev,
      missions: [...prev.missions, ""],
    }));
  };

  const handleUpdateMission = (index: number, val: string) => {
    setProfile((prev) => {
      const updated = [...prev.missions];
      updated[index] = val;
      return { ...prev, missions: updated };
    });
  };

  const handleDeleteMission = (index: number) => {
    if (profile.missions.length <= 1) {
      alert("Minimal harus ada 1 butir misi pokok.");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      missions: prev.missions.filter((_, i) => i !== index),
    }));
  };

  const handleMoveMission = (index: number, direction: "up" | "down") => {
    setProfile((prev) => {
      const updated = [...prev.missions];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, missions: updated };
    });
  };

  // SOP handlers
  const handleAddSop = () => {
    const nextNumber = String(profile.sopItems.length + 1).padStart(2, "0");
    const newItem: OrganizationPledgeItem = {
      number: nextNumber,
      title: "Aturan Baru",
      description: "Deskripsi SOP keselamatan atau tata tertib jalanan di sini...",
    };
    setProfile((prev) => ({
      ...prev,
      sopItems: [...prev.sopItems, newItem],
    }));
  };

  const handleUpdateSop = (index: number, field: keyof OrganizationPledgeItem, val: string) => {
    setProfile((prev) => {
      const updated = [...prev.sopItems];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, sopItems: updated };
    });
  };

  const handleDeleteSop = (index: number) => {
    if (profile.sopItems.length <= 1) {
      alert("Minimal harus ada 1 aturan SOP jalanan.");
      return;
    }
    setProfile((prev) => ({
      ...prev,
      sopItems: prev.sopItems.filter((_, i) => i !== index),
    }));
  };

  const handleMoveSop = (index: number, direction: "up" | "down") => {
    setProfile((prev) => {
      const updated = [...prev.sopItems];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, sopItems: updated };
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="text-xs font-mono text-bone-muted">Memuat data profil & visi misi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">MANAJEMEN KONTEN ORGANISASI</Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
            Visi, Misi Pokok & SOP Jalanan
          </h1>
          <p className="text-xs text-bone-muted mt-1 max-w-2xl">
            Kelola teks Visi Komunitas, butir Misi Pokok, serta Dokumen Resmi Ikrar Keselamatan (SOP Jalanan)
            yang tampil langsung di halaman publik{" "}
            <Link href="/about" target="_blank" className="text-amber-400 hover:underline">
              Tentang Kami (/about)
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/about" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-white/20 text-bone hover:border-amber-400 gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
              <span>Lihat Frontend</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs text-bone-muted hover:text-white gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Default</span>
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSave()}
            className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Semua Perubahan</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs animate-in fade-in ${
            notification.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-200"
              : "border-red-500/40 bg-red-950/60 text-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("visi")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap ${
            activeTab === "visi"
              ? "bg-amber-400 text-charcoal shadow-md shadow-amber-400/20"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <Target className="h-4 w-4" />
          <span>1. Visi Komunitas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("misi")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap ${
            activeTab === "misi"
              ? "bg-amber-400 text-charcoal shadow-md shadow-amber-400/20"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <HeartHandshake className="h-4 w-4" />
          <span>2. Misi Pokok</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "misi" ? "bg-charcoal text-amber-400" : "bg-white/10 text-bone-muted"
            }`}
          >
            {profile.missions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sop")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap ${
            activeTab === "sop"
              ? "bg-amber-400 text-charcoal shadow-md shadow-amber-400/20"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>3. SOP Jalanan & Ikrar Safety</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "sop" ? "bg-charcoal text-amber-400" : "bg-white/10 text-bone-muted"
            }`}
          >
            {profile.sopItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sejarah")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap ${
            activeTab === "sejarah"
              ? "bg-amber-400 text-charcoal shadow-md shadow-amber-400/20"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>4. Sejarah & Profil Singkat</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VISI KOMUNITAS                                                     */}
      {/* ========================================================================= */}
      {activeTab === "visi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-bone">
                  <Target className="h-4 w-4 text-amber-400" />
                  <span>Formulir Pengaturan Visi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="visionBadge" className="text-xs">
                      Label Badge Visi (Atas)
                    </Label>
                    <Input
                      id="visionBadge"
                      value={profile.visionBadge}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, visionBadge: e.target.value }))
                      }
                      placeholder="e.g. VISION 2030"
                      className="text-xs font-mono bg-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="visionTitle" className="text-xs">
                      Judul Section Visi
                    </Label>
                    <Input
                      id="visionTitle"
                      value={profile.visionTitle}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, visionTitle: e.target.value }))
                      }
                      placeholder="e.g. Visi Komunitas"
                      className="text-xs bg-charcoal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visionText" className="text-xs">
                      Teks Lengkap Pernyataan Visi *
                    </Label>
                    <span className="text-[10px] font-mono text-bone-muted">
                      {profile.visionText.length} karakter
                    </span>
                  </div>
                  <Textarea
                    id="visionText"
                    rows={6}
                    value={profile.visionText}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, visionText: e.target.value }))
                    }
                    placeholder="Tuliskan pernyataan visi komunitas jangka panjang di sini..."
                    className="text-xs bg-charcoal leading-relaxed"
                  />
                  <p className="text-[11px] text-bone-muted">
                    Visi ini mencerminkan arah tujuan utama komunitas Brotherhood dalam keselamatan
                    berkendara, transparansi organisasi, dan persaudaraan tanpa sekat.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PREVIEW CARD */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-bone-muted font-mono">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-amber-400" />
                Live Preview (Tampilan Frontend)
              </span>
              <span className="text-[10px] text-amber-400/80">/about</span>
            </div>

            <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-charcoal via-asphalt to-charcoal p-6 space-y-4 shadow-xl relative">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-charcoal border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-md">
                  <Target className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  {profile.visionBadge || "VISION"}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-bone uppercase tracking-wide">
                {profile.visionTitle || "Visi Komunitas"}
              </h2>
              <p className="text-xs text-bone-muted leading-relaxed font-sans">
                {profile.visionText || "Teks visi belum diisi..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MISI POKOK                                                         */}
      {/* ========================================================================= */}
      {activeTab === "misi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-bone">
                  <HeartHandshake className="h-4 w-4 text-amber-400" />
                  <span>Daftar Butir Misi Pokok</span>
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddMission}
                  className="text-xs font-bold gap-1 bg-amber-400 hover:bg-amber-300 text-charcoal h-7 px-2.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Butir Misi</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="missionBadge" className="text-xs">
                      Label Badge Misi
                    </Label>
                    <Input
                      id="missionBadge"
                      value={profile.missionBadge}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, missionBadge: e.target.value }))
                      }
                      placeholder="e.g. CORE MISSION"
                      className="text-xs font-mono bg-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="missionTitle" className="text-xs">
                      Judul Section Misi
                    </Label>
                    <Input
                      id="missionTitle"
                      value={profile.missionTitle}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, missionTitle: e.target.value }))
                      }
                      placeholder="e.g. Misi Pokok"
                      className="text-xs bg-charcoal"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-xs text-bone flex items-center justify-between">
                    <span>Butir Misi (Total: {profile.missions.length})</span>
                    <span className="text-[11px] text-bone-muted">Urutan dapat diatur</span>
                  </Label>

                  {profile.missions.map((mission, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-white/10 bg-black/40"
                    >
                      <div className="flex flex-col items-center justify-center gap-1 pt-1 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          #{idx + 1}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveMission(idx, "up")}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-bone-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Naikkan urutan"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === profile.missions.length - 1}
                            onClick={() => handleMoveMission(idx, "down")}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-bone-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Turunkan urutan"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <Textarea
                          rows={2}
                          value={mission}
                          onChange={(e) => handleUpdateMission(idx, e.target.value)}
                          placeholder={`Tulis butir misi ke-${idx + 1}...`}
                          className="text-xs bg-charcoal"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMission(idx)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition shrink-0 mt-1"
                        title="Hapus butir misi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PREVIEW CARD */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-bone-muted font-mono">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-amber-400" />
                Live Preview (Tampilan Frontend)
              </span>
              <span className="text-[10px] text-amber-400/80">/about</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-charcoal via-asphalt to-charcoal p-6 space-y-4 shadow-xl relative">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-charcoal border border-white/10 flex items-center justify-center text-amber-400 shadow-md">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted">
                  {profile.missionBadge || "CORE MISSION"}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-bone uppercase tracking-wide">
                {profile.missionTitle || "Misi Pokok"}
              </h2>
              <ul className="space-y-2.5 text-xs text-bone-muted font-sans">
                {profile.missions.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{m || "(Teks butir misi kosong)"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SOP JALANAN & IKRAR SAFETY RIDING                                  */}
      {/* ========================================================================= */}
      {activeTab === "sop" && (
        <div className="space-y-4">
          <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-bone">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Daftar Aturan SOP Jalanan & Ikrar Keselamatan</span>
                </CardTitle>
                <p className="text-[11px] text-bone-muted mt-0.5">
                  Aturan konvoi resmi dan standar operasional touring komunitas.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleAddSop}
                className="text-xs font-bold gap-1 bg-amber-400 hover:bg-amber-300 text-charcoal h-7 px-2.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Aturan SOP</span>
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sopBadge" className="text-xs">
                    Label Dokumen SOP
                  </Label>
                  <Input
                    id="sopBadge"
                    value={profile.sopBadge}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, sopBadge: e.target.value }))
                    }
                    placeholder="e.g. SOP Jalanan & Dokumen Resmi Ikrar"
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sopTitle" className="text-xs">
                    Judul Utama Ikrar Keselamatan
                  </Label>
                  <Input
                    id="sopTitle"
                    value={profile.sopTitle}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, sopTitle: e.target.value }))
                    }
                    placeholder="e.g. 5 IKRAR KESELAMATAN BERKENDARA ANGGOTA BROTHERHOOD"
                    className="text-xs bg-charcoal"
                  />
                </div>
              </div>

              {/* LIST OF SOP ITEMS */}
              <div className="space-y-3 pt-3">
                {profile.sopItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                          #{item.number || String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-bold text-bone">Aturan Atribut SOP</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSop(idx, "up")}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-bone-muted disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke atas"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === profile.sopItems.length - 1}
                          onClick={() => handleMoveSop(idx, "down")}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-bone-muted disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Pindah ke bawah"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSop(idx)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                          title="Hapus aturan ini"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-[11px] text-bone-muted">Nomor Urut</Label>
                        <Input
                          value={item.number}
                          onChange={(e) => handleUpdateSop(idx, "number", e.target.value)}
                          placeholder="01"
                          className="text-xs font-mono bg-charcoal text-center"
                        />
                      </div>

                      <div className="sm:col-span-10 space-y-1">
                        <Label className="text-[11px] text-bone-muted">Judul / Pokok Aturan *</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => handleUpdateSop(idx, "title", e.target.value)}
                          placeholder="e.g. Kelayakan Teknis Kendaraan"
                          className="text-xs bg-charcoal font-semibold text-bone"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-bone-muted">
                        Penjelasan Narasi & Larangan / Kewajiban
                      </Label>
                      <Textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleUpdateSop(idx, "description", e.target.value)}
                        placeholder="Uraikan detail SOP, perlengkapan yang wajib dibawa, atau larangan terkait..."
                        className="text-xs bg-charcoal leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SEJARAH & PROFIL SINGKAT                                           */}
      {/* ========================================================================= */}
      {activeTab === "sejarah" && (
        <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-bone">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Profil Header & Narasi Sejarah Komunitas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="historySubtitle" className="text-xs">
                Sub-Judul Label (Kategori)
              </Label>
              <Input
                id="historySubtitle"
                value={profile.historySubtitle}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, historySubtitle: e.target.value }))
                }
                placeholder="e.g. Profil & Sejarah Organisasi"
                className="text-xs font-mono bg-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="historyTitle" className="text-xs">
                Slogan / Judul Utama Halaman
              </Label>
              <Input
                id="historyTitle"
                value={profile.historyTitle}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, historyTitle: e.target.value }))
                }
                placeholder="e.g. MENJELAJAH DENGAN KEHORMATAN, BERSAUDARA DALAM KEBAIKAN"
                className="text-xs font-serif uppercase tracking-wider bg-charcoal font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="historyDescription" className="text-xs">
                  Narasi Sejarah & Latar Belakang Komunitas
                </Label>
                <span className="text-[10px] font-mono text-bone-muted">
                  {profile.historyDescription.length} karakter
                </span>
              </div>
              <Textarea
                id="historyDescription"
                rows={5}
                value={profile.historyDescription}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, historyDescription: e.target.value }))
                }
                placeholder="Ceritakan kapan didirikan, lokasi basecamp pertama, serta nilai luhur pendirian komunitas..."
                className="text-xs bg-charcoal leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOTTOM FLOATING SAVE BAR */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-asphalt/90 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-bone-muted">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Perubahan akan langsung terlihat di seluruh halaman website publik.</span>
        </div>

        <Button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave()}
          className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20 px-6 py-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan Perubahan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Simpan Semua Perubahan</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
