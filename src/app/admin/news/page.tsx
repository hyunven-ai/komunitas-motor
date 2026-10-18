"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusCircle,
  CheckCircle2,
  Eye,
  Trash2,
  Globe,
  Loader2,
  Filter,
  Pencil,
  UploadCloud,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { newsArticleSchema, type NewsArticleInput } from "@/features/cms/schemas";
import type { NewsArticleItem } from "@/features/cms/queries";
import { WordPressEditor } from "@/components/admin/wordpress-editor";

export default function AdminNewsPage() {
  const [articles, setArticles] = React.useState<NewsArticleItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "title">("newest");
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Notifications
  const [notification, setNotification] = React.useState<string | null>(null);

  // Modal 1: Create
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [coverUploadLoading, setCoverUploadLoading] = React.useState(false);
  const [coverMode, setCoverMode] = React.useState<"upload" | "url">("upload");

  // Modal 2: Edit
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingArticle, setEditingArticle] = React.useState<NewsArticleItem | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = React.useState(false);
  const [editCoverUploadLoading, setEditCoverUploadLoading] = React.useState(false);
  const [editCoverMode, setEditCoverMode] = React.useState<"upload" | "url">("upload");

  // Modal 3: Delete
  const [articleToDelete, setArticleToDelete] = React.useState<NewsArticleItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Form for Create Article
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewsArticleInput>({
    resolver: zodResolver(newsArticleSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "Ekspedisi & Touring",
      summary: "",
      content: "",
      coverImageUrl:
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
      status: "published",
      authorName: "Divisi Humas Brotherhood",
    },
  });

  const watchCoverImageUrl = watch("coverImageUrl");
  const watchContent = watch("content");

  // Form for Edit Article
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    watch: watchEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<NewsArticleInput>({
    resolver: zodResolver(newsArticleSchema),
  });

  const watchEditCoverImageUrl = watchEdit("coverImageUrl");
  const watchEditContent = watchEdit("content");

  // FETCH ARTICLES FROM DATABASE
  const fetchArticles = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/news");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setArticles(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat berita dari server:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Title change slug generator for Create
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    const generatedSlug = titleVal
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValue("slug", generatedSlug);
  };

  // Title change slug generator for Edit
  const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    const generatedSlug = titleVal
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValueEdit("slug", generatedSlug);
  };

  // COVER UPLOAD FOR CREATE MODAL
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploadLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "news");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setValue("coverImageUrl", data.data.url);
        setNotification("Foto sampul artikel berhasil diunggah ke Cloudflare R2!");
        setTimeout(() => setNotification(null), 3500);
      } else {
        alert(data.message || "Gagal mengunggah foto sampul.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat mengunggah foto.");
    } finally {
      setCoverUploadLoading(false);
    }
  };

  // COVER UPLOAD FOR EDIT MODAL
  const handleEditCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditCoverUploadLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "news");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setValueEdit("coverImageUrl", data.data.url);
        setNotification("Foto sampul artikel berhasil diunggah ke Cloudflare R2!");
        setTimeout(() => setNotification(null), 3500);
      } else {
        alert(data.message || "Gagal mengunggah foto sampul.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat mengunggah foto.");
    } finally {
      setEditCoverUploadLoading(false);
    }
  };

  // SUBMIT CREATE ARTICLE
  const onSubmit = async (data: NewsArticleInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        reset();
        setNotification(json.message || "Artikel berita berhasil disimpan!");
        setTimeout(() => setNotification(null), 4000);
        await fetchArticles();
      } else {
        alert(json.message || "Gagal menyimpan artikel.");
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan artikel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // OPEN EDIT MODAL
  const handleOpenEdit = (art: NewsArticleItem) => {
    setEditingArticle(art);
    resetEdit({
      title: art.title,
      slug: art.slug,
      category: art.category,
      authorName: art.authorName,
      summary: art.summary,
      content: art.content,
      coverImageUrl: art.coverImageUrl || "",
      status: art.status,
    });
    setEditCoverMode("upload");
    setShowEditModal(true);
  };

  // SUBMIT EDIT ARTICLE
  const onSubmitEdit = async (data: NewsArticleInput) => {
    if (!editingArticle) return;
    setIsEditSubmitting(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: editingArticle.id,
          ...data,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowEditModal(false);
        setEditingArticle(null);
        resetEdit();
        setNotification(json.message || "Perubahan artikel berhasil disimpan!");
        setTimeout(() => setNotification(null), 4000);
        await fetchArticles();
      } else {
        const detail = json.errors ? Object.values(json.errors).flat().join(", ") : "";
        alert((json.message || "Gagal menyimpan perubahan artikel.") + (detail ? `\nDetail: ${detail}` : ""));
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat memperbarui artikel.");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // TOGGLE STATUS
  const handleToggleStatus = async (articleId: string, currentStatus: "published" | "draft") => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          articleId,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, status: nextStatus } : a))
        );
        setNotification(json.message || `Status artikel diubah menjadi ${nextStatus.toUpperCase()}`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(json.message || "Gagal mengubah status artikel.");
      }
    } catch {
      alert("Terjadi kesalahan saat mengubah status artikel.");
    }
  };

  // CONFIRM DELETE ARTICLE
  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch("/api/admin/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: articleToDelete.id }),
      });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
        setArticleToDelete(null);
        setNotification(json.message || "Artikel berhasil dihapus.");
        setTimeout(() => setNotification(null), 3500);
        await fetchArticles();
      } else {
        alert(json.message || "Gagal menghapus artikel.");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus artikel.");
    } finally {
      setIsDeleting(false);
    }
  };

  // FILTER, SEARCH & SORT LOGIC
  const filteredAndSorted = React.useMemo(() => {
    let result = articles.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      // default newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [articles, statusFilter, searchQuery, sortBy]);

  // PAGINATION
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const paginatedArticles = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">CMS KONTEN & PUBLIKASI</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Manajemen Berita & Pengumuman
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Publikasikan warta ekspedisi touring, siaran pers resmi, dan artikel etika berkendara langsung ke portal publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchArticles}
            disabled={isLoading}
            className="text-xs border-white/20 hover:border-amber-400 gap-1.5"
            title="Sinkronkan Berita dari Database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            <span>Sinkron</span>
          </Button>
          <Link href="/news" target="_blank">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0 border-white/20 hover:border-muted-gold">
              <Globe className="h-3.5 w-3.5 text-muted-gold" />
              <span>Lihat Halaman Publik</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              reset();
              setCoverMode("upload");
              setShowCreateModal(true);
            }}
            className="text-xs font-bold gap-1.5 shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tulis Artikel Baru</span>
          </Button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 text-xs shadow-md animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-bone-muted" />
          <Input
            placeholder="Cari judul, kategori, atau penulis..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs pl-9 bg-charcoal border-white/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-charcoal p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded transition-all font-medium ${
                statusFilter === "all"
                  ? "bg-amber-400 text-charcoal font-bold shadow"
                  : "text-bone-muted hover:text-bone"
              }`}
            >
              Semua ({articles.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter("published");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded transition-all font-medium ${
                statusFilter === "published"
                  ? "bg-emerald-500 text-charcoal font-bold shadow"
                  : "text-bone-muted hover:text-bone"
              }`}
            >
              Published ({articles.filter((a) => a.status === "published").length})
            </button>
            <button
              onClick={() => {
                setStatusFilter("draft");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded transition-all font-medium ${
                statusFilter === "draft"
                  ? "bg-amber-500 text-charcoal font-bold shadow"
                  : "text-bone-muted hover:text-bone"
              }`}
            >
              Draft ({articles.filter((a) => a.status === "draft").length})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-charcoal px-2 py-1 rounded-lg border border-white/10 text-xs text-bone-muted">
            <ArrowUpDown className="h-3 w-3 text-amber-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-bone focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#121620]">Terbaru</option>
              <option value="oldest" className="bg-[#121620]">Terlama</option>
              <option value="title" className="bg-[#121620]">Judul (A-Z)</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div className="flex items-center gap-1 bg-charcoal px-2 py-1 rounded-lg border border-white/10 text-xs text-bone-muted">
            <span>Tampil:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-bone focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-[#121620]">10</option>
              <option value={20} className="bg-[#121620]">20</option>
              <option value={30} className="bg-[#121620]">30</option>
              <option value={50} className="bg-[#121620]">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <Card className="border-white/10 bg-asphalt/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-charcoal text-bone-muted uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Artikel & Sampul</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Penulis</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Tanggal Rilis</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-bone">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-bone-muted">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <p className="text-xs">Memuat artikel berita dari database...</p>
                  </td>
                </tr>
              ) : paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-bone-muted">
                    <p className="text-sm font-medium">Tidak ada artikel berita ditemukan.</p>
                    <p className="text-xs text-bone-muted/60 mt-1">Coba sesuaikan pencarian atau klik &apos;Tulis Artikel Baru&apos;.</p>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-charcoal/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 rounded-lg overflow-hidden border border-white/15 bg-charcoal shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.coverImageUrl}
                            alt={art.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80";
                            }}
                          />
                        </div>
                        <div className="space-y-0.5 truncate">
                          <Link
                            href={`/news/${art.slug}`}
                            target="_blank"
                            className="hover:text-amber-400 font-bold text-sm text-bone line-clamp-1 block transition-colors"
                          >
                            {art.title}
                          </Link>
                          <span className="font-mono text-[10px] text-bone-muted block truncate">
                            /news/{art.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-300 bg-amber-400/5">
                        {art.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-bone-muted font-medium">
                      {art.authorName}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {art.status === "published" ? (
                        <Badge variant="success" className="text-[9px] font-bold">
                          PUBLISHED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30 font-bold">
                          DRAFT
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-bone-muted font-mono text-[11px]">
                      {art.publishedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(art.id, art.status)}
                          className="h-7 px-2 text-xs text-bone-muted hover:text-amber-400 border border-white/5 hover:bg-white/5"
                          title={art.status === "published" ? "Kembalikan ke Draft" : "Publikasikan ke Publik"}
                        >
                          {art.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(art)}
                          className="h-7 px-2 text-xs text-bone-muted hover:text-amber-400 border border-white/5 hover:bg-white/5"
                          title="Edit Artikel"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Link href={`/news/${art.slug}`} target="_blank">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-bone-muted hover:text-amber-400 border border-white/5 hover:bg-white/5"
                            title="Pratinjau Halaman Publik"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setArticleToDelete(art)}
                          className="h-7 px-2 text-xs text-bone-muted hover:text-red-400 hover:bg-red-950/30 border border-white/5"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredAndSorted.length > 0 && (
          <div className="flex items-center justify-between p-3 border-t border-white/10 bg-charcoal text-xs text-bone-muted">
            <span>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} dari{" "}
              {filteredAndSorted.length} artikel
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2 text-xs border-white/10"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </Button>
              <span className="px-2 font-mono text-bone font-bold">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2 text-xs border-white/10"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: TULIS ARTIKEL BARU                                              */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-amber-400/50 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">EDITOR ARTIKEL RESMI</Badge>
                <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                  Tulis Artikel & Warta Komunitas Baru
                </h3>
                <p className="text-xs text-bone-muted mt-0.5">
                  Artikel yang dipublikasikan akan langsung tampil di portal publik website Brotherhood.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-bone-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">
                  Judul Artikel *
                </Label>
                <Input
                  id="title"
                  placeholder="Contoh: Ekspedisi Lintas Jawa-Bali: Menguji Daya Tahan Rider dan Mesin"
                  {...register("title")}
                  onChange={(e) => {
                    register("title").onChange(e);
                    handleTitleChange(e);
                  }}
                  className="text-xs bg-charcoal"
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="text-xs">
                    Slug URL *
                  </Label>
                  <Input
                    id="slug"
                    placeholder="ekspedisi-lintas-jawa-bali"
                    {...register("slug")}
                    className="text-xs font-mono bg-charcoal"
                  />
                  {errors.slug && (
                    <p className="text-xs text-red-400">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs">
                    Kategori Artikel *
                  </Label>
                  <select
                    id="category"
                    {...register("category")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-amber-400"
                  >
                    <option value="Ekspedisi & Touring">Ekspedisi & Touring</option>
                    <option value="Sosialisasi Safety">Sosialisasi Safety</option>
                    <option value="Organisasi">Organisasi & Musyawarah</option>
                    <option value="Bakti Sosial">Bakti Sosial</option>
                    <option value="Tips & Modifikasi">Tips & Modifikasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="authorName" className="text-xs">
                    Nama Penulis / Redaksi *
                  </Label>
                  <Input
                    id="authorName"
                    placeholder="Divisi Humas & Media"
                    {...register("authorName")}
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs">
                    Status Publikasi *
                  </Label>
                  <select
                    id="status"
                    {...register("status")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-amber-400"
                  >
                    <option value="published">Langsung Publikasikan (Live)</option>
                    <option value="draft">Simpan Sebagai Draft</option>
                  </select>
                </div>
              </div>

              {/* COVER IMAGE WITH R2 UPLOADER */}
              <div className="space-y-2 p-3 rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-bone flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                    Foto Sampul Berita (Cover Image) *
                  </Label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCoverMode("upload")}
                      className={`px-2 py-0.5 rounded transition ${
                        coverMode === "upload"
                          ? "bg-amber-400 text-charcoal font-bold"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Upload File (R2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode("url")}
                      className={`px-2 py-0.5 rounded transition ${
                        coverMode === "url"
                          ? "bg-amber-400 text-charcoal font-bold"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Input URL
                    </button>
                  </div>
                </div>

                <input type="hidden" {...register("coverImageUrl")} />
                {coverMode === "upload" ? (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-amber-400/40 rounded-lg hover:border-amber-400 cursor-pointer bg-black/30 text-xs text-bone hover:text-amber-400 transition w-full">
                      {coverUploadLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                          <span>Mengunggah ke Cloudflare R2...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 text-amber-400" />
                          <span>Pilih foto dari komputer</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={coverUploadLoading}
                        onChange={handleCoverFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={watchCoverImageUrl || ""}
                    onChange={(e) =>
                      setValue("coverImageUrl", e.target.value, { shouldValidate: true })
                    }
                    className="text-xs font-mono bg-charcoal"
                  />
                )}
                {errors.coverImageUrl && (
                  <p className="text-xs text-red-400">{errors.coverImageUrl.message}</p>
                )}

                {watchCoverImageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-16 w-24 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-charcoal">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watchCoverImageUrl}
                        alt="Preview Sampul"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] text-bone-muted space-y-0.5 truncate flex-1">
                      <p className="font-bold text-amber-400">Sampul Terpilih</p>
                      <p className="truncate font-mono">{watchCoverImageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="summary" className="text-xs">
                  Ringkasan Artikel (Cuplikan) *
                </Label>
                <Textarea
                  id="summary"
                  rows={2}
                  placeholder="Tulis 1-2 kalimat ringkasan yang menarik untuk cuplikan berita..."
                  {...register("summary")}
                  className="text-xs bg-charcoal"
                />
                {errors.summary && (
                  <p className="text-xs text-red-400">{errors.summary.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Isi Lengkap Artikel (WordPress Rich Editor) *</span>
                  </Label>
                  <span className="text-[10px] font-mono text-bone-muted">
                    Format H2, H3, Bold, Kutipan & List
                  </span>
                </div>
                <input type="hidden" {...register("content")} />
                <WordPressEditor
                  value={watchContent || ""}
                  onChange={(val) => setValue("content", val, { shouldValidate: true })}
                  placeholder="Tuliskan isi lengkap artikel narasi di sini. Gunakan tombol H2 & H3 di atas untuk membuat sub-judul..."
                  minHeight="240px"
                />
                {errors.content && (
                  <p className="text-xs text-red-400">{errors.content.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs border-white/20"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || coverUploadLoading}
                  className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan Artikel...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Simpan Artikel</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT ARTIKEL BERITA                                              */}
      {/* ========================================================================= */}
      {showEditModal && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-amber-400/50 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">EDIT ARTIKEL BERITA</Badge>
                <h3 className="font-serif font-black uppercase text-lg text-bone mt-1">
                  Ubah Konten & Publikasi Artikel
                </h3>
                <p className="text-xs text-bone-muted mt-0.5">
                  Perbarui judul, foto sampul, kategori, isi narasi, atau status publikasi artikel.
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isEditSubmitting}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-bone-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitEdit(onSubmitEdit, (errors) => {
                console.warn("Edit modal validation errors:", errors);
              })}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs">
                  Judul Artikel *
                </Label>
                <Input
                  id="edit-title"
                  {...registerEdit("title")}
                  onChange={(e) => {
                    registerEdit("title").onChange(e);
                    handleEditTitleChange(e);
                  }}
                  className="text-xs bg-charcoal"
                />
                {errorsEdit.title && (
                  <p className="text-xs text-red-400">{errorsEdit.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-slug" className="text-xs">
                    Slug URL *
                  </Label>
                  <Input
                    id="edit-slug"
                    {...registerEdit("slug")}
                    className="text-xs font-mono bg-charcoal"
                  />
                  {errorsEdit.slug && (
                    <p className="text-xs text-red-400">{errorsEdit.slug.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-category" className="text-xs">
                    Kategori Artikel *
                  </Label>
                  <select
                    id="edit-category"
                    {...registerEdit("category")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-amber-400"
                  >
                    <option value="Ekspedisi & Touring">Ekspedisi & Touring</option>
                    <option value="Sosialisasi Safety">Sosialisasi Safety</option>
                    <option value="Organisasi">Organisasi & Musyawarah</option>
                    <option value="Bakti Sosial">Bakti Sosial</option>
                    <option value="Tips & Modifikasi">Tips & Modifikasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-authorName" className="text-xs">
                    Nama Penulis / Redaksi *
                  </Label>
                  <Input
                    id="edit-authorName"
                    {...registerEdit("authorName")}
                    className="text-xs bg-charcoal"
                  />
                  {errorsEdit.authorName && (
                    <p className="text-xs text-red-400">{errorsEdit.authorName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-status" className="text-xs">
                    Status Publikasi *
                  </Label>
                  <select
                    id="edit-status"
                    {...registerEdit("status")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-amber-400"
                  >
                    <option value="published">Langsung Publikasikan (Live)</option>
                    <option value="draft">Simpan Sebagai Draft</option>
                  </select>
                </div>
              </div>

              {/* COVER IMAGE EDIT */}
              <div className="space-y-2 p-3 rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-bone flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                    Foto Sampul Berita (Cover Image) *
                  </Label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setEditCoverMode("upload")}
                      className={`px-2 py-0.5 rounded transition ${
                        editCoverMode === "upload"
                          ? "bg-amber-400 text-charcoal font-bold"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Upload File (R2)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCoverMode("url")}
                      className={`px-2 py-0.5 rounded transition ${
                        editCoverMode === "url"
                          ? "bg-amber-400 text-charcoal font-bold"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Input URL
                    </button>
                  </div>
                </div>

                <input type="hidden" {...registerEdit("coverImageUrl")} />
                {editCoverMode === "upload" ? (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-amber-400/40 rounded-lg hover:border-amber-400 cursor-pointer bg-black/30 text-xs text-bone hover:text-amber-400 transition w-full">
                      {editCoverUploadLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                          <span>Mengunggah ke Cloudflare R2...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 text-amber-400" />
                          <span>Pilih foto baru dari komputer</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={editCoverUploadLoading}
                        onChange={handleEditCoverFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={watchEditCoverImageUrl || ""}
                    onChange={(e) =>
                      setValueEdit("coverImageUrl", e.target.value, { shouldValidate: true })
                    }
                    className="text-xs font-mono bg-charcoal"
                  />
                )}
                {errorsEdit.coverImageUrl && (
                  <p className="text-xs text-red-400">{errorsEdit.coverImageUrl.message}</p>
                )}

                {watchEditCoverImageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-16 w-24 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-charcoal">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watchEditCoverImageUrl}
                        alt="Preview Sampul"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] text-bone-muted space-y-0.5 truncate flex-1">
                      <p className="font-bold text-amber-400">Sampul Terpilih</p>
                      <p className="truncate font-mono">{watchEditCoverImageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-summary" className="text-xs">
                  Ringkasan Artikel (Cuplikan) *
                </Label>
                <Textarea
                  id="edit-summary"
                  rows={2}
                  {...registerEdit("summary")}
                  className="text-xs bg-charcoal"
                />
                {errorsEdit.summary && (
                  <p className="text-xs text-red-400">{errorsEdit.summary.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-content" className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Isi Lengkap Artikel (WordPress Rich Editor) *</span>
                  </Label>
                  <span className="text-[10px] font-mono text-bone-muted">
                    Format H2, H3, Bold, Kutipan & List
                  </span>
                </div>
                <input type="hidden" {...registerEdit("content")} />
                <WordPressEditor
                  value={watchEditContent || ""}
                  onChange={(val) => setValueEdit("content", val, { shouldValidate: true })}
                  placeholder="Perbarui narasi artikel di sini. Gunakan tombol H2 & H3 di atas untuk membuat sub-judul..."
                  minHeight="260px"
                />
                {errorsEdit.content && (
                  <p className="text-xs text-red-400">{errorsEdit.content.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs border-white/20"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isEditSubmitting || editCoverUploadLoading}
                  className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20"
                >
                  {isEditSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KONFIRMASI HAPUS ARTIKEL                                         */}
      {/* ========================================================================= */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif font-black uppercase text-base text-bone">
                  Hapus Artikel Berita?
                </h3>
                <p className="text-[11px] text-bone-muted truncate max-w-[260px]">
                  {articleToDelete.title}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Tindakan ini permanen
              </p>
              <p className="text-[11px] text-red-200/80 leading-relaxed">
                Artikel akan dihapus dari portal publik Brotherhood.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setArticleToDelete(null)}
                className="text-xs border-white/20 hover:border-white text-bone hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Hapus Artikel</span>
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
