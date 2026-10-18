"use client";

import * as React from "react";
import {
  Handshake,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Shield,
  Award,
  Filter,
  Eye,
  Gift,
  Calendar,
  MousePointerClick,
  Mail,
  Phone,
  User,
  AlertCircle,
  Building2,
  Tag,
  UploadCloud,
  Loader2,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sponsor, SponsorInquiry, SponsorTier, BusinessCategory } from "@/features/sponsors/types";
import {
  saveSponsorAction,
  deleteSponsorAction,
  toggleSponsorStatusAction,
  updateInquiryStatusAction,
} from "@/features/sponsors/actions";

interface EventOption {
  id: string;
  title: string;
}

interface SponsorsManagementClientProps {
  initialSponsors: Sponsor[];
  initialInquiries: SponsorInquiry[];
  events: EventOption[];
}

const TIER_LABELS: Record<SponsorTier, { label: string; color: string; badgeClass: string }> = {
  main: {
    label: "Main Sponsor",
    color: "#eab308",
    badgeClass: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
  },
  official: {
    label: "Official Partner",
    color: "#6366f1",
    badgeClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/40",
  },
  event: {
    label: "Event Sponsor",
    color: "#38bdf8",
    badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/40",
  },
  supporting: {
    label: "Supporting Partner",
    color: "#10b981",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  },
};

const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  oil_fluids: "Oli & Pelumas Mesin",
  automotive_parts: "Ban & Komponen Motor",
  apparel_gear: "Apparel & Helm Touring",
  workshop_service: "Bengkel & Servis Rekanan",
  hospitality_cafe: "Cafe & Rest Point",
  other: "Lainnya",
};

