"use client";

import React, { useState, useTransition, useRef } from "react";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Shield,
  X,
  Loader2,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSlide } from "@/features/sliders/types";
import {
  addSlideAction,
  updateSlideAction,
  deleteSlideAction,
  toggleSlideActiveAction,
  moveSlideAction,
  resetSlidersToDefaultAction,
} from "@/features/sliders/actions";

interface SliderManagerClientProps {
  initialSlides: HeroSlide[];
}

export function SliderManagerClient({ initialSlides }: SliderManagerClientProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  // Feedback Alert State
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    headlinePart1: "",
    headlineGold: "",
    taglineSub: "",
    subtitle: "",
    location: "",
    date: "",
    bgUrl: "",
    ctaText: "DAFTAR CALON MEMBER",
    ctaLink: "/join",
    isActive: true,
  });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormData({
      headlinePart1: "SATU ASPAL,",
      headlineGold: "SATU JIWA.",
      taglineSub: "Touring & Safety Riding • Solidaritas Kemanusiaan • KTA Digital",
      subtitle:
        "Wadah resmi perkumpulan penjelajah jalanan nusantara yang menjunjung tinggi kehormatan dan persaudaraan.",
      location: "Jalur Pesisir & Puncak",
      date: "Ekspedisi Resmi",
      bgUrl:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=2400&q=95",
      ctaText: "DAFTAR CALON MEMBER",
      ctaLink: "/join",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      headlinePart1: slide.headlinePart1,
      headlineGold: slide.headlineGold,
      taglineSub: slide.taglineSub,
      subtitle: slide.subtitle,
      location: slide.location,
      date: slide.date,
      bgUrl: slide.bgUrl,
      ctaText: slide.ctaText || "DAFTAR CALON MEMBER",
      ctaLink: slide.ctaLink || "/join",
      isActive: slide.isActive,
    });
    setIsModalOpen(true);
  };

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "sliders");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setFormData((prev) => ({ ...prev, bgUrl: json.data.url }));
        showAlert("success", "Gambar slide berhasil diunggah!");
      } else {
        showAlert("error", json.message || "Gagal mengunggah gambar.");
      }
    } catch {
      showAlert("error", "Terjadi kesalahan saat mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Save or Update
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.headlinePart1.trim() || !formData.headlineGold.trim()) {
      showAlert("error", "Judul utama (headline) tidak boleh kosong.");
      return;
    }

    if (!formData.bgUrl.trim()) {
      showAlert("error", "URL atau gambar latar belakang wajib diisi.");
      return;
    }

    startTransition(async () => {
      if (editingSlide) {
        const res = await updateSlideAction(editingSlide.id, formData);
        if (res.success) {
          setSlides((prev) =>
            prev.map((s) => (s.id === editingSlide.id ? { ...s, ...formData } : s))
          );
          showAlert("success", "Slide berhasil diperbarui!");
          setIsModalOpen(false);
        } else {
          showAlert("error", res.message);
        }
      } else {
        const res = await addSlideAction(formData);
        if (res.success && res.slide) {
          setSlides((prev) => [...prev, res.slide!]);
          showAlert("success", "Slide baru berhasil ditambahkan!");
          setIsModalOpen(false);
        } else {
          showAlert("error", res.message);
        }
      }
    });
  };

  // Toggle Active
  const handleToggleActive = (id: string, currentVal: boolean) => {
    startTransition(async () => {
      const newVal = !currentVal;
      const res = await toggleSlideActiveAction(id, newVal);
      if (res.success) {
        setSlides((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: newVal } : s))
        );
        showAlert(
          "success",
          newVal ? "Slide telah diaktifkan di frontend." : "Slide dinonaktifkan."
        );
      } else {
        showAlert("error", res.message);
      }
    });
  };

  // Move Up / Down
  const handleMove = (id: string, direction: "up" | "down") => {
    startTransition(async () => {
      const res = await moveSlideAction(id, direction);
      if (res.success) {
        setSlides((prev) => {
          const index = prev.findIndex((s) => s.id === id);
          if (index === -1) return prev;
          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= prev.length) return prev;

          const copy = [...prev];
          const temp = copy[index];
          copy[index] = copy[targetIndex];
          copy[targetIndex] = temp;
          return copy.map((s, idx) => ({ ...s, orderIndex: idx }));
        });
        showAlert("success", "Urutan slide berhasil diubah!");
      } else {
        showAlert("error", res.message);
      }
    });
  };

  // Delete Slide
  const handleDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus slide ini?")) return;

    startTransition(async () => {
      const res = await deleteSlideAction(id);
      if (res.success) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
        if (selectedPreviewIndex >= slides.length - 1) {
          setSelectedPreviewIndex(Math.max(0, slides.length - 2));
        }
        showAlert("success", "Slide berhasil dihapus.");
      } else {
        showAlert("error", res.message);
      }
    });
  };

  // Reset to Default
  const handleResetToDefault = () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mengembalikan slide ke default awal sistem? Perubahan kustom akan ditimpa."
      )
    )
      return;

    startTransition(async () => {
      const res = await resetSlidersToDefaultAction();
      if (res.success) {
        window.location.reload();
      } else {
        showAlert("error", res.message);
      }
    });
  };

  const previewSlide = slides[selectedPreviewIndex] || slides[0];

  return (
    <div className="space-y-8 select-none">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#161a29] border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
                Pengaturan Slider Hero
                <Badge variant="gold" className="text-[10px] font-mono tracking-widest">
                  {slides.length} SLIDES
                </Badge>
              </h1>
              <p className="text-xs text-slate-400">
                Kelola foto latar belakang, headline, tagline, dan tombol aksi pada carousel banner utama frontend.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            disabled={isPending}
            className="border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/50 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            <span>Reset Default</span>
          </Button>

          <Button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-display uppercase tracking-wider text-xs px-4 py-2 shadow-[0_0_15px_rgba(99,102,241,0.35)]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Tambah Slide Baru</span>
          </Button>
        </div>
      </div>

      {/* ALERT FEEDBACK */}
      {alert && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            alert.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/60 border-red-500/40 text-red-300"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          )}
          <span className="text-xs font-medium font-sans">{alert.message}</span>
        </div>
      )}

      {/* 2. LIVE DESKTOP BANNER PREVIEW */}
      {previewSlide && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-2 text-indigo-400 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              Live Preview: Slide #{previewSlide.orderIndex + 1} ({previewSlide.headlineGold})
            </span>
            <span>Frontend Hero Aspect Ratio (16:9 Cinema)</span>
          </div>

          <div className="relative w-full aspect-[21/9] sm:aspect-[16/7] rounded-2xl overflow-hidden border border-indigo-500/30 bg-[#0B0D14] shadow-2xl group">
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSlide.bgUrl}
              alt={previewSlide.headlineGold}
              className="w-full h-full object-cover object-center"
            />

            {/* Gradient Scrim (Same as Frontend) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D14]/95 via-[#0B0D14]/75 via-45% to-transparent" />
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#0B0D14]/80 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0B0D14] to-transparent" />

            {/* Text Overlay */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/40 backdrop-blur-md w-max">
                <Shield className="h-3 w-3 text-indigo-400" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">
                  {previewSlide.date} &bull; {previewSlide.location}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black uppercase tracking-tight text-white leading-tight">
                {previewSlide.headlinePart1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">
                  {previewSlide.headlineGold}
                </span>
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 max-w-xl font-sans">
                {previewSlide.subtitle}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Button size="sm" className="bg-indigo-600 text-white text-xs font-display font-bold uppercase tracking-wider">
                  {previewSlide.ctaText || "DAFTAR CALON MEMBER"}
                </Button>
                {previewSlide.isActive ? (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                    ACTIVE ON SITE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 border border-slate-700 px-2 py-0.5 rounded">
                    DRAFT (HIDDEN)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SLIDES LIST & MANAGEMENT TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
            Daftar Slide Aktif & Arsip
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Gunakan tombol panah untuk mengubah urutan tayang
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {slides.map((slide, index) => (
            <Card
              key={slide.id}
              className={`border transition-all duration-300 ${
                selectedPreviewIndex === index
                  ? "border-indigo-500/60 bg-[#161A29] shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                  : "border-white/10 bg-[#131724]/90 hover:border-white/20"
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Thumbnail & Info */}
                <div
                  className="flex items-start sm:items-center gap-4 cursor-pointer flex-1"
                  onClick={() => setSelectedPreviewIndex(index)}
                >
                  {/* Order Number Badge */}
                  <div className="flex flex-col items-center justify-center h-12 w-9 rounded-lg bg-black/40 border border-white/10 shrink-0 font-mono text-xs font-bold text-indigo-400">
                    #{index + 1}
                  </div>

                  {/* Image Thumbnail */}
                  <div className="relative h-16 w-28 sm:h-20 sm:w-36 rounded-xl overflow-hidden border border-white/15 bg-black/60 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.bgUrl}
                      alt={slide.headlineGold}
                      className="w-full h-full object-cover"
                    />
                    {!slide.isActive && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Slide Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display font-bold text-white text-base sm:text-lg uppercase tracking-wide truncate">
                        {slide.headlinePart1}{" "}
                        <span className="text-indigo-400">{slide.headlineGold}</span>
                      </h4>
                      {slide.isActive ? (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-bold">
                          Tayang
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 font-bold">
                          Non-Aktif
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-mono truncate max-w-xl">
                      {slide.location} &bull; {slide.date}
                    </p>
                    <p className="text-xs text-slate-300 font-sans line-clamp-1 max-w-xl">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10 justify-end">
                  {/* Reorder Buttons */}
                  <div className="flex items-center border border-white/10 rounded-lg bg-black/30 p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === 0 || isPending}
                      onClick={() => handleMove(slide.id, "up")}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      title="Geser ke Atas"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === slides.length - 1 || isPending}
                      onClick={() => handleMove(slide.id, "down")}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      title="Geser ke Bawah"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Toggle Active Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggleActive(slide.id, slide.isActive)}
                    className={`h-9 px-3 text-xs border-white/15 ${
                      slide.isActive
                        ? "text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title={slide.isActive ? "Klik untuk nonaktifkan" : "Klik untuk tayangkan"}
                  >
                    {slide.isActive ? (
                      <>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        <span>Aktif</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                        <span>Sembunyi</span>
                      </>
                    )}
                  </Button>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(slide)}
                    className="h-9 px-3 text-xs border-white/15 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/50"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    <span>Edit</span>
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={slides.length <= 1 || isPending}
                    onClick={() => handleDelete(slide.id)}
                    className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                    title="Hapus Slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. MODAL DIALOG: ADD / EDIT SLIDE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-2xl border border-indigo-500/40 bg-[#131724] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                    {editingSlide ? "Edit Slide Carousel" : "Tambah Slide Baru"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konfigurasi teks, foto latar, dan tombol aksi slide banner utama.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-6 pt-5">
              {/* Background Image Upload / URL */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Foto Latar Belakang (Resolusi Tinggi &bull; Landscape 16:9)
                </label>

                {/* Upload or URL Area */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... atau upload"
                      value={formData.bgUrl}
                      onChange={(e) => setFormData({ ...formData, bgUrl: e.target.value })}
                      required
                      className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 text-xs h-10"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 mr-2" />
                          <span>Unggah File</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview Thumbnail */}
                {formData.bgUrl && (
                  <div className="relative mt-2 h-36 w-full rounded-xl overflow-hidden border border-white/15 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.bgUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-emerald-400">
                      Preview Gambar
                    </div>
                  </div>
                )}
              </div>

              {/* Headline Fields (Part 1 and Highlight Gradient) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Headline Baris 1 (Teks Putih)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SATU ASPAL,"
                    value={formData.headlinePart1}
                    onChange={(e) => setFormData({ ...formData, headlinePart1: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                    Headline Highlight (Gradasi Neon)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SATU JIWA."
                    value={formData.headlineGold}
                    onChange={(e) => setFormData({ ...formData, headlineGold: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-bold text-indigo-300"
                  />
                </div>
              </div>

              {/* Tagline Sub Bullets */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Tagline Sub-bullet (Teks Ringkas di Bawah Judul)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Touring & Safety Riding • Solidaritas Kemanusiaan • KTA Digital"
                  value={formData.taglineSub}
                  onChange={(e) => setFormData({ ...formData, taglineSub: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Subtitle / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Deskripsi / Paragraf Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi penjelasan mengenai kegiatan atau moto klub..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                  className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Location & Date Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Label Lokasi (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dieng Plateau, Wonosobo"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Label Ekspedisi / Tanggal
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ekspedisi Rutin 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* CTA Button Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Teks Tombol Aksi (CTA)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: DAFTAR CALON MEMBER"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Link Tombol Aksi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: /join atau /events"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#0B0D14] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0B0D14] border border-white/10">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-mono text-white cursor-pointer">
                  Aktifkan slide ini di banner utama frontend (Dapat dilihat oleh publik)
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-white/15 text-slate-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-display uppercase tracking-wider text-xs px-6 py-2.5 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Slide</span>
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
