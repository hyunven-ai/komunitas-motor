"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  Shield,
  Users,
  Compass,
  Wrench,
  Megaphone,
  Star,
  Zap,
  Plus,
  Trash2,
  Pencil,
  Save,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Loader2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  X,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  Camera,
  Bike,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CommitteeMemberItem,
  CommitteePageData,
  DEFAULT_COMMITTEE_DATA,
  PRESET_AVATARS,
} from "@/features/committee/types";

const AVAILABLE_ICONS = [
  { name: "Shield", label: "Perisai (Presiden/Pimpinan)", icon: Shield },
  { name: "Award", label: "Medali (Wakil/Bendahara)", icon: Award },
  { name: "Users", label: "Komunitas (Sekjen/Keanggotaan)", icon: Users },
  { name: "Compass", label: "Kompas (Road Captain/Touring)", icon: Compass },
  { name: "Wrench", label: "Kunci Pas (Safety Officer)", icon: Wrench },
  { name: "Megaphone", label: "Megafon (Humas & Media)", icon: Megaphone },
  { name: "Star", label: "Bintang (Dewan Kehormatan)", icon: Star },
  { name: "Zap", label: "Petir (Divisi Khusus)", icon: Zap },
] as const;

export default function AdminCommitteePage() {
  const [data, setData] = React.useState<CommitteePageData>(DEFAULT_COMMITTEE_DATA);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Modals
  const [showMemberModal, setShowMemberModal] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<CommitteeMemberItem | null>(null);
  const [memberToDelete, setMemberToDelete] = React.useState<CommitteeMemberItem | null>(null);
  const [quickPhotoMember, setQuickPhotoMember] = React.useState<CommitteeMemberItem | null>(null);

  const [activeTab, setActiveTab] = React.useState<"members" | "pageInfo">("members");
  const [uploadLoading, setUploadLoading] = React.useState(false);
  const [avatarMode, setAvatarMode] = React.useState<"upload" | "url" | "preset">("upload");

  // Form states for Member Modal
  const [formName, setFormName] = React.useState("");
  const [formPosition, setFormPosition] = React.useState("");
  const [formCode, setFormCode] = React.useState("");
  const [formMemberNumber, setFormMemberNumber] = React.useState("");
  const [formMotorcycle, setFormMotorcycle] = React.useState("");
  const [formRoleDescription, setFormRoleDescription] = React.useState("");
  const [formIconName, setFormIconName] = React.useState<CommitteeMemberItem["iconName"]>("Shield");
  const [formAvatarUrl, setFormAvatarUrl] = React.useState("");

  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load committee data
  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/committee");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat data komite:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Save all changes
  const handleSave = async (overrideData?: CommitteePageData) => {
    const payload = overrideData || data;
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/committee", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setNotification({
          type: "success",
          message: "Data susunan pengurus & foto profil berhasil disimpan ke database!",
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
        "Apakah Anda yakin ingin memulihkan seluruh susunan pengurus ke draf bawaan asli Brotherhood (termasuk foto profil default)?"
      )
    ) {
      setData(DEFAULT_COMMITTEE_DATA);
      handleSave(DEFAULT_COMMITTEE_DATA);
      setNotification({
        type: "success",
        message: "Data dikembalikan ke draf default dan disimpan.",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormPosition("");
    setFormCode("");
    setFormMemberNumber("BMC-2024-" + String(Math.floor(1000 + Math.random() * 9000)));
    setFormMotorcycle("");
    setFormRoleDescription("");
    setFormIconName("Shield");
    setFormAvatarUrl("");
    setAvatarMode("upload");
    setShowMemberModal(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (member: CommitteeMemberItem) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormPosition(member.position);
    setFormCode(member.code);
    setFormMemberNumber(member.memberNumber);
    setFormMotorcycle(member.motorcycle);
    setFormRoleDescription(member.roleDescription);
    setFormIconName(member.iconName || "Shield");
    setFormAvatarUrl(member.avatarUrl || "");
    setAvatarMode("upload");
    setShowMemberModal(true);
  };

  // Upload file avatar for Main Modal
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "committee");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const resData = await res.json();
      if (resData.success && resData.data?.url) {
        setFormAvatarUrl(resData.data.url);
        setNotification({
          type: "success",
          message: "Foto profil berhasil diunggah ke Cloudflare R2!",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(resData.message || "Gagal mengunggah foto.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat mengunggah foto.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Quick Photo Upload directly from Card
  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!quickPhotoMember) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "committee");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const resData = await res.json();
      if (resData.success && resData.data?.url) {
        const nextMembers = data.members.map((m) =>
          m.id === quickPhotoMember.id ? { ...m, avatarUrl: resData.data.url } : m
        );
        const nextData = { ...data, members: nextMembers };
        setData(nextData);
        setQuickPhotoMember(null);
        handleSave(nextData);
      } else {
        alert(resData.message || "Gagal mengunggah foto.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat mengunggah foto.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Quick Photo Set from URL / Preset
  const handleQuickPhotoSetUrl = (url: string) => {
    if (!quickPhotoMember) return;
    const nextMembers = data.members.map((m) =>
      m.id === quickPhotoMember.id ? { ...m, avatarUrl: url || undefined } : m
    );
    const nextData = { ...data, members: nextMembers };
    setData(nextData);
    setQuickPhotoMember(null);
    handleSave(nextData);
  };

  // Save member from Modal
  const handleSaveMemberModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formPosition.trim() || !formCode.trim()) {
      alert("Nama, Posisi Jabatan, dan Kode Singkat wajib diisi.");
      return;
    }

    if (editingMember) {
      // Update existing
      const updatedMembers = data.members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: formName.trim(),
              position: formPosition.trim(),
              code: formCode.trim().toUpperCase(),
              memberNumber: formMemberNumber.trim(),
              motorcycle: formMotorcycle.trim(),
              roleDescription: formRoleDescription.trim(),
              iconName: formIconName,
              avatarUrl: formAvatarUrl.trim() || undefined,
            }
          : m
      );

      const nextData = { ...data, members: updatedMembers };
      setData(nextData);
      setShowMemberModal(false);
      handleSave(nextData);
    } else {
      // Create new
      const newMember: CommitteeMemberItem = {
        id: "comm-" + Date.now(),
        name: formName.trim(),
        position: formPosition.trim(),
        code: formCode.trim().toUpperCase(),
        memberNumber: formMemberNumber.trim(),
        motorcycle: formMotorcycle.trim(),
        roleDescription: formRoleDescription.trim(),
        iconName: formIconName,
        avatarUrl: formAvatarUrl.trim() || undefined,
      };

      const nextData = { ...data, members: [...data.members, newMember] };
      setData(nextData);
      setShowMemberModal(false);
      handleSave(nextData);
    }
  };

  // Delete member
  const handleConfirmDelete = () => {
    if (!memberToDelete) return;
    const nextMembers = data.members.filter((m) => m.id !== memberToDelete.id);
    const nextData = { ...data, members: nextMembers };
    setData(nextData);
    setMemberToDelete(null);
    handleSave(nextData);
  };

  // Move member position
  const handleMoveMember = (index: number, direction: "up" | "down") => {
    const updated = [...data.members];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const nextData = { ...data, members: updated };
    setData(nextData);
    handleSave(nextData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <p className="text-xs font-mono text-bone-muted">Memuat data dewan pengurus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">STRUKTUR ORGANISASI</Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
            Manajemen Dewan Pengurus & Foto Profil
          </h1>
          <p className="text-xs text-bone-muted mt-1 max-w-2xl">
            Kelola profil pejabat, foto resmi anggota dewan pengurus, divisi kepemimpinan, dan
            informasi tunggangan yang tampil pada halaman publik{" "}
            <Link href="/committee" target="_blank" className="text-amber-400 hover:underline">
              Pengurus (/committee)
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/committee" target="_blank">
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
            onClick={handleOpenCreateModal}
            className="text-xs font-bold gap-1.5 bg-amber-400 text-charcoal hover:bg-amber-300 shadow-md shadow-amber-400/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Pengurus</span>
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
                <span>Simpan Perubahan</span>
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
      <div className="flex border-b border-white/10 gap-2 pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition ${
            activeTab === "members"
              ? "bg-amber-400 text-charcoal shadow-md shadow-amber-400/20"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Daftar Dewan Pengurus & Foto Profil</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "members" ? "bg-charcoal text-amber-400" : "bg-white/10 text-bone-muted"
            }`}
          >
            {data.members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pageInfo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition ${
            activeTab === "pageInfo"
              ? "bg-amber-400 text-charcoal shadow-md shadow-amber-400/20"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Judul Halaman & Ikrar Pengurus</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR PENGURUS & PROMINENT FOTO PROFIL                            */}
      {/* ========================================================================= */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-bone-muted font-mono px-1">
            <span>
              Total: <strong className="text-amber-400">{data.members.length}</strong> Pejabat Terdaftar
            </span>
            <span>Klik pada foto atau tombol kamera untuk mengganti foto profil pejabat</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.members.map((officer, idx) => {
              const matchedIcon =
                AVAILABLE_ICONS.find((i) => i.name === officer.iconName)?.icon || Shield;
              const IconComp = matchedIcon;

              return (
                <Card
                  key={officer.id || officer.code}
                  className="border border-white/10 bg-asphalt/60 hover:border-amber-400/40 transition-all flex flex-col justify-between shadow-2xl relative group overflow-hidden rounded-2xl"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top Bar: Code, Order, & Action buttons */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <IconComp className="h-4 w-4" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider">
                          {officer.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveMember(idx, "up")}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-bone-muted disabled:opacity-25 disabled:cursor-not-allowed"
                          title="Pindah ke atas"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === data.members.length - 1}
                          onClick={() => handleMoveMember(idx, "down")}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-bone-muted disabled:opacity-25 disabled:cursor-not-allowed"
                          title="Pindah ke bawah"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(officer)}
                          className="p-1 rounded bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 transition ml-1"
                          title="Edit Pejabat"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(officer)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          title="Hapus Pejabat"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Member Profile Info with Prominent Image */}
                    <div className="flex items-center gap-3.5">
                      {/* Interactive Profile Photo Container */}
                      <div
                        onClick={() => setQuickPhotoMember(officer)}
                        className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-amber-400/40 bg-charcoal shadow-lg shrink-0 cursor-pointer group/photo hover:border-amber-400 transition-all"
                        title="Klik untuk mengganti foto profil"
                      >
                        {officer.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={officer.avatarUrl}
                            alt={officer.name}
                            className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-charcoal via-asphalt to-charcoal text-amber-400">
                            <IconComp className="h-7 w-7 opacity-70" />
                            <span className="text-[8px] font-mono text-bone-muted uppercase mt-0.5">
                              No Photo
                            </span>
                          </div>
                        )}

                        {/* Quick Hover Overlay: Ubah Foto */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/photo:opacity-100 flex flex-col items-center justify-center text-amber-400 transition-opacity">
                          <Camera className="h-4 w-4" />
                          <span className="text-[9px] font-bold mt-0.5">Ubah Foto</span>
                        </div>
                      </div>

                      {/* Name, Position & KTA */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold font-serif text-bone truncate">
                            {officer.name}
                          </h4>
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 truncate">
                          {officer.position}
                        </p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          {officer.memberNumber && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] font-mono px-1.5 py-0 bg-charcoal border-white/10"
                            >
                              {officer.memberNumber}
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => setQuickPhotoMember(officer)}
                            className="text-[10px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                          >
                            <Camera className="h-3 w-3" />
                            <span>Ganti Foto</span>
                          </button>
                        </div>

                        {officer.motorcycle && (
                          <div className="flex items-center gap-1 text-[10px] text-bone-muted italic truncate pt-0.5">
                            <Bike className="h-3 w-3 text-amber-400/70 shrink-0" />
                            <span className="truncate">{officer.motorcycle}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-[11px] text-bone-muted leading-relaxed border-t border-white/5 pt-2.5 line-clamp-3">
                      {officer.roleDescription || "Belum ada uraian tugas."}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INFORMASI HALAMAN & PRINSIP KEPEMIMPINAN                           */}
      {/* ========================================================================= */}
      {activeTab === "pageInfo" && (
        <Card className="border-white/10 bg-asphalt/60 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-bone">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Header Halaman & Ikrar Dewan Pengurus</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pageBadge" className="text-xs">
                  Label Badge Header
                </Label>
                <Input
                  id="pageBadge"
                  value={data.badge}
                  onChange={(e) => setData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g. Organisasi & Kepengurusan"
                  className="text-xs font-mono bg-charcoal"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pageTitle" className="text-xs">
                  Judul Utama Halaman
                </Label>
                <Input
                  id="pageTitle"
                  value={data.title}
                  onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Dewan Pengurus & Pejabat Komunitas"
                  className="text-xs font-serif uppercase tracking-wider bg-charcoal font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pageDescription" className="text-xs">
                Keterangan Periode & Deskripsi Kepengurusan
              </Label>
              <Textarea
                id="pageDescription"
                rows={3}
                value={data.description}
                onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Tuliskan periode masa bakti (e.g. Periode 2024–2027) dan mandat pemilihan dewan pengurus..."
                className="text-xs bg-charcoal leading-relaxed"
              />
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Kotak Komitmen: Prinsip Kepemimpinan Melayani
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="commitmentTitle" className="text-xs">
                  Judul Kotak Komitmen
                </Label>
                <Input
                  id="commitmentTitle"
                  value={data.commitmentTitle}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, commitmentTitle: e.target.value }))
                  }
                  placeholder="e.g. Prinsip Kepemimpinan Melayani"
                  className="text-xs font-serif uppercase bg-charcoal"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="commitmentDescription" className="text-xs">
                  Pernyataan Komitmen / Nilai Organisasi
                </Label>
                <Textarea
                  id="commitmentDescription"
                  rows={3}
                  value={data.commitmentDescription}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, commitmentDescription: e.target.value }))
                  }
                  placeholder="Pernyataan komitmen sukarela pengurus tanpa komersialisasi kas komunitas..."
                  className="text-xs bg-charcoal leading-relaxed"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOTTOM FLOATING SAVE BAR */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-asphalt/90 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-bone-muted">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Foto profil dan perubahan pengurus akan langsung tampil di seluruh halaman website publik.</span>
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

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH / EDIT PEJABAT PENGURUS LENGKAP                           */}
      {/* ========================================================================= */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-amber-400/50 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">
                  {editingMember ? "EDIT DATA PENGURUS" : "TAMBAH PENGURUS BARU"}
                </Badge>
                <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                  {editingMember ? editingMember.name : "Pejabat Dewan Pengurus"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-bone-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="memberName" className="text-xs">
                    Nama Lengkap & Gelar *
                  </Label>
                  <Input
                    id="memberName"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Aryo Perkasa, S.T."
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="memberNumber" className="text-xs">
                    Nomor KTA / Registrasi
                  </Label>
                  <Input
                    id="memberNumber"
                    value={formMemberNumber}
                    onChange={(e) => setFormMemberNumber(e.target.value)}
                    placeholder="e.g. BMC-2018-0001"
                    className="text-xs font-mono bg-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="memberPosition" className="text-xs">
                    Nama Jabatan *
                  </Label>
                  <Input
                    id="memberPosition"
                    required
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="e.g. Ketua Umum (President)"
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="memberCode" className="text-xs">
                    Kode Singkat *
                  </Label>
                  <Input
                    id="memberCode"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. PRESIDENT"
                    className="text-xs font-mono bg-charcoal uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="memberMotorcycle" className="text-xs">
                    Tipe Motor / Tunggangan
                  </Label>
                  <Input
                    id="memberMotorcycle"
                    value={formMotorcycle}
                    onChange={(e) => setFormMotorcycle(e.target.value)}
                    placeholder="e.g. BMW R1250GS Adventure"
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="memberIcon" className="text-xs">
                    Ikon Divisi
                  </Label>
                  <select
                    id="memberIcon"
                    value={formIconName}
                    onChange={(e) =>
                      setFormIconName(e.target.value as CommitteeMemberItem["iconName"])
                    }
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-amber-400"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic.name} value={ic.name}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FOTO PROFIL PEJABAT */}
              <div className="space-y-2 p-3 rounded-xl border border-amber-400/30 bg-black/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Camera className="h-4 w-4" />
                    Foto Profil Pejabat (Profile Image)
                  </Label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAvatarMode("upload")}
                      className={`px-2 py-0.5 rounded transition ${
                        avatarMode === "upload"
                          ? "bg-amber-400 text-charcoal font-bold"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode("preset")}
                      className={`px-2 py-0.5 rounded transition ${
                        avatarMode === "preset"
                          ? "bg-amber-400 text-charcoal font-bold"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Pilih Koleksi
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode("url")}
                      className={`px-2 py-0.5 rounded transition ${
                        avatarMode === "url"
                          ? "bg-amber-400 text-charcoal font-bold"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Input URL
                    </button>
                  </div>
                </div>

                {avatarMode === "upload" && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-amber-400/40 rounded-lg hover:border-amber-400 cursor-pointer bg-black/30 text-xs text-bone hover:text-amber-400 transition w-full">
                      {uploadLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                          <span>Mengunggah foto ke Cloudflare R2...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 text-amber-400" />
                          <span>Pilih foto profil dari komputer</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadLoading}
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {avatarMode === "preset" && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-bone-muted">Pilih salah satu foto rider siap pakai:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {PRESET_AVATARS.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setFormAvatarUrl(p.url)}
                          className={`h-12 w-12 rounded-lg overflow-hidden border cursor-pointer hover:border-amber-400 transition ${
                            formAvatarUrl === p.url ? "border-amber-400 ring-2 ring-amber-400" : "border-white/20"
                          }`}
                          title={p.label}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {avatarMode === "url" && (
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formAvatarUrl}
                    onChange={(e) => setFormAvatarUrl(e.target.value)}
                    className="text-xs font-mono bg-charcoal"
                  />
                )}

                {/* Preview Thumbnail */}
                {formAvatarUrl && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-14 w-14 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-charcoal shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formAvatarUrl}
                        alt="Preview Foto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] text-bone-muted space-y-0.5 truncate flex-1">
                      <p className="font-bold text-amber-400">Foto Terpilih</p>
                      <p className="truncate font-mono">{formAvatarUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormAvatarUrl("")}
                      className="text-xs text-red-400 hover:text-red-300 h-7 px-2"
                    >
                      Hapus Foto
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="memberRole" className="text-xs">
                  Uraian Tugas & Tanggung Jawab
                </Label>
                <Textarea
                  id="memberRole"
                  rows={3}
                  value={formRoleDescription}
                  onChange={(e) => setFormRoleDescription(e.target.value)}
                  placeholder="Ringkasan wewenang dan cakupan tanggung jawab jabatan ini..."
                  className="text-xs bg-charcoal leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMemberModal(false)}
                  className="text-xs border-white/20"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{editingMember ? "Simpan Perubahan" : "Tambahkan Pengurus"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK UBAH FOTO PROFIL SAJA                                      */}
      {/* ========================================================================= */}
      {quickPhotoMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-amber-400/50 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black uppercase text-base text-bone">
                    Ubah Foto Profil Pejabat
                  </h3>
                  <p className="text-[11px] text-bone-muted truncate max-w-[240px]">
                    {quickPhotoMember.name} ({quickPhotoMember.position})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickPhotoMember(null)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-bone-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current photo preview */}
            <div className="flex items-center justify-center py-2">
              <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-amber-400 bg-charcoal shadow-xl relative">
                {quickPhotoMember.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={quickPhotoMember.avatarUrl}
                    alt={quickPhotoMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-amber-400/60 bg-asphalt">
                    <Camera className="h-8 w-8 mb-1" />
                    <span className="text-[9px] font-mono uppercase">Belum ada foto</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-amber-400/60 rounded-xl hover:border-amber-400 cursor-pointer bg-amber-400/5 text-xs text-bone hover:text-amber-400 transition w-full">
                {uploadLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    <span>Mengunggah ke Cloudflare R2...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4 text-amber-400" />
                    <span className="font-bold">Unggah Foto Baru dari Komputer</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadLoading}
                  onChange={handleQuickPhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Presets */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] text-bone-muted">Atau pilih dari koleksi rider Brotherhood:</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.slice(0, 4).map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleQuickPhotoSetUrl(p.url)}
                      className="h-14 rounded-lg overflow-hidden border border-white/20 hover:border-amber-400 cursor-pointer transition relative group"
                      title={p.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-110 transition" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleQuickPhotoSetUrl("")}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Hapus Foto (Gunakan Ikon)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickPhotoMember(null)}
                className="text-xs border-white/20"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KONFIRMASI HAPUS PENGURUS                                        */}
      {/* ========================================================================= */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif font-black uppercase text-base text-bone">
                  Hapus Pejabat Pengurus?
                </h3>
                <p className="text-[11px] text-bone-muted truncate max-w-[260px]">
                  {memberToDelete.name} ({memberToDelete.position})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Data akan dihapus dari daftar pengurus publik
              </p>
              <p className="text-[11px] text-red-300/80">
                Tindakan ini akan menghapus pejabat ini dari tampilan halaman /committee.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMemberToDelete(null)}
                className="text-xs border-white/20"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="text-xs font-bold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Ya, Hapus Pejabat</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