export function SponsorsManagementClient({
  initialSponsors,
  initialInquiries,
  events,
}: SponsorsManagementClientProps) {
  const [sponsors, setSponsors] = React.useState<Sponsor[]>(initialSponsors);
  const [inquiries, setInquiries] = React.useState<SponsorInquiry[]>(initialInquiries);
  const [activeTab, setActiveTab] = React.useState<"sponsors" | "inquiries">("sponsors");

  // Filtering
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTier, setSelectedTier] = React.useState<string>("all");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formSlug, setFormSlug] = React.useState("");
  const [formTier, setFormTier] = React.useState<SponsorTier>("main");
  const [formCategory, setFormCategory] = React.useState<BusinessCategory>("oil_fluids");
  const [formLogoUrl, setFormLogoUrl] = React.useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formStatus, setFormStatus] = React.useState<"active" | "inactive" | "expired">("active");
  const [formOrder, setFormOrder] = React.useState<number>(1);
  const [formStartDate, setFormStartDate] = React.useState("");
  const [formEndDate, setFormEndDate] = React.useState("");

  // Member Perk Form State
  const [formPerkTitle, setFormPerkTitle] = React.useState("");
  const [formPerkDiscount, setFormPerkDiscount] = React.useState("");
  const [formPerkCode, setFormPerkCode] = React.useState("");
  const [formPerkTerms, setFormPerkTerms] = React.useState("");

  // Assigned Events
  const [formAssignedEvents, setFormAssignedEvents] = React.useState<string[]>([]);

  // Logo Upload & URL Mode State
  const [logoInputMode, setLogoInputMode] = React.useState<"upload" | "url">("upload");
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = React.useState(false);
  const [logoUploadError, setLogoUploadError] = React.useState<string | null>(null);
  const logoFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Banner / Featured Image State
  const [formBannerUrl, setFormBannerUrl] = React.useState("");
  const [bannerInputMode, setBannerInputMode] = React.useState<"upload" | "url">("upload");
  const [isUploadingBanner, setIsUploadingBanner] = React.useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = React.useState(false);
  const [bannerUploadError, setBannerUploadError] = React.useState<string | null>(null);
  const bannerFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Statistics
  const totalActive = sponsors.filter((s) => s.status === "active").length;
  const mainSponsorsCount = sponsors.filter((s) => s.status === "active" && s.tier === "main").length;
  const officialCount = sponsors.filter(
    (s) => s.status === "active" && (s.tier === "official" || s.tier === "supporting")
  ).length;
  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;

  const handleLogoFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoUploadError("File harus berupa gambar (PNG, JPG, SVG, WebP, AVIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLogoUploadError("Ukuran file gambar maksimal 10MB.");
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "sponsors");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && (json.data?.url || json.url)) {
        const uploadedUrl = json.data?.url || json.url;
        setFormLogoUrl(uploadedUrl);
      } else {
        setLogoUploadError(json.message || "Gagal mengunggah gambar logo.");
      }
    } catch {
      setLogoUploadError("Terjadi kesalahan jaringan saat mengunggah logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBannerFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBannerUploadError("File harus berupa gambar (PNG, JPG, SVG, WebP, AVIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setBannerUploadError("Ukuran file gambar maksimal 10MB.");
      return;
    }

    setIsUploadingBanner(true);
    setBannerUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "sponsors");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && (json.data?.url || json.url)) {
        const uploadedUrl = json.data?.url || json.url;
        setFormBannerUrl(uploadedUrl);
      } else {
        setBannerUploadError(json.message || "Gagal mengunggah banner sponsor.");
      }
    } catch {
      setBannerUploadError("Terjadi kesalahan jaringan saat mengunggah banner.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormTier("main");
    setFormCategory("oil_fluids");
    setFormLogoUrl("");
    setFormBannerUrl("");
    setFormWebsiteUrl("");
    setFormDescription("");
    setFormStatus("active");
    setFormOrder(sponsors.length + 1);
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setFormPerkTitle("");
    setFormPerkDiscount("");
    setFormPerkCode("");
    setFormPerkTerms("");
    setFormAssignedEvents([]);
    setLogoInputMode("upload");
    setLogoUploadError(null);
    setBannerInputMode("upload");
    setBannerUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Sponsor) => {
    setEditingId(s.id);
    setFormName(s.name);
    setFormSlug(s.slug);
    setFormTier(s.tier);
    setFormCategory(s.category);
    setFormLogoUrl(s.logoUrl);
    setFormBannerUrl(s.bannerUrl || "");
    setFormWebsiteUrl(s.websiteUrl || "");
    setFormDescription(s.description);
    setFormStatus(s.status);
    setFormOrder(s.order);
    setFormStartDate(s.startDate || "");
    setFormEndDate(s.endDate || "");
    setFormPerkTitle(s.memberPerk?.title || "");
    setFormPerkDiscount(s.memberPerk?.discountText || "");
    setFormPerkCode(s.memberPerk?.promoCode || "");
    setFormPerkTerms(s.memberPerk?.terms || "");
    setFormAssignedEvents(s.assignedEventIds || []);
    setLogoInputMode(
      s.logoUrl?.startsWith("http") && !s.logoUrl?.includes("/uploads/")
        ? "url"
        : "upload"
    );
    setLogoUploadError(null);
    setBannerInputMode(
      s.bannerUrl?.startsWith("http") && !s.bannerUrl?.includes("/uploads/")
        ? "url"
        : "upload"
    );
    setBannerUploadError(null);
    setIsModalOpen(true);
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    const generatedSlug =
      formSlug.trim() ||
      formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const res = await saveSponsorAction({
      id: editingId || undefined,
      name: formName,
      slug: generatedSlug,
      tier: formTier,
      category: formCategory,
      logoUrl: formLogoUrl,
      bannerUrl: formBannerUrl,
      websiteUrl: formWebsiteUrl,
      description: formDescription,
      status: formStatus,
      order: Number(formOrder),
      startDate: formStartDate,
      endDate: formEndDate,
      memberPerkTitle: formPerkTitle,
      memberPerkDiscount: formPerkDiscount,
      memberPerkCode: formPerkCode,
      memberPerkTerms: formPerkTerms,
      assignedEventIds: formAssignedEvents,
    });

    setIsSubmitting(false);

    if (res.success && res.sponsor) {
      if (editingId) {
        setSponsors((prev) => prev.map((item) => (item.id === res.sponsor!.id ? res.sponsor! : item)));
      } else {
        setSponsors((prev) => [...prev, res.sponsor!]);
      }
      setIsModalOpen(false);
      setFeedbackMsg({ type: "success", text: res.message });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: "error", text: res.message });
    }
  };

  const handleDeleteSponsor = async (id: string, name: string) => {
    if (!confirm(`Hapus data sponsor "${name}" secara permanen?`)) return;

    const res = await deleteSponsorAction(id);
    if (res.success) {
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      setFeedbackMsg({ type: "success", text: res.message });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: "error", text: res.message });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const res = await toggleSponsorStatusAction(id);
    if (res.success && res.newStatus) {
      setSponsors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: res.newStatus as any } : s))
      );
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: SponsorInquiry["status"]) => {
    const res = await updateInquiryStatusAction(id, status);
    if (res.success) {
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
    }
  };

  // Filtered sponsors
  const filteredSponsors = sponsors.filter((s) => {
    if (selectedTier !== "all" && s.tier !== selectedTier) return false;
    if (selectedCategory !== "all" && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.memberPerk?.title || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-400">
            <Handshake className="h-4 w-4" />
            <span>Kemitraan & Ekosistem Bisnis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase tracking-tight text-white mt-1">
            Manajemen Sponsorship & Partner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5">
            Atur paket sponsorship, benefit eksklusif anggota, serta pantau prospek proposal kemitraan yang masuk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={openAddModal}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider px-5 py-2.5 shadow-lg shadow-indigo-600/30 gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Sponsor</span>
          </Button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-sans ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/60 border-red-500/40 text-red-300"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Partner</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Handshake className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2">
            {totalActive} <span className="text-xs text-slate-400 font-normal">Aktif</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Dari total {sponsors.length} brand terdaftar</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Main Sponsor</span>
            <div className="h-8 w-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-extrabold text-yellow-400 mt-2">
            {mainSponsorsCount} <span className="text-xs text-slate-400 font-normal">/ 6 Max</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Tampil di Beranda Layer 1</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Official & Support</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2">
            {officialCount} <span className="text-xs text-slate-400 font-normal">Brand</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Dengan program benefit member</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-5 shadow-lg relative overflow-hidden">
          {newInquiriesCount > 0 && (
            <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Prospek Masuk</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2">
            {inquiries.length}{" "}
            {newInquiriesCount > 0 && (
              <span className="text-xs text-rose-400 font-semibold bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-full ml-1">
                {newInquiriesCount} Baru
              </span>
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Permohonan sponsorship publik</p>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex border-b border-white/[0.08] gap-6">
        <button
          onClick={() => setActiveTab("sponsors")}
          className={`pb-3 font-display text-sm font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === "sponsors" ? "text-indigo-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <span>Daftar Sponsor & Partner ({sponsors.length})</span>
          {activeTab === "sponsors" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          className={`pb-3 font-display text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 ${
            activeTab === "inquiries" ? "text-indigo-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <span>Prospek & Pengajuan ({inquiries.length})</span>
          {newInquiriesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
              {newInquiriesCount}
            </span>
          )}
          {activeTab === "inquiries" && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
          )}
        </button>
      </div>

      {/* 4. TAB CONTENT: SPONSORS LIST */}
      {activeTab === "sponsors" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121624] p-4 rounded-2xl border border-white/[0.08]">
            <div className="flex flex-1 items-center gap-3 bg-[#0a0d14] px-3.5 py-2 rounded-xl border border-white/10 max-w-md">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari brand, deskripsi, atau promo member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tier Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Tier:</span>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-[#0a0d14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="all">Semua Tier</option>
                  <option value="main">Main Sponsor</option>
                  <option value="official">Official Partner</option>
                  <option value="event">Event Sponsor</option>
                  <option value="supporting">Supporting Partner</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Kategori:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#0a0d14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="oil_fluids">Oli & Pelumas</option>
                  <option value="automotive_parts">Ban & Komponen</option>
                  <option value="apparel_gear">Apparel & Helm</option>
                  <option value="workshop_service">Bengkel & Servis</option>
                  <option value="hospitality_cafe">Cafe & Rest Point</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sponsors Cards Grid */}
          {filteredSponsors.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-12 text-center">
              <Handshake className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-display font-bold text-white uppercase">Tidak ada sponsor ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter tier Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSponsors.map((s) => {
                const tierInfo = TIER_LABELS[s.tier] || TIER_LABELS.official;
                const isExpired = s.endDate && new Date(s.endDate) < new Date();

                return (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-white/[0.08] bg-[#121624] p-5 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div>
                      {/* Top Bar: Logo & Tier Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="h-14 w-14 rounded-xl border border-white/10 bg-[#0a0d14] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                          {s.logoUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={s.logoUrl}
                              alt={s.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-indigo-400" />
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tierInfo.badgeClass}`}
                          >
                            {tierInfo.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Urutan: #{s.order}
                          </span>
                        </div>
                      </div>

                      {/* Brand Info */}
                      <h3 className="font-display text-lg font-bold text-white uppercase group-hover:text-indigo-300 transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-[11px] font-mono text-indigo-400/90 mt-0.5">
                        {CATEGORY_LABELS[s.category] || "Kemitraan"}
                      </p>

                      <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 font-sans leading-relaxed">
                        {s.description}
                      </p>

                      {/* Member Perk Card (If Available) */}
                      {s.memberPerk && (
                        <div className="mt-3.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold font-sans">
                            <Gift className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>{s.memberPerk.title}</span>
                          </div>
                          <p className="text-[11px] font-mono text-emerald-400 font-bold">
                            {s.memberPerk.discountText}
                          </p>
                          {s.memberPerk.promoCode && (
                            <p className="text-[10px] font-mono text-slate-400">
                              Kode: <span className="text-white bg-black/40 px-1.5 py-0.5 rounded">{s.memberPerk.promoCode}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Contract & Telemetry Footer */}
                      <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1">
                        <div className="flex justify-between items-center">
                          <span>Status:</span>
                          <button
                            onClick={() => handleToggleStatus(s.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                              s.status === "active" && !isExpired
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
                            }`}
                          >
                            {isExpired ? "EXPIRED" : s.status === "active" ? "AKTIF" : "NON-AKTIF"}
                          </button>
                        </div>
                        {s.endDate && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Masa Kontrak:</span>
                            <span className="text-white">{s.endDate}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3 text-indigo-400" />
                            Total Klik:
                          </span>
                          <span className="text-white font-bold">{s.clickCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                      {s.websiteUrl ? (
                        <a
                          href={s.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Website</span>
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-600">No Web Link</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(s)}
                          className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSponsor(s.id, s.name)}
                          className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: INQUIRIES LIST */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#121624] p-12 text-center">
              <Mail className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-display font-bold text-white uppercase">Belum ada pengajuan masuk</p>
              <p className="text-xs text-slate-400 mt-1">
                Formulir pengajuan sponsorship di halaman direktori partner publik akan masuk ke sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => {
                const tierInfo = TIER_LABELS[inq.tierInterest] || TIER_LABELS.official;

                return (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-white/[0.08] bg-[#121624] p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-display text-base font-bold text-white uppercase">
                          {inq.companyName}
                        </h4>
                        <span
                          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierInfo.badgeClass}`}
                        >
                          Minat: {tierInfo.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(inq.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-sans">
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="h-3.5 w-3.5 text-indigo-400" />
                          {inq.contactPerson}
                        </span>
                        <a
                          href={`mailto:${inq.email}`}
                          className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 transition-colors"
                        >
                          <Mail className="h-3.5 w-3.5 text-indigo-400" />
                          {inq.email}
                        </a>
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {inq.phone}
                        </a>
                      </div>

                      <p className="text-xs text-slate-300 bg-[#0a0d14] p-3 rounded-xl border border-white/5 font-sans leading-relaxed">
                        &ldquo;{inq.message}&rdquo;
                      </p>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-400">Status:</span>
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as any)}
                        className={`text-xs font-sans font-semibold rounded-xl px-3 py-1.5 border focus:outline-none ${
                          inq.status === "new"
                            ? "bg-rose-950/60 border-rose-500/40 text-rose-300"
                            : inq.status === "contacted"
                            ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
                            : inq.status === "approved"
                            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}
                      >
                        <option value="new">🔴 Belum Dihubungi</option>
                        <option value="contacted">🟡 Sudah Dihubungi (Follow Up)</option>
                        <option value="approved">🟢 Deal / Disetujui</option>
                        <option value="rejected">⚪ Ditolak / Batal</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL FORM: TAMBAH / EDIT SPONSOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#121624] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative my-6 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white">
                  {editingId ? "Edit Data Sponsor" : "Tambah Sponsor Baru"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lengkapi data profil brand, paket sponsorship, serta benefit eksklusif anggota.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSponsor} className="mt-6 space-y-6">
              {/* Profil Brand */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>1. Profil Utama Brand</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Nama Brand / Perusahaan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Motul Lubricants"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Slug URL (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="motul-lubricants"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Paket / Tier *</label>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as SponsorTier)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="main">Main Sponsor (Beranda Layer 1)</option>
                      <option value="official">Official Partner (Direktori Layer 3)</option>
                      <option value="event">Event Sponsor (Agenda Touring Layer 2)</option>
                      <option value="supporting">Supporting Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Kategori Bisnis *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as BusinessCategory)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="oil_fluids">Oli & Pelumas Mesin</option>
                      <option value="automotive_parts">Ban & Komponen Motor</option>
                      <option value="apparel_gear">Apparel & Helm Touring</option>
                      <option value="workshop_service">Bengkel & Servis Rekanan</option>
                      <option value="hospitality_cafe">Cafe & Rest Point</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Website Resmi / Sosmed */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Website Resmi / Profil Sosmed
                  </label>
                  <input
                    type="url"
                    placeholder="https://brand-sponsor.com"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Logo Sponsor: Dual Mode (Upload File vs URL) */}
                <div className="space-y-2.5 rounded-xl border border-white/[0.08] bg-[#0c0f18] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-200">
                        Logo Sponsor / Brand (Opsional)
                      </label>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Pilih file gambar dari komputer atau masukkan link URL logo (bisa dikosongkan).
                      </p>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="flex items-center gap-1 bg-[#06080e] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setLogoInputMode("upload");
                          setLogoUploadError(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                          logoInputMode === "upload"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Upload Berkas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoInputMode("url");
                          setLogoUploadError(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                          logoInputMode === "url"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span>Input URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Upload File Drag & Drop */}
                  {logoInputMode === "upload" ? (
                    <div>
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoFileUpload(file);
                        }}
                        className="hidden"
                      />

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingLogo(true);
                        }}
                        onDragLeave={() => setIsDraggingLogo(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingLogo(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleLogoFileUpload(file);
                        }}
                        onClick={() => logoFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                          isDraggingLogo
                            ? "border-indigo-500 bg-indigo-950/40"
                            : "border-white/15 bg-[#0a0d14] hover:border-indigo-500/50 hover:bg-white/[0.02]"
                        }`}
                      >
                        {isUploadingLogo ? (
                          <div className="flex flex-col items-center py-2">
                            <Loader2 className="h-7 w-7 text-indigo-400 animate-spin mb-1.5" />
                            <span className="text-xs text-indigo-300 font-sans font-medium">
                              Mengunggah logo ke server...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="h-10 w-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-sans text-slate-200 font-medium">
                                Klik untuk memilih file gambar atau seret file ke sini
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                PNG, SVG, JPG, WebP (Maks 10MB) &bull; Format transparan disarankan
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode 2: Manual URL */
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... atau tautan gambar langsung"
                          value={formLogoUrl}
                          onChange={(e) => setFormLogoUrl(e.target.value)}
                          className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <LinkIcon className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Pastikan link URL mengarah langsung ke berkas gambar online yang aktif.
                      </p>
                    </div>
                  )}

                  {/* Logo Upload Error */}
                  {logoUploadError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{logoUploadError}</span>
                    </div>
                  )}

                  {/* Preview Container */}
                  {formLogoUrl && (
                    <div className="p-3 rounded-xl bg-[#07090f] border border-white/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Logo Preview box with dark backdrop */}
                        <div className="h-14 w-24 rounded-lg bg-black/80 border border-white/10 p-2 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formLogoUrl}
                            alt="Preview Logo Sponsor"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-xs font-mono text-emerald-400 font-semibold">
                              Logo Terpasang
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md font-mono mt-0.5">
                            {formLogoUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {logoInputMode === "upload" && (
                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-sans text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 transition-colors"
                          >
                            Ganti Berkas
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (logoFileInputRef.current) logoFileInputRef.current.value = "";
                            setFormLogoUrl("");
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-sans text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/20 transition-colors"
                          title="Hapus Logo"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Featured Image / Banner Cover (Opsional) */}
                <div className="space-y-2.5 rounded-xl border border-white/[0.08] bg-[#0c0f18] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-200">
                        Featured Image / Banner Cover Sponsor (Opsional)
                      </label>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Gambar banner kartu (disarankan 16:9 landscape resolusi tinggi) untuk kartu direktori & promo.
                      </p>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="flex items-center gap-1 bg-[#06080e] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setBannerInputMode("upload");
                          setBannerUploadError(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                          bannerInputMode === "upload"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Upload Berkas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBannerInputMode("url");
                          setBannerUploadError(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                          bannerInputMode === "url"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span>Input URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Upload File Drag & Drop */}
                  {bannerInputMode === "upload" ? (
                    <div>
                      <input
                        ref={bannerFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerFileUpload(file);
                        }}
                        className="hidden"
                      />

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingBanner(true);
                        }}
                        onDragLeave={() => setIsDraggingBanner(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingBanner(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleBannerFileUpload(file);
                        }}
                        onClick={() => bannerFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                          isDraggingBanner
                            ? "border-indigo-500 bg-indigo-950/40"
                            : "border-white/15 bg-[#0a0d14] hover:border-indigo-500/50 hover:bg-white/[0.02]"
                        }`}
                      >
                        {isUploadingBanner ? (
                          <div className="flex flex-col items-center py-2">
                            <Loader2 className="h-7 w-7 text-indigo-400 animate-spin mb-1.5" />
                            <span className="text-xs text-indigo-300 font-sans font-medium">
                              Mengunggah banner ke server...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="h-9 w-9 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-sans text-slate-200 font-medium">
                                Klik untuk memilih banner atau seret file ke sini
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                JPG, WebP, PNG (Maks 10MB) &bull; Landscape 16:9
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode 2: Manual URL */
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... atau URL foto banner"
                          value={formBannerUrl}
                          onChange={(e) => setFormBannerUrl(e.target.value)}
                          className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <LinkIcon className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  )}

                  {bannerUploadError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{bannerUploadError}</span>
                    </div>
                  )}

                  {/* Banner Preview */}
                  {formBannerUrl && (
                    <div className="p-3 rounded-xl bg-[#07090f] border border-white/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-16 w-28 rounded-lg bg-black/80 border border-white/10 overflow-hidden relative shadow-inner shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formBannerUrl}
                            alt="Preview Banner"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Banner Terhubung
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md font-mono mt-0.5">
                            {formBannerUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {bannerInputMode === "upload" && (
                          <button
                            type="button"
                            onClick={() => bannerFileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-sans text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 transition-colors"
                          >
                            Ganti Berkas
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
                            setFormBannerUrl("");
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-sans text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/20 transition-colors"
                          title="Hapus Banner"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Deskripsi Kemitraan & Brand *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Jelaskan peran sponsor, teknologi produk, atau sejarah kemitraan..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status & Kontrak */}
              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>2. Masa Kontrak & Tampilan</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Status Publik</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="active">Aktif (Tampil)</option>
                      <option value="inactive">Non-Aktif (Draft)</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Tanggal Berakhir</label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Urutan Prioritas Tampil</label>
                  <input
                    type="number"
                    min={1}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-32 bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Benefit Eksklusif Member */}
              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5" />
                  <span>3. Benefit & Voucher Anggota (KTA Digital)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Isi jika sponsor memberikan diskon / promo khusus bagi member Brotherhood MC terverifikasi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Judul Benefit</label>
                    <input
                      type="text"
                      placeholder="Contoh: Diskon Servis Berkala"
                      value={formPerkTitle}
                      onChange={(e) => setFormPerkTitle(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Besaran Diskon</label>
                    <input
                      type="text"
                      placeholder="Contoh: Potongan 15% atau Free Balancing"
                      value={formPerkDiscount}
                      onChange={(e) => setFormPerkDiscount(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Kode Promo (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: MOTUL-BROTHERHOOD"
                      value={formPerkCode}
                      onChange={(e) => setFormPerkCode(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Syarat & Ketentuan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Tunjukkan KTA aktif di kasir"
                      value={formPerkTerms}
                      onChange={(e) => setFormPerkTerms(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border-white/10 text-slate-300 hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider px-6 py-2.5 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? "Menyimpan..." : editingId ? "Perbarui Sponsor" : "Simpan Sponsor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
