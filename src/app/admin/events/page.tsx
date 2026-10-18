"use client";

import * as React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Users,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  Coins,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Navigation,
  Shirt,
  Shield,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatRupiah, formatDate } from "@/lib/utils";
import type { EventItem, ItineraryItem } from "@/features/events/queries";

const CATEGORIES = [
  "Touring Akbar",
  "Sunmori & Morning Ride",
  "Workshop & Edukasi",
  "Anniversary Gathering",
  "Bakti Sosial",
  "Ekspedisi Gunung",
  "Jelajah Pantai",
];

const COMMON_FACILITIES = [
  "Mobil Sweeper & Tim Medis Darurat",
  "Konsumsi & Makan Bersama",
  "Official T-Shirt & Emblem Touring",
  "Sticker Pack & Pin Logam Komunitas",
  "Tiket Masuk Objek Wisata",
  "Dokumentasi Foto & Video Cinematic",
  "Penginapan Hotel (Shared Twin)",
  "Pengawalan & Barisan Safety Officer",
];

const COMMON_GEARS = [
  "Helm Full Face / Modular Standar SNI / DOT",
  "Jaket riding dengan protektor siku & bahu",
  "Sarung tangan kulit / tekstil full finger",
  "Sepatu riding kokoh menutup mata kaki",
  "Surat kendaraan lengkap (STNK & SIM C aktif)",
  "Jas hujan berkualitas (two-piece)",
];

interface FormState {
  id?: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  coverImageUrl: string;
  locationName: string;
  locationAddress: string;
  mapLink: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  capacity: number;
  fee: number;
  status: "draft" | "published" | "cancelled" | "completed";
  itinerary: ItineraryItem[];
  includes: string[];
  mandatoryGears: string[];
}

const INITIAL_FORM: FormState = {
  title: "",
  slug: "",
  category: "Touring Akbar",
  description: "",
  coverImageUrl: "",
  locationName: "",
  locationAddress: "",
  mapLink: "",
  startTime: "",
  endTime: "",
  registrationDeadline: "",
  capacity: 50,
  fee: 0,
  status: "published",
  itinerary: [
    { time: "06.00 WIB", title: "Kumpul & Briefing Safety", note: "Pengecekan perlengkapan riding, pembagian formasi konvoi, dan doa bersama." },
    { time: "07.00 WIB", title: "Rolling Thunder Start", note: "Konvoi teratur dengan panduan Road Captain dan pengawalan Sweeper." },
    { time: "11.30 WIB", title: "Tiba di Lokasi Tujuan", note: "Makan siang bersama, ramah tamah persaudaraan, dan sesi foto bersama." },
    { time: "15.00 WIB", title: "Perjalanan Kembali", note: "Konvoi pulang atau pelepasan bebas sesuai domisili masing-masing." },
  ],
  includes: [
    "Mobil Sweeper & Tim Medis Darurat",
    "Konsumsi & Makan Bersama",
    "Sticker Pack Komunitas",
    "Dokumentasi Foto & Video Cinematic",
  ],
  mandatoryGears: [
    "Helm Full Face / Modular Standar SNI / DOT",
    "Jaket riding dengan protektor siku & bahu",
    "Sarung tangan kulit / tekstil full finger",
    "Sepatu riding kokoh menutup mata kaki",
    "Surat kendaraan lengkap (STNK & SIM C aktif)",
    "Jas hujan berkualitas (two-piece)",
  ],
};

export default function AdminEventsPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormState>(INITIAL_FORM);

  // Custom facility & gear input state
  const [newFacilityInput, setNewFacilityInput] = React.useState("");
  const [newGearInput, setNewGearInput] = React.useState("");

  // Image Upload State
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Delete Confirmation State
  const [deleteEventTarget, setDeleteEventTarget] = React.useState<EventItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Events
  const fetchEvents = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/events");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil event:", err);
      showToast("Gagal memuat event dari server", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Helper to convert ISO string to datetime-local input format (YYYY-MM-DDTHH:mm) in Asia/Jakarta (WIB)
  const toDateTimeLocal = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      const formatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return formatter.format(d).replace(" ", "T");
    } catch {
      return "";
    }
  };

  // Helper to convert datetime-local input string (YYYY-MM-DDTHH:mm) to ISO string in Asia/Jakarta (WIB, +07:00)
  const toWibIsoString = (val?: string) => {
    if (!val) return "";
    try {
      if (val.includes("Z") || val.includes("+") || val.lastIndexOf("-") > 7) {
        return new Date(val).toISOString();
      }
      const [datePart, timePart] = val.split("T");
      if (datePart && timePart) {
        const timeSegments = timePart.split(":");
        const hh = (timeSegments[0] || "00").padStart(2, "0");
        const mm = (timeSegments[1] || "00").padStart(2, "0");
        const ss = (timeSegments[2] || "00").padStart(2, "0");
        return new Date(`${datePart}T${hh}:${mm}:${ss}+07:00`).toISOString();
      }
      return new Date(val).toISOString();
    } catch {
      return new Date(val).toISOString();
    }
  };

  // Helper to slugify title
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormError(null);
    setImagePreview(null);
    setShowUrlInput(false);
    setNewFacilityInput("");
    setNewGearInput("");

    const now = new Date();
    const start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    start.setHours(6, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000);
    end.setHours(18, 0, 0, 0);
    const deadline = new Date(start.getTime() - 3 * 24 * 60 * 60 * 1000);
    deadline.setHours(23, 59, 0, 0);

    setFormData({
      ...INITIAL_FORM,
      startTime: toDateTimeLocal(start.toISOString()),
      endTime: toDateTimeLocal(end.toISOString()),
      registrationDeadline: toDateTimeLocal(deadline.toISOString()),
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (event: EventItem) => {
    setIsEditing(true);
    setFormError(null);
    setImagePreview(event.cover_image_url || null);
    setShowUrlInput(false);
    setNewFacilityInput("");
    setNewGearInput("");

    setFormData({
      id: event.id,
      title: event.title,
      slug: event.slug,
      category: event.category || "Touring Akbar",
      description: event.description,
      coverImageUrl: event.cover_image_url || "",
      locationName: event.location_name,
      locationAddress: event.location_address || "",
      mapLink: event.map_link || "",
      startTime: toDateTimeLocal(event.start_time),
      endTime: toDateTimeLocal(event.end_time),
      registrationDeadline: toDateTimeLocal(event.registration_deadline),
      capacity: event.capacity,
      fee: event.fee,
      status: event.status,
      itinerary: event.itinerary && event.itinerary.length > 0 ? event.itinerary : INITIAL_FORM.itinerary,
      includes: event.includes && event.includes.length > 0 ? event.includes : INITIAL_FORM.includes,
      mandatoryGears: event.mandatoryGears && event.mandatoryGears.length > 0 ? event.mandatoryGears : INITIAL_FORM.mandatoryGears,
    });
    setIsModalOpen(true);
  };

  // Handle Itinerary Row Changes
  const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.itinerary];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, itinerary: updated };
    });
  };

  const handleAddItineraryRow = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { time: "12.00 WIB", title: "Agenda Baru", note: "Keterangan agenda..." },
      ],
    }));
  };

  const handleRemoveItineraryRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index),
    }));
  };

  // Itinerary Templates
  const applySunmoriTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        { time: "05.30 WIB", title: "Kumpul & Briefing di Titik Start", note: "Pengecekan kelengkapan motor, briefing rute, dan pembagian formasi konvoi." },
        { time: "06.15 WIB", title: "Rolling Thunder Menuju Titik Tujuan", note: "Konvoi santai menikmati aspal pagi hari dengan pengawalan Road Captain." },
        { time: "09.00 WIB", title: "Tiba di Objek Tujuan / Rest Area", note: "Ngopi pagi bersama, ramah tamah antar member, dan sesi foto dokumentasi." },
        { time: "11.30 WIB", title: "Selesai & Konvoi Perjalanan Pulang", note: "Persiapan konvoi balik atau pelepasan bebas sesuai rute domisili masing-masing." },
      ],
    }));
    showToast("Template Sunmori berhasil diterapkan ke jadwal!");
  };

  const applyTouringTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        { time: "Hari 1 - 05.30 WIB", title: "Start Basecamp & Etape 1", note: "Briefing safety riding, pembagian regu konvoi, dan start rolling thunder." },
        { time: "Hari 1 - 16.00 WIB", title: "Tiba di Kota Tujuan & Check-in", note: "Check-in penginapan, istirahat, dan makan malam persaudaraan." },
        { time: "Hari 2 - 08.00 WIB", title: "Etape 2: Jelajah Wisata & Baksos", note: "Menyusuri rute panorama alam dan penyerahan santunan bakti sosial." },
        { time: "Hari 2 - 19.00 WIB", title: "Gala Dinner & Api Unggun", note: "Malam ramah tamah persaudaraan, penyerahan pin plakat, dan games." },
        { time: "Hari 3 - 09.00 WIB", title: "Perjalanan Kembali", note: "Pelepasan konvoi pulang menuju domisili masing-masing." },
      ],
    }));
    showToast("Template Touring Multi-Hari berhasil diterapkan ke jadwal!");
  };

  // Handle Facilities (Includes)
  const handleAddFacility = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (formData.includes.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, includes: [...prev.includes, trimmed] }));
    setNewFacilityInput("");
  };

  const handleRemoveFacility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index),
    }));
  };

  // Handle Safety Gears
  const handleAddGear = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (formData.mandatoryGears.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, mandatoryGears: [...prev.mandatoryGears, trimmed] }));
    setNewGearInput("");
  };

  const handleRemoveGear = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mandatoryGears: prev.mandatoryGears.filter((_, i) => i !== index),
    }));
  };

  // Handle Image File Selection & Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);
    setFormError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "events");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengunggah foto ke storage");
      }

      const uploadedUrl = json.data?.url || localUrl;
      setFormData((prev) => ({ ...prev, coverImageUrl: uploadedUrl }));
      setImagePreview(uploadedUrl);
      showToast("Foto utama event berhasil diunggah!");
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle Form Submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || formData.title.length < 5) {
      setFormError("Judul event minimal 5 karakter.");
      return;
    }
    if (!formData.slug.trim()) {
      setFormError("Slug event wajib diisi.");
      return;
    }
    if (!formData.locationName.trim()) {
      setFormError("Nama lokasi titik kumpul wajib diisi.");
      return;
    }
    if (!formData.startTime || !formData.endTime || !formData.registrationDeadline) {
      setFormError("Waktu mulai, waktu selesai, dan batas registrasi wajib ditentukan.");
      return;
    }
    const startIso = toWibIsoString(formData.startTime);
    const endIso = toWibIsoString(formData.endTime);
    const deadlineIso = toWibIsoString(formData.registrationDeadline);

    if (new Date(startIso) >= new Date(endIso)) {
      setFormError("Waktu selesai event harus lebih lama daripada waktu mulai.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id: formData.id,
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        description: formData.description || `Kegiatan resmi ${formData.title}`,
        coverImageUrl: formData.coverImageUrl || null,
        locationName: formData.locationName,
        locationAddress: formData.locationAddress || null,
        mapLink: formData.mapLink || null,
        startTime: startIso,
        endTime: endIso,
        registrationDeadline: deadlineIso,
        capacity: Number(formData.capacity) || 50,
        fee: Number(formData.fee) || 0,
        status: formData.status,
        itinerary: formData.itinerary,
        includes: formData.includes,
        mandatoryGears: formData.mandatoryGears,
      };

      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan event");
      }

      showToast(
        isEditing
          ? "Event berhasil diperbarui beserta jadwal & fasilitas!"
          : "Event baru berhasil diterbitkan dan siap diakses publik!"
      );
      setIsModalOpen(false);
      await fetchEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Event
  const handleDeleteConfirm = async () => {
    if (!deleteEventTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/events?id=${deleteEventTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghapus event");
      }

      showToast(`Event "${deleteEventTarget.title}" berhasil dihapus.`);
      setDeleteEventTarget(null);
      await fetchEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus event";
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Events
  const filteredEvents = React.useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        searchQuery === "" ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        selectedCategory === "ALL" || ev.category === selectedCategory;

      const matchStatus =
        selectedStatus === "ALL" || ev.status === selectedStatus;

      return matchSearch && matchCat && matchStatus;
    });
  }, [events, searchQuery, selectedCategory, selectedStatus]);

  // Aggregate Stats
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === "published").length;
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = events.reduce((sum, e) => sum + e.registeredCount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-md"
              : "bg-red-950/90 text-red-200 border-red-500/40 backdrop-blur-md"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold" className="tracking-widest uppercase font-mono text-[10px]">
            MANAJEMEN EVENT
          </Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1 tracking-tight">
            Kegiatan & Presensi Touring
          </h1>
          <p className="text-xs text-bone-muted mt-0.5 max-w-2xl">
            Publikasi agenda event baru, tambahkan foto featured image, kelola jadwal rundown ekspedisi, paket fasilitas peserta, pantau kuota, dan lakukan pemindaian presensi QR panitia.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchEvents(true)}
            disabled={refreshing}
            className="text-xs border-white/10 hover:border-muted-gold/40 text-bone hover:text-muted-gold"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin text-muted-gold" : ""}`} />
            <span>Sinkron</span>
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={handleOpenCreate}
            className="text-xs font-bold gap-1.5 bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg shadow-muted-gold/15"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Buat Event Baru</span>
          </Button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-white/10 bg-asphalt/70 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <span className="text-[11px] font-mono text-bone-muted uppercase tracking-wider block">Total Event</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-bone">{totalEvents}</span>
              <Calendar className="h-5 w-5 text-muted-gold/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-asphalt/70 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <span className="text-[11px] font-mono text-bone-muted uppercase tracking-wider block">Event Aktif</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">{activeEvents}</span>
              <Sparkles className="h-5 w-5 text-emerald-400/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-asphalt/70 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <span className="text-[11px] font-mono text-bone-muted uppercase tracking-wider block">Akumulasi Kuota</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-bone">{totalCapacity} <span className="text-xs text-bone-muted font-sans font-normal">rider</span></span>
              <Users className="h-5 w-5 text-muted-gold/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-asphalt/70 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <span className="text-[11px] font-mono text-bone-muted uppercase tracking-wider block">Peserta Terdaftar</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-metallic-gold">{totalRegistered}</span>
              <span className="text-xs font-mono text-muted-gold">
                {totalCapacity > 0 ? `${Math.round((totalRegistered / totalCapacity) * 100)}%` : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-charcoal/60 p-3.5 rounded-xl border border-white/10">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-bone-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari event berdasarkan judul, lokasi, atau deskripsi..."
            className="pl-9 bg-asphalt/80 border-white/10 text-xs text-bone placeholder:text-bone-muted/60 focus:border-muted-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter Kategori Event"
            className="h-9 px-3 text-xs bg-asphalt/80 border border-white/10 rounded-md text-bone focus:outline-none focus:border-muted-gold"
          >
            <option value="ALL">Semua Kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter Status Event"
            className="h-9 px-3 text-xs bg-asphalt/80 border border-white/10 rounded-md text-bone focus:outline-none focus:border-muted-gold"
          >
            <option value="ALL">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(searchQuery || selectedCategory !== "ALL" || selectedStatus !== "ALL") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedStatus("ALL");
              }}
              className="text-xs text-bone-muted hover:text-white px-2.5"
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* EVENT LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-muted-gold animate-spin" />
          <p className="text-sm text-bone-muted">Memuat data agenda touring...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-2xl p-12 text-center space-y-3 bg-asphalt/30">
          <Calendar className="h-10 w-10 text-bone-muted/40 mx-auto" />
          <h3 className="text-base font-serif font-bold text-bone">Tidak Ada Event Ditemukan</h3>
          <p className="text-xs text-bone-muted max-w-sm mx-auto">
            Tidak ada event yang sesuai dengan pencarian atau filter yang dipilih. Silakan atur filter atau buat event baru.
          </p>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs font-bold bg-muted-gold hover:bg-muted-gold-hover text-charcoal mt-2"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>Buat Event Pertama</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredEvents.map((event) => {
            const fillPercentage = Math.min(
              100,
              Math.round((event.registeredCount / Math.max(1, event.capacity)) * 100)
            );

            return (
              <Card
                key={event.id}
                className="border-white/10 bg-asphalt/80 hover:border-muted-gold/40 transition-all duration-300 overflow-hidden shadow-xl group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* FEATURED IMAGE BANNER / THUMBNAIL */}
                  <div className="relative w-full md:w-72 lg:w-80 h-52 md:h-auto shrink-0 bg-charcoal overflow-hidden">
                    {event.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-charcoal to-asphalt text-bone-muted/40">
                        <ImageIcon className="h-12 w-12 mb-2 stroke-[1.5]" />
                        <span className="text-[11px] font-mono uppercase tracking-wider">Belum Ada Featured Image</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* OVERLAY BADGES */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={
                          event.status === "published"
                            ? "gold"
                            : event.status === "completed"
                            ? "outline"
                            : event.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] font-mono tracking-wider font-bold shadow-md uppercase"
                      >
                        {event.status}
                      </Badge>

                      <Badge variant="outline" className="text-[10px] bg-black/60 backdrop-blur-sm border-white/20 text-bone">
                        {event.category || "Touring Akbar"}
                      </Badge>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                      <span className="flex items-center gap-1 drop-shadow-md">
                        <Coins className="h-3.5 w-3.5 text-muted-gold" />
                        {event.fee > 0 ? formatRupiah(event.fee) : "Gratis (Member)"}
                      </span>
                    </div>
                  </div>

                  {/* EVENT DETAILS CONTENT */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-muted-gold">
                          Kapasitas: {event.registeredCount} / {event.capacity} Terisi ({fillPercentage}%)
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/events/${event.slug}`}
                            target="_blank"
                            className="text-xs text-bone-muted hover:text-muted-gold transition-colors inline-flex items-center gap-1"
                          >
                            <span>Lihat Publik</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-bone leading-snug group-hover:text-muted-gold transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-xs text-bone-muted line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* INFO CHIPS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-bone-muted pt-2 border-t border-white/5 font-mono">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span className="truncate">
                            {formatDate(event.start_time)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span className="truncate" title={event.location_address || event.location_name}>
                            {event.location_name}
                          </span>
                        </div>
                      </div>

                      {/* HIGHLIGHT: JADWAL & FASILITAS BADGES */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-bone-muted font-mono">
                        <span className="flex items-center gap-1 text-muted-gold">
                          <Navigation className="h-3 w-3" />
                          {event.itinerary?.length || 0} Etape Jadwal
                        </span>
                        <span className="text-white/20">&bull;</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Shirt className="h-3 w-3" />
                          {event.includes?.length || 0} Paket Fasilitas
                        </span>
                      </div>

                      {/* CAPACITY PROGRESS BAR */}
                      <div className="pt-2">
                        <div className="w-full bg-charcoal rounded-full h-2 overflow-hidden border border-white/5">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              fillPercentage >= 90
                                ? "bg-amber-400"
                                : fillPercentage >= 50
                                ? "bg-muted-gold"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${fillPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/admin/events/${event.id}/registrations`}>
                          <Button variant="secondary" size="sm" className="text-xs gap-1.5 border border-white/10 hover:border-muted-gold/40">
                            <Users className="h-3.5 w-3.5 text-muted-gold" />
                            <span>Daftar Peserta ({event.registeredCount})</span>
                          </Button>
                        </Link>

                        <Link href={`/admin/events/${event.id}/attendance`}>
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs font-bold gap-1.5 bg-muted-gold/90 hover:bg-muted-gold text-charcoal"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>Buka Scanner Presensi QR</span>
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(event)}
                          className="text-xs h-8 px-2.5 text-bone hover:text-muted-gold border-white/10 hover:border-muted-gold/40"
                          title="Edit Event, Jadwal & Fasilitas"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteEventTarget(event)}
                          className="text-xs h-8 px-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                          title="Hapus Event"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BUAT EVENT BARU / EDIT EVENT                      */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8 bg-asphalt border border-muted-gold/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-charcoal via-asphalt to-charcoal">
              <div>
                <Badge variant="gold" className="text-[10px] tracking-widest font-mono">
                  {isEditing ? "EDIT DATA EVENT" : "FORM EVENT BARU"}
                </Badge>
                <h2 className="text-2xl font-serif font-bold text-bone mt-1">
                  {isEditing ? "Edit Informasi Event Touring" : "Publikasi Event Touring Baru"}
                </h2>
                <p className="text-xs text-bone-muted mt-0.5">
                  Lengkapi data kegiatan, foto featured image, rundown rute, fasilitas paket, dan safety gear wajib.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-bone-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. FEATURED IMAGE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4" />
                    <span>Featured Image (Foto Utama Event)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-bone-muted hover:text-muted-gold underline font-mono"
                  >
                    {showUrlInput ? "Gunakan Upload File" : "Atau Masukkan URL Gambar"}
                  </button>
                </div>

                {imagePreview ? (
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border-2 border-muted-gold/50 bg-charcoal shadow-lg group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview Foto Event"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold gap-1 bg-black/80 hover:bg-black text-white border border-white/20"
                      >
                        <Upload className="h-3.5 w-3.5 text-muted-gold" />
                        Ganti Foto
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveImage}
                        className="text-xs font-bold gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Foto
                      </Button>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Featured Image Siap Digunakan</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!showUrlInput ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                          uploadingImage
                            ? "border-muted-gold bg-muted-gold/5"
                            : "border-white/20 hover:border-muted-gold hover:bg-white/[0.02]"
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <RefreshCw className="h-8 w-8 text-muted-gold animate-spin" />
                            <p className="text-xs font-medium text-bone">Mengunggah foto ke Cloudflare R2...</p>
                            <span className="text-[10px] text-bone-muted">Harap tunggu beberapa detik</span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-muted-gold/10 flex items-center justify-center text-muted-gold mb-1">
                              <Upload className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold text-bone">
                              Klik untuk memilih 1 Foto Utama Event
                            </p>
                            <p className="text-xs text-bone-muted max-w-sm">
                              Format: JPG, PNG, WEBP, atau AVIF (Maks. 10MB). Foto akan tersimpan di Cloudflare R2 Storage.
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Input
                          type="url"
                          placeholder="https://example.com/foto-touring.jpg"
                          value={formData.coverImageUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({ ...prev, coverImageUrl: val }));
                            setImagePreview(val || null);
                          }}
                          className="bg-charcoal/70 border-white/10 text-xs text-bone focus:border-muted-gold"
                        />
                        <span className="text-[10px] text-bone-muted block">
                          Masukkan URL gambar publik langsung (CDN / Unsplash / Storage).
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>

              {/* 2. INFORMASI UTAMA */}
              <div className="space-y-4 pt-3 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider block">
                  Informasi Utama Event
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-bone">
                      Judul Event <span className="text-red-400">*</span>
                    </label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title: val,
                          slug: isEditing ? prev.slug : slugify(val),
                        }));
                      }}
                      placeholder="Contoh: Touring Jalur Selatan Jawa: Pangandaran - Yogyakarta"
                      className="bg-charcoal/70 border-white/10 text-xs text-bone focus:border-muted-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Slug URL <span className="text-red-400">*</span>
                    </label>
                    <Input
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                      }
                      placeholder="touring-jalur-selatan-2026"
                      className="bg-charcoal/70 border-white/10 text-xs font-mono text-bone focus:border-muted-gold"
                    />
                    <span className="text-[10px] text-bone-muted">
                      Akan diakses melalui /events/{formData.slug || "slug-event"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Kategori Kegiatan <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full h-9 px-3 text-xs bg-charcoal/70 border border-white/10 rounded-md text-bone focus:outline-none focus:border-muted-gold"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. LOKASI & TITIK KUMPUL */}
              <div className="space-y-4 pt-3 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider block">
                  Lokasi & Titik Kumpul
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Nama Titik Kumpul / Lokasi <span className="text-red-400">*</span>
                    </label>
                    <Input
                      required
                      value={formData.locationName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, locationName: e.target.value }))}
                      placeholder="Contoh: Basecamp Puncak, Bogor"
                      className="bg-charcoal/70 border-white/10 text-xs text-bone focus:border-muted-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Link Google Maps (Opsional)
                    </label>
                    <Input
                      type="url"
                      value={formData.mapLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, mapLink: e.target.value }))}
                      placeholder="https://maps.google.com/?q=..."
                      className="bg-charcoal/70 border-white/10 text-xs text-bone focus:border-muted-gold"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-bone">
                      Alamat Lengkap / Catatan Titik Kumpul
                    </label>
                    <Input
                      value={formData.locationAddress}
                      onChange={(e) => setFormData((prev) => ({ ...prev, locationAddress: e.target.value }))}
                      placeholder="Jl. Raya Puncak KM 77, Cisarua, Bogor (Kumpul 05.00 WIB)"
                      className="bg-charcoal/70 border-white/10 text-xs text-bone focus:border-muted-gold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. WAKTU & JADWAL */}
              <div className="space-y-4 pt-3 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider block">
                  Waktu & Batas Pendaftaran
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Waktu Mulai <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                      className="bg-charcoal/70 border-white/10 text-xs font-mono text-bone focus:border-muted-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Waktu Selesai <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                      className="bg-charcoal/70 border-white/10 text-xs font-mono text-bone focus:border-muted-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Batas Registrasi <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.registrationDeadline}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, registrationDeadline: e.target.value }))
                      }
                      className="bg-charcoal/70 border-white/10 text-xs font-mono text-bone focus:border-muted-gold"
                    />
                  </div>
                </div>
              </div>

              {/* 5. KAPASITAS, BIAYA & STATUS */}
              <div className="space-y-4 pt-3 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider block">
                  Kapasitas, Biaya & Status Publikasi
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Kapasitas Kuota (Rider) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      required
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                      }
                      className="bg-charcoal/70 border-white/10 text-xs font-mono text-bone focus:border-muted-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Biaya Pendaftaran (Rp)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step={5000}
                      value={formData.fee}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fee: parseInt(e.target.value) || 0 }))
                      }
                      className="bg-charcoal/70 border-white/10 text-xs font-mono text-bone focus:border-muted-gold"
                    />
                    <span className="text-[10px] text-bone-muted font-mono">
                      {formData.fee > 0 ? formatRupiah(formData.fee) : "0 = Gratis (Khusus Member)"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-bone">
                      Status Publikasi <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as FormState["status"],
                        }))
                      }
                      className="w-full h-9 px-3 text-xs bg-charcoal/70 border border-white/10 rounded-md text-bone focus:outline-none focus:border-muted-gold"
                    >
                      <option value="published">Published (Tayang Publik)</option>
                      <option value="draft">Draft (Disimpan Internal)</option>
                      <option value="completed">Completed (Selesai)</option>
                      <option value="cancelled">Cancelled (Dibatalkan)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. DESKRIPSI EVENT */}
              <div className="space-y-1.5 pt-3 border-t border-white/10">
                <label className="text-xs font-medium text-bone">
                  Deskripsi Lengkap Event
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsikan agenda kegiatan, latar belakang, dan tujuan ekspedisi..."
                  className="w-full p-3 rounded-md bg-charcoal/70 border border-white/10 text-xs text-bone focus:outline-none focus:border-muted-gold resize-y"
                />
              </div>

              {/* 7. JADWAL & RUNDOWN EKSPEDISI (ITINERARY) */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className="h-4 w-4" />
                      <span>Jadwal & Rundown Ekspedisi (Itinerary)</span>
                    </label>
                    <p className="text-[11px] text-bone-muted">
                      Rincian jam, agenda, dan catatan penting per etape konvoi.
                    </p>
                  </div>

                  {/* Preset Template Buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={applySunmoriTemplate}
                      className="text-[10px] h-7 px-2 border-white/15 text-bone-muted hover:text-muted-gold"
                    >
                      Template Sunmori
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={applyTouringTemplate}
                      className="text-[10px] h-7 px-2 border-white/15 text-bone-muted hover:text-muted-gold"
                    >
                      Template Touring 3 Hari
                    </Button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {formData.itinerary.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-charcoal/80 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-muted-gold font-bold">
                          Etape #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItineraryRow(idx)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                          title="Hapus Etape"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-bone-muted block mb-1">
                            Waktu / Jam
                          </label>
                          <Input
                            value={step.time}
                            onChange={(e) => handleItineraryChange(idx, "time", e.target.value)}
                            placeholder="Contoh: 05.30 WIB"
                            className="h-8 text-xs bg-asphalt/80 border-white/10 font-mono text-bone"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-bone-muted block mb-1">
                            Judul Agenda / Titik Singgah
                          </label>
                          <Input
                            value={step.title}
                            onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                            placeholder="Contoh: Start Basecamp & Briefing Safety"
                            className="h-8 text-xs bg-asphalt/80 border-white/10 font-medium text-bone"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-bone-muted block mb-1">
                            Catatan / Keterangan Etape
                          </label>
                          <Input
                            value={step.note}
                            onChange={(e) => handleItineraryChange(idx, "note", e.target.value)}
                            placeholder="Contoh: Briefing rute, doa bersama, dan pembagian formasi konvoi..."
                            className="h-8 text-xs bg-asphalt/80 border-white/10 text-bone-muted"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItineraryRow}
                    className="w-full text-xs border-dashed border-white/20 hover:border-muted-gold text-bone-muted hover:text-muted-gold py-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>Tambah Etape / Jadwal Rundown</span>
                  </Button>
                </div>
              </div>

              {/* 8. FASILITAS & PAKET PESERTA */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div>
                  <label className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="h-4 w-4" />
                    <span>Fasilitas & Paket Peserta</span>
                  </label>
                  <p className="text-[11px] text-bone-muted">
                    Fasilitas yang diperoleh member saat mengikuti kegiatan ini.
                  </p>
                </div>

                {/* CURRENT FACILITIES TAGS */}
                <div className="flex flex-wrap gap-2 min-h-10 p-3 rounded-xl bg-charcoal/50 border border-white/10">
                  {formData.includes.length === 0 ? (
                    <span className="text-xs text-bone-muted/50 italic">Belum ada fasilitas ditambahkan.</span>
                  ) : (
                    formData.includes.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFacility(idx)}
                          className="hover:text-red-300 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* ADD CUSTOM FACILITY INPUT */}
                <div className="flex gap-2">
                  <Input
                    value={newFacilityInput}
                    onChange={(e) => setNewFacilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFacility(newFacilityInput);
                      }
                    }}
                    placeholder="Ketik fasilitas baru (contoh: Makan Siang Pesisir Pantai)..."
                    className="h-8 text-xs bg-charcoal/70 border-white/10 text-bone focus:border-muted-gold"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddFacility(newFacilityInput)}
                    className="h-8 text-xs font-bold bg-muted-gold text-charcoal hover:bg-muted-gold-hover shrink-0"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    <span>Tambah</span>
                  </Button>
                </div>

                {/* QUICK PRESET CHIPS */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-bone-muted block">Klik untuk menambahkan fasilitas populer:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_FACILITIES.map((fac) => (
                      <button
                        key={fac}
                        type="button"
                        onClick={() => handleAddFacility(fac)}
                        disabled={formData.includes.includes(fac)}
                        className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-asphalt hover:border-muted-gold/50 text-bone-muted hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        + {fac}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 9. STANDAR PERLENGKAPAN WAJIB (SAFETY GEAR) */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div>
                  <label className="text-xs font-mono font-bold text-muted-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    <span>Standar Perlengkapan Wajib (Safety Gear)</span>
                  </label>
                  <p className="text-[11px] text-bone-muted">
                    Peralatan riding keselamatan yang wajib dikenakan rider selama touring.
                  </p>
                </div>

                {/* CURRENT GEARS TAGS */}
                <div className="flex flex-wrap gap-2 min-h-10 p-3 rounded-xl bg-charcoal/50 border border-white/10">
                  {formData.mandatoryGears.length === 0 ? (
                    <span className="text-xs text-bone-muted/50 italic">Belum ada standar perlengkapan.</span>
                  ) : (
                    formData.mandatoryGears.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs bg-muted-gold/10 border border-muted-gold/30 text-metallic-gold px-2.5 py-1 rounded-lg"
                      >
                        <CheckCircle2 className="h-3 w-3 text-muted-gold shrink-0" />
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGear(idx)}
                          className="hover:text-red-300 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* ADD CUSTOM GEAR INPUT */}
                <div className="flex gap-2">
                  <Input
                    value={newGearInput}
                    onChange={(e) => setNewGearInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddGear(newGearInput);
                      }
                    }}
                    placeholder="Ketik perlengkapan wajib baru..."
                    className="h-8 text-xs bg-charcoal/70 border-white/10 text-bone focus:border-muted-gold"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddGear(newGearInput)}
                    className="h-8 text-xs font-bold bg-muted-gold text-charcoal hover:bg-muted-gold-hover shrink-0"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    <span>Tambah</span>
                  </Button>
                </div>

                {/* QUICK GEAR PRESETS */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-bone-muted block">Klik untuk menambahkan standar gear:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_GEARS.map((gear) => (
                      <button
                        key={gear}
                        type="button"
                        onClick={() => handleAddGear(gear)}
                        disabled={formData.mandatoryGears.includes(gear)}
                        className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-asphalt hover:border-muted-gold/50 text-bone-muted hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        + {gear}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-xs border-white/10 hover:bg-white/5 text-bone"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="text-xs font-bold bg-muted-gold hover:bg-muted-gold-hover text-charcoal shadow-lg px-5 py-2.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Simpan Perubahan & Fasilitas" : "Publikasikan Event Lengkap"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG: KONFIRMASI HAPUS EVENT                           */}
      {/* ======================================================== */}
      {deleteEventTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-asphalt border border-red-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-bone">Hapus Event Touring?</h3>
              <p className="text-xs text-bone-muted mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus event{" "}
                <strong className="text-white font-medium">&ldquo;{deleteEventTarget.title}&rdquo;</strong>?
                Data pendaftaran dan presensi terkait juga akan dihapus dari sistem.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteEventTarget(null)}
                disabled={deleting}
                className="text-xs border-white/10 text-bone hover:bg-white/5"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Permanen</span>
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
