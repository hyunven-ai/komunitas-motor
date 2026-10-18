"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FolderPlus,
  MapPin,
  Eye,
  Trash2,
  CheckCircle2,
  Globe,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  Copy,
  Check,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  AlertCircle,
  Pencil,
  LayoutGrid,
  List,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { galleryAlbumSchema, type GalleryAlbumInput } from "@/features/cms/schemas";
import {
  createGalleryAlbumAction,
  deleteGalleryAlbumAction,
} from "@/features/cms/actions";

interface AdminAlbum {
  id: string;
  slug: string;
  title: string;
  category?: string;
  location: string;
  date: string;
  photoCount: number;
  description: string;
  coverImageUrl: string;
  isPublic: boolean;
  photos?: { url: string; caption?: string; key?: string }[];
}

const CATEGORY_PRESETS = [
  "Touring Resmi",
  "Ekspedisi Gunung",
  "Jalur Pantai",
  "Lintas Pulau",
  "Bakti Sosial",
  "Sunmori & Morning Ride",
  "Kopdar & Gathering",
];

interface UploadedMediaItem {
  id: string;
  key?: string;
  url: string;
  filename: string;
  size: number;
  albumSlug?: string;
  caption?: string;
  uploadedAt: string;
  storage: "cloudflare-r2" | "local-storage";
}

interface FileToUpload {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  status: "idle" | "uploading" | "success" | "error";
  uploadedUrl?: string;
  errorMsg?: string;
}

const INITIAL_ALBUMS: AdminAlbum[] = [
  {
    id: "alb-01",
    slug: "ekspedisi-dieng-plateau-2026",
    title: "Ekspedisi Dieng Plateau: Kabut Negeri Atas Awan",
    location: "Wonosobo - Banjarnegara",
    date: "Oktober 2026",
    photoCount: 64,
    description:
      "Dokumentasi barisan konvoi saat melintasi tanjakan ekstrem Sikatok dan penyerahan santunan pendidikan.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    isPublic: true,
  },
  {
    id: "alb-02",
    slug: "jalur-kemenyan-karang-hawu",
    title: "Jelajah Jalur Kemenyan & Pantai Karang Hawu",
    location: "Pelabuhan Ratu, Sukabumi",
    date: "Agustus 2026",
    photoCount: 48,
    description:
      "Pesona aspal pesisir laut selatan dan keakraban api unggun kopdar wajib malam kemerdekaan.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    isPublic: true,
  },
  {
    id: "alb-03",
    slug: "touring-lintas-flores-kelimutu",
    title: "Touring Lintas Flores & Kelimutu Tri-Color",
    location: "Labuan Bajo - Ende, NTT",
    date: "Mei 2026",
    photoCount: 112,
    description:
      "Ekspedisi jarak jauh lintas pulau rider Brotherhood mengarungi medan perbukitan eksotis Nusa Tenggara Timur.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=800&q=80",
    isPublic: true,
  },
];

export default function AdminGalleryPage() {
  const [activeTab, setActiveTab] = React.useState<"albums" | "media">("albums");
  const [albums, setAlbums] = React.useState<AdminAlbum[]>(INITIAL_ALBUMS);
  const [isLoadingAlbums, setIsLoadingAlbums] = React.useState<boolean>(true);
  const [mediaList, setMediaList] = React.useState<UploadedMediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = React.useState<boolean>(true);

  // Modals state
  const [showAddAlbumModal, setShowAddAlbumModal] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<UploadedMediaItem | null>(null);
  const [albumToDelete, setAlbumToDelete] = React.useState<AdminAlbum | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // EDIT ALBUM STATE
  const [showEditAlbumModal, setShowEditAlbumModal] = React.useState(false);
  const [editingAlbum, setEditingAlbum] = React.useState<AdminAlbum | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editSlug, setEditSlug] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("Touring Resmi");
  const [editLocation, setEditLocation] = React.useState("");
  const [editDate, setEditDate] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editCoverImageUrl, setEditCoverImageUrl] = React.useState("");
  const [editIsPublic, setEditIsPublic] = React.useState(true);
  const [editPhotos, setEditPhotos] = React.useState<{ url: string; caption?: string; key?: string }[]>([]);
  const [isEditSubmitting, setIsEditSubmitting] = React.useState(false);
  const [editCoverUploadLoading, setEditCoverUploadLoading] = React.useState(false);
  const [editCoverMode, setEditCoverMode] = React.useState<"upload" | "url">("upload");

  // SORT, VIEW MODE (LIST/GRID), SEARCH & ITEMS PER PAGE (10, 20, 30, 50)
  const [albumViewMode, setAlbumViewMode] = React.useState<"grid" | "list">("grid");
  const [albumSortBy, setAlbumSortBy] = React.useState<string>("newest");
  const [albumItemsPerPage, setAlbumItemsPerPage] = React.useState<number>(10);
  const [albumCurrentPage, setAlbumCurrentPage] = React.useState<number>(1);
  const [albumSearchQuery, setAlbumSearchQuery] = React.useState<string>("");

  // Multi-selection state for batch delete
  const [selectedMediaKeys, setSelectedMediaKeys] = React.useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = React.useState(false);

  // Notifications
  const [notification, setNotification] = React.useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  // BULK UPLOAD QUEUE STATE (With live image preview & review)
  const [filesQueue, setFilesQueue] = React.useState<FileToUpload[]>([]);
  const [targetAlbum, setTargetAlbum] = React.useState<string>("");
  const [globalCaption, setGlobalCaption] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = React.useState<number>(0);

  // Upload state for Cover Image in Add Album modal
  const [coverUploadLoading, setCoverUploadLoading] = React.useState(false);
  const [coverMode, setCoverMode] = React.useState<"upload" | "url">("upload");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // PERSISTENCE 1: Fetch live photos directly from Cloudflare R2 on mount & refresh
  const fetchMedia = React.useCallback(async () => {
    try {
      setIsLoadingMedia(true);
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaList(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar media Cloudflare R2:", err);
    } finally {
      setIsLoadingMedia(false);
    }
  }, []);

  // PERSISTENCE 2: Fetch real albums from Supabase database on mount & refresh
  const fetchAlbums = React.useCallback(async () => {
    try {
      setIsLoadingAlbums(true);
      const res = await fetch("/api/admin/albums");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAlbums(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat album galeri dari server:", err);
    } finally {
      setIsLoadingAlbums(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMedia();
    fetchAlbums();
  }, [fetchMedia, fetchAlbums]);

  // React Hook Form for Add Album
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GalleryAlbumInput>({
    resolver: zodResolver(galleryAlbumSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "Touring Resmi",
      location: "",
      date: "November 2026",
      description: "",
      coverImageUrl:
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
      isPublic: true,
      photoCount: 1,
    },
  });

  const currentCoverUrl = watch("coverImageUrl");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    const generatedSlug = titleVal
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValue("slug", generatedSlug);
  };

  // Upload single file for Album Cover
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploadLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "covers");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setValue("coverImageUrl", data.data.url);
        setNotification("Foto sampul berhasil diunggah ke Cloudflare R2!");
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

  // Submit Album Form
  const onSubmitAlbum = async (data: GalleryAlbumInput) => {
    const res = await createGalleryAlbumAction(data);
    if (res.success) {
      // Re-fetch albums from Supabase to guarantee permanent persistence
      await fetchAlbums();
      setShowAddAlbumModal(false);
      reset();
      setNotification(res.message);
      setTimeout(() => setNotification(null), 4000);
    } else {
      alert(res.message || "Gagal membuat album.");
    }
  };

  // EDIT ALBUM HANDLERS
  const handleOpenEditModal = (album: AdminAlbum) => {
    setEditingAlbum(album);
    setEditTitle(album.title);
    setEditSlug(album.slug);
    setEditCategory(album.category || "Touring Resmi");
    setEditLocation(album.location);
    setEditDate(album.date || "Oktober 2026");
    setEditDescription(album.description);
    setEditCoverImageUrl(album.coverImageUrl);
    setEditIsPublic(album.isPublic);
    setEditPhotos(album.photos || []);
    setEditCoverMode("upload");
    setShowEditAlbumModal(true);
  };

  const handleEditCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditCoverUploadLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "covers");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setEditCoverImageUrl(data.data.url);
        setNotification("Foto sampul berhasil diunggah ke Cloudflare R2!");
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

  const handleSubmitEditAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;

    if (!editTitle.trim()) {
      alert("Judul album tidak boleh kosong.");
      return;
    }

    try {
      setIsEditSubmitting(true);
      const res = await fetch("/api/admin/albums", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit_album",
          albumId: editingAlbum.id,
          albumSlug: editingAlbum.slug,
          title: editTitle.trim(),
          newSlug: editSlug.trim() || editingAlbum.slug,
          category: editCategory.trim(),
          location: editLocation.trim(),
          date: editDate.trim(),
          description: editDescription.trim(),
          coverImageUrl: editCoverImageUrl,
          isPublic: editIsPublic,
          photos: editPhotos,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(data.message || "Perubahan album berhasil disimpan!");
        setTimeout(() => setNotification(null), 4000);
        setShowEditAlbumModal(false);
        setEditingAlbum(null);
        await fetchAlbums();
      } else {
        alert(data.message || "Gagal menyimpan perubahan album.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat menyimpan perubahan album.");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // ALBUMS FILTERING, SORTING, AND PAGINATION
  const processedAlbums = React.useMemo(() => {
    let result = [...albums];
    if (albumSearchQuery.trim()) {
      const q = albumSearchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }
    switch (albumSortBy) {
      case "oldest":
        result.reverse();
        break;
      case "title_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "photos_desc":
        result.sort((a, b) => (b.photoCount || 0) - (a.photoCount || 0));
        break;
      case "photos_asc":
        result.sort((a, b) => (a.photoCount || 0) - (b.photoCount || 0));
        break;
      case "newest":
      default:
        // default order from API
        break;
    }
    return result;
  }, [albums, albumSearchQuery, albumSortBy]);

  const totalAlbumPages = Math.ceil(processedAlbums.length / albumItemsPerPage) || 1;
  const paginatedAlbums = React.useMemo(() => {
    const start = (albumCurrentPage - 1) * albumItemsPerPage;
    return processedAlbums.slice(start, start + albumItemsPerPage);
  }, [processedAlbums, albumCurrentPage, albumItemsPerPage]);

  // BULK FILE SELECTION WITH LIVE IMAGE PREVIEW (Review Sebelum Upload)
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const newQueueItems: FileToUpload[] = newFiles.map((file, idx) => ({
      id: `queue-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
      status: "idle",
    }));

    setFilesQueue((prev) => [...prev, ...newQueueItems]);

    // Reset input so user can pick again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      const newQueueItems: FileToUpload[] = newFiles.map((file, idx) => ({
        id: `queue-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
        status: "idle",
      }));
      setFilesQueue((prev) => [...prev, ...newQueueItems]);
    }
  };

  // Remove individual photo from queue before upload
  const handleRemoveFromQueue = (id: string) => {
    setFilesQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Clear all queued files
  const handleClearQueue = () => {
    filesQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setFilesQueue([]);
  };

  // Update individual caption in queue
  const handleUpdateItemCaption = (id: string, caption: string) => {
    setFilesQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption } : item))
    );
  };

  // BULK UPLOAD EXECUTION
  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filesQueue.length === 0) {
      alert("Pilih minimal satu file gambar untuk diunggah.");
      return;
    }

    setIsUploading(true);
    const successfulItems: UploadedMediaItem[] = [];

    for (let i = 0; i < filesQueue.length; i++) {
      const item = filesQueue[i];

      // Mark this item as uploading
      setCurrentUploadIndex(i + 1);
      setFilesQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "uploading" } : it))
      );

      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("folder", "gallery");

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const result = await res.json();

        if (result.success && result.data?.url) {
          // Success
          setFilesQueue((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "success", uploadedUrl: result.data.url }
                : it
            )
          );

          successfulItems.push({
            id: result.data.key || `med-${Date.now()}-${i}`,
            key: result.data.key,
            url: result.data.url,
            filename: item.file.name,
            size: item.file.size,
            albumSlug: targetAlbum || undefined,
            caption: item.caption || globalCaption || item.file.name,
            uploadedAt: "Hari ini",
            storage: result.data.storage || "cloudflare-r2",
          });
        } else {
          // Failure
          setFilesQueue((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: "error",
                    errorMsg: result.message || "Gagal mengunggah",
                  }
                : it
            )
          );
        }
      } catch (err: unknown) {
        setFilesQueue((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "error",
                  errorMsg: err instanceof Error ? err.message : "Error koneksi",
                }
              : it
          )
        );
      }
    }

    if (successfulItems.length > 0) {
      // Refresh media list directly from Cloudflare R2
      await fetchMedia();

      // If target album was chosen, link photos permanently to database album
      if (targetAlbum) {
        try {
          await fetch("/api/admin/albums", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              albumSlug: targetAlbum,
              action: "add_photos",
              photoUrls: successfulItems.map((it) => it.url),
            }),
          });
        } catch (albumErr) {
          console.error("Gagal menautkan foto ke album:", albumErr);
        }
        // Refresh albums from database
        await fetchAlbums();
      }

      setNotification(
        `Sukses mengunggah ${successfulItems.length} foto ke Cloudflare R2 Storage!`
      );
      setTimeout(() => setNotification(null), 5000);

      // Clean up after 1.5 seconds if all succeeded
      setTimeout(() => {
        handleClearQueue();
        setGlobalCaption("");
        setShowUploadModal(false);
      }, 1200);
    }

    setIsUploading(false);
  };

  // MULTI-SELECTION HANDLERS
  const toggleSelectMedia = (key: string) => {
    setSelectedMediaKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllMedia = () => {
    if (selectedMediaKeys.length === mediaList.length) {
      setSelectedMediaKeys([]);
    } else {
      setSelectedMediaKeys(mediaList.map((m) => m.key || m.id));
    }
  };

  // CONFIRM SINGLE PHOTO DELETE
  const handleConfirmSingleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: itemToDelete.key || itemToDelete.id,
          url: itemToDelete.url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const deletedKey = itemToDelete.key || itemToDelete.id;
        setMediaList((prev) =>
          prev.filter((m) => m.id !== itemToDelete.id && m.key !== deletedKey)
        );
        setSelectedMediaKeys((prev) => prev.filter((k) => k !== deletedKey));
        setItemToDelete(null);
        setNotification("Foto berhasil dihapus permanen dari Cloudflare R2.");
        setTimeout(() => setNotification(null), 3500);
      } else {
        alert(data.message || "Gagal menghapus foto.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menghapus foto.");
    } finally {
      setIsDeleting(false);
    }
  };

  // CONFIRM BATCH PHOTOS DELETE
  const handleConfirmBatchDelete = async () => {
    if (selectedMediaKeys.length === 0) return;
    try {
      setIsDeleting(true);
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: selectedMediaKeys,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMediaList((prev) =>
          prev.filter((m) => !selectedMediaKeys.includes(m.key || m.id))
        );
        const count = selectedMediaKeys.length;
        setSelectedMediaKeys([]);
        setShowBatchDeleteModal(false);
        setNotification(`${count} foto berhasil dihapus permanen dari Cloudflare R2.`);
        setTimeout(() => setNotification(null), 3500);
      } else {
        alert(data.message || "Gagal menghapus foto terpilih.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menghapus foto terpilih.");
    } finally {
      setIsDeleting(false);
    }
  };

  // CONFIRM ALBUM DELETE
  const handleConfirmAlbumDelete = async () => {
    if (!albumToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch("/api/admin/albums", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: albumToDelete.id,
          slug: albumToDelete.slug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlbums((prev) =>
          prev.filter((a) => a.id !== albumToDelete.id && a.slug !== albumToDelete.slug)
        );
        setAlbumToDelete(null);
        setNotification(data.message || "Album dokumentasi berhasil dihapus.");
        setTimeout(() => setNotification(null), 3500);
        await fetchAlbums();
      } else {
        alert(data.message || "Gagal menghapus album.");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus album.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const totalQueueSize = filesQueue.reduce((acc, it) => acc + it.file.size, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">CMS DOKUMENTASI & MEDIA</Badge>
          <h1 className="text-3xl font-display font-extrabold uppercase text-bone mt-1">
            Galeri Dokumentasi & Media Manager
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Unggah foto dokumentasi kegiatan touring ke Cloudflare R2 Storage, kelola album, dan publikasikan ke galeri resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/gallery" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 shrink-0 border-white/20 hover:border-white"
            >
              <Globe className="h-3.5 w-3.5 text-muted-gold" />
              <span>Lihat Galeri Publik</span>
              <ExternalLink className="h-3 w-3 text-bone-muted" />
            </Button>
          </Link>

          {/* Bulk Upload Button */}
          <Button
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="text-xs font-bold gap-1.5 shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 text-charcoal hover:brightness-110 shadow-lg shadow-amber-500/20"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Foto Baru (Bulk)</span>
          </Button>

          {/* Buat Album Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddAlbumModal(true)}
            className="text-xs font-bold gap-1.5 shrink-0 border-muted-gold/50 text-muted-gold hover:bg-muted-gold/10"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Buat Album Baru</span>
          </Button>

          {/* Sync Albums Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAlbums}
            disabled={isLoadingAlbums}
            className="text-xs font-bold gap-1.5 shrink-0 border-white/20 text-bone hover:text-white"
            title="Sinkronkan Album dari Database Supabase"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAlbums ? "animate-spin text-amber-400" : ""}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 text-xs shadow-md">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("albums")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "albums"
              ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Daftar Album Dokumentasi ({albums.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "media"
              ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
              : "text-bone-muted hover:text-bone hover:bg-white/5"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Media Library & Uploads ({mediaList.length})</span>
        </button>
      </div>

      {/* TAB 1: ALBUM SECTION WITH TOOLBAR, SORT, GRID/LIST & PAGINATION */}
      {activeTab === "albums" && (
        isLoadingAlbums ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-white/10 bg-asphalt/40 space-y-3">
            <Loader2 className="h-7 w-7 text-amber-400 animate-spin" />
            <p className="text-xs text-bone-muted">Memuat album galeri dari database Supabase...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* TOOLBAR: SEARCH, SORT, ITEMS PER PAGE, GRID/LIST VIEW TOGGLE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black/40 p-3.5 rounded-xl border border-white/10 text-xs">
              {/* Left: Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-bone-muted" />
                <Input
                  type="text"
                  placeholder="Cari album berdasarkan judul, lokasi..."
                  value={albumSearchQuery}
                  onChange={(e) => {
                    setAlbumSearchQuery(e.target.value);
                    setAlbumCurrentPage(1);
                  }}
                  className="pl-9 h-8 text-xs bg-asphalt/60 border-white/10 focus:border-amber-400"
                />
                {albumSearchQuery && (
                  <button
                    onClick={() => {
                      setAlbumSearchQuery("");
                      setAlbumCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bone-muted hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Right controls: Sort, Items Per Page, Grid/List view toggle */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sort Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-bone-muted font-medium shrink-0 flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3 text-muted-gold" />
                    <span>Urutkan:</span>
                  </span>
                  <select
                    value={albumSortBy}
                    onChange={(e) => {
                      setAlbumSortBy(e.target.value);
                      setAlbumCurrentPage(1);
                    }}
                    className="h-8 rounded-lg bg-asphalt/80 border border-white/10 px-2.5 text-xs text-bone focus:border-amber-400 outline-none cursor-pointer"
                  >
                    <option value="newest">Terbaru (Default)</option>
                    <option value="oldest">Terlama</option>
                    <option value="title_asc">Judul (A - Z)</option>
                    <option value="title_desc">Judul (Z - A)</option>
                    <option value="photos_desc">Foto Terbanyak</option>
                    <option value="photos_asc">Foto Tersedikit</option>
                  </select>
                </div>

                {/* Per-Page Selector (10, 20, 30, 50) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-bone-muted font-medium shrink-0">Tampilkan:</span>
                  <select
                    value={albumItemsPerPage}
                    onChange={(e) => {
                      setAlbumItemsPerPage(Number(e.target.value));
                      setAlbumCurrentPage(1);
                    }}
                    className="h-8 rounded-lg bg-asphalt/80 border border-white/10 px-2 text-xs text-bone focus:border-amber-400 outline-none cursor-pointer"
                  >
                    <option value={10}>10 item</option>
                    <option value={20}>20 item</option>
                    <option value={30}>30 item</option>
                    <option value={50}>50 item</option>
                  </select>
                </div>

                {/* List / Grid Toggle */}
                <div className="flex items-center p-0.5 rounded-lg border border-white/10 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setAlbumViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs ${
                      albumViewMode === "grid"
                        ? "bg-amber-400 text-charcoal font-bold shadow-sm"
                        : "text-bone-muted hover:text-bone"
                    }`}
                    title="Tampilan Kotak Grid"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlbumViewMode("list")}
                    className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs ${
                      albumViewMode === "list"
                        ? "bg-amber-400 text-charcoal font-bold shadow-sm"
                        : "text-bone-muted hover:text-bone"
                    }`}
                    title="Tampilan Tabel List"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* EMPTY STATE */}
            {processedAlbums.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-14 rounded-xl border border-dashed border-white/15 bg-asphalt/30 space-y-3 text-center">
                <Layers className="h-10 w-10 text-muted-gold/50" />
                <h4 className="font-display font-bold text-base text-bone">
                  Tidak Ada Album Ditemukan
                </h4>
                <p className="text-xs text-bone-muted max-w-sm">
                  {albumSearchQuery
                    ? `Tidak ada album yang cocok dengan kata kunci "${albumSearchQuery}".`
                    : "Belum ada album dokumentasi yang dibuat."}
                </p>
                {albumSearchQuery ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAlbumSearchQuery("");
                      setAlbumCurrentPage(1);
                    }}
                    className="text-xs border-white/20 hover:border-amber-400 text-bone"
                  >
                    Reset Pencarian
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowAddAlbumModal(true)}
                    className="text-xs font-bold gap-1.5 bg-amber-400 text-charcoal hover:bg-amber-300"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    <span>Buat Album Sekarang</span>
                  </Button>
                )}
              </div>
            ) : albumViewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAlbums.map((album) => (
                  <Card
                    key={album.id}
                    className="border-white/10 bg-asphalt/60 overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-colors"
                  >
                    <div>
                      <div className="h-48 overflow-hidden relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={album.coverImageUrl}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <Badge
                          variant="gold"
                          className="absolute top-3 left-3 text-[10px] font-mono shadow"
                        >
                          {album.photoCount} FOTO
                        </Badge>
                        <Badge
                          variant="outline"
                          className="absolute top-3 right-3 text-[9px] bg-black/80 backdrop-blur-sm border-amber-400/50 text-amber-300 font-bold uppercase shadow tracking-wider"
                        >
                          {album.category || "TOURING RESMI"}
                        </Badge>
                      </div>

                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-bone-muted font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-gold" />
                            {album.location}
                          </span>
                          <span>{album.date}</span>
                        </div>

                        <h4 className="font-display font-bold text-base text-bone leading-snug">
                          {album.title}
                        </h4>

                        <p className="text-xs text-bone-muted line-clamp-2 leading-relaxed">
                          {album.description}
                        </p>
                      </CardContent>
                    </div>

                    <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between text-xs mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTargetAlbum(album.slug);
                          setShowUploadModal(true);
                        }}
                        className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 gap-1 font-bold"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Tambah Foto</span>
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditModal(album)}
                          className="h-7 px-2 text-xs text-bone-muted hover:text-amber-400 hover:bg-white/5 flex items-center gap-1"
                          title="Edit Album"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>

                        <Link
                          href={`/gallery`}
                          target="_blank"
                          className="text-xs text-bone-muted hover:text-bone flex items-center gap-1 p-1"
                          title="Lihat di Galeri Publik"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Lihat</span>
                        </Link>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAlbumToDelete(album)}
                          className="h-7 w-7 p-0 text-xs text-bone-muted hover:text-red-400 hover:bg-red-950/30"
                          title="Hapus Album"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* LIST / TABLE VIEW */
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-asphalt/60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-bone-muted uppercase font-mono text-[10px] tracking-wider">
                      <th className="py-3 px-4">Sampul</th>
                      <th className="py-3 px-4">Informasi Album</th>
                      <th className="py-3 px-4">Lokasi & Waktu</th>
                      <th className="py-3 px-4 text-center">Jumlah Foto</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedAlbums.map((album) => (
                      <tr key={album.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="h-14 w-20 rounded-lg overflow-hidden border border-white/15 relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={album.coverImageUrl}
                              alt={album.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-display font-bold text-sm text-bone group-hover:text-amber-400 transition-colors">
                              {album.title}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-black/60 border-amber-400/40 text-amber-300 font-bold uppercase tracking-wider shrink-0"
                            >
                              {album.category || "TOURING RESMI"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-bone-muted line-clamp-1 mt-0.5">
                            {album.description}
                          </p>
                          <span className="text-[10px] font-mono text-muted-gold/70">
                            slug: {album.slug}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-bone">
                            <MapPin className="h-3 w-3 text-muted-gold shrink-0" />
                            <span>{album.location}</span>
                          </div>
                          <span className="text-[11px] text-bone-muted font-mono">{album.date}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="gold" className="text-[10px] font-mono">
                            {album.photoCount} FOTO
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={album.isPublic ? "success" : "outline"}
                            className="text-[9px]"
                          >
                            {album.isPublic ? "PUBLIK" : "INTERNAL"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setTargetAlbum(album.slug);
                                setShowUploadModal(true);
                              }}
                              className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 gap-1 font-bold"
                              title="Tambah Foto ke Album"
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              <span className="hidden lg:inline">Tambah Foto</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditModal(album)}
                              className="h-7 px-2 text-xs text-bone-muted hover:text-amber-400 hover:bg-white/5 gap-1"
                              title="Edit Album"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>

                            <Link
                              href={`/gallery`}
                              target="_blank"
                              className="p-1.5 rounded-md text-bone-muted hover:text-bone hover:bg-white/5 transition-colors"
                              title="Lihat di Galeri Publik"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAlbumToDelete(album)}
                              className="h-7 w-7 p-0 text-xs text-bone-muted hover:text-red-400 hover:bg-red-950/30"
                              title="Hapus Album"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION BAR */}
            {processedAlbums.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-bone-muted">
                <div>
                  Menampilkan{" "}
                  <span className="font-bold text-bone">
                    {(albumCurrentPage - 1) * albumItemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-bone">
                    {Math.min(albumCurrentPage * albumItemsPerPage, processedAlbums.length)}
                  </span>{" "}
                  dari <span className="font-bold text-bone">{processedAlbums.length}</span> album
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={albumCurrentPage <= 1}
                    onClick={() => setAlbumCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2 text-xs gap-1 border-white/15 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Sebelumnya</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalAlbumPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setAlbumCurrentPage(pageNum)}
                          className={`h-7 w-7 rounded-md font-mono text-xs transition-colors ${
                            pageNum === albumCurrentPage
                              ? "bg-amber-400 text-charcoal font-bold shadow-sm"
                              : "border border-white/10 hover:bg-white/10 text-bone"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={albumCurrentPage >= totalAlbumPages}
                    onClick={() => setAlbumCurrentPage((p) => Math.min(totalAlbumPages, p + 1))}
                    className="h-7 px-2 text-xs gap-1 border-white/15 disabled:opacity-40"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* TAB 2: MEDIA LIBRARY GRID */}
      {activeTab === "media" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-4 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-bone-muted">
                Foto yang diunggah tersimpan permanen di Cloudflare R2 Storage (otomatis tersinkronisasi saat halaman dimuat ulang).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {mediaList.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAllMedia}
                  className="text-xs gap-1.5 border-white/20 hover:border-amber-400/60 text-bone hover:text-amber-400"
                >
                  {selectedMediaKeys.length === mediaList.length ? (
                    <>
                      <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
                      <span>Batal Pilih Semua</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span>Pilih Semua ({mediaList.length})</span>
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={fetchMedia}
                disabled={isLoadingMedia}
                className="text-xs gap-1.5 border-white/20 hover:border-white text-bone-muted hover:text-white"
                title="Muat Ulang dari Cloudflare R2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingMedia ? "animate-spin text-amber-400" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setShowUploadModal(true)}
                className="text-xs font-bold gap-1.5 bg-amber-400 text-charcoal hover:bg-amber-300 shadow-md shadow-amber-400/20"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload Gambar (Bulk)</span>
              </Button>
            </div>
          </div>

          {/* FLOATING ACTION BAR FOR SELECTED PHOTOS */}
          {selectedMediaKeys.length > 0 && (
            <div className="sticky top-20 z-30 flex items-center justify-between p-3.5 px-4 rounded-xl bg-gradient-to-r from-red-950/90 via-black/90 to-red-950/90 border border-red-500/40 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  {selectedMediaKeys.length} foto dipilih
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedMediaKeys([])}
                  className="text-xs text-bone-muted hover:text-white"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowBatchDeleteModal(true)}
                  className="text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus ({selectedMediaKeys.length}) Terpilih</span>
                </Button>
              </div>
            </div>
          )}

          {isLoadingMedia ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-white/10 bg-asphalt/40 space-y-3">
              <Loader2 className="h-7 w-7 text-amber-400 animate-spin" />
              <p className="text-xs text-bone-muted">Memuat galeri dari Cloudflare R2 Storage...</p>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-dashed border-white/15 bg-asphalt/30 space-y-3 text-center">
              <ImageIcon className="h-10 w-10 text-muted-gold/50" />
              <h4 className="font-display font-bold text-base text-bone">Belum Ada Foto Tersimpan</h4>
              <p className="text-xs text-bone-muted max-w-sm">
                Unggah foto dokumentasi touring pertama Anda langsung ke Cloudflare R2 Storage.
              </p>
              <Button
                size="sm"
                onClick={() => setShowUploadModal(true)}
                className="text-xs font-bold gap-1.5 bg-amber-400 text-charcoal hover:bg-amber-300"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload Sekarang</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaList.map((item) => {
                const itemKey = item.key || item.id;
                const isSelected = selectedMediaKeys.includes(itemKey);

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden flex flex-col justify-between group transition-all duration-200 ${
                      isSelected
                        ? "border-red-500 ring-2 ring-red-500/40 bg-red-950/20"
                        : "border-white/10 bg-asphalt/60 hover:border-amber-400/40"
                    }`}
                  >
                    <div>
                      <div className="h-40 relative overflow-hidden bg-black/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.caption || item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Left: Checkbox Selector */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectMedia(itemKey);
                          }}
                          className={`absolute top-2 left-2 h-7 w-7 rounded-lg flex items-center justify-center backdrop-blur-md transition-all ${
                            isSelected
                              ? "bg-red-500 text-white shadow-md shadow-red-500/50"
                              : "bg-black/60 text-white/70 hover:text-white hover:bg-black/90 border border-white/20"
                          }`}
                          title={isSelected ? "Batalkan pilihan" : "Pilih untuk dihapus masal"}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>

                        {/* Storage Badge */}
                        <Badge
                          variant="gold"
                          className="absolute top-2 right-2 text-[8px] font-mono shadow"
                        >
                          {item.storage === "cloudflare-r2" ? "CLOUDFLARE R2" : "LOCAL"}
                        </Badge>

                        {/* Size Badge */}
                        <Badge
                          variant="outline"
                          className="absolute bottom-2 left-2 text-[9px] bg-black/80 backdrop-blur-sm border-white/20 text-white font-mono"
                        >
                          {formatFileSize(item.size)}
                        </Badge>
                      </div>

                      <CardContent className="p-3 space-y-1">
                        <p
                          className="text-xs font-semibold text-bone truncate"
                          title={item.filename}
                        >
                          {item.filename}
                        </p>
                        {item.caption && (
                          <p className="text-[11px] text-bone-muted line-clamp-1 italic">
                            {item.caption}
                          </p>
                        )}
                        <p className="text-[10px] text-bone-muted/70 font-mono">
                          {item.uploadedAt}
                        </p>
                      </CardContent>
                    </div>

                    <div className="p-3 pt-0 border-t border-white/5 flex items-center justify-between text-xs mt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyUrl(item.url)}
                        className="h-7 px-2 text-[11px] text-amber-400 hover:text-amber-300 gap-1"
                      >
                        {copiedUrl === item.url ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Salin URL</span>
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-bone-muted hover:text-bone rounded hover:bg-white/5 transition-colors"
                          title="Lihat Gambar di Tab Baru"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(item);
                          }}
                          className="h-7 px-2 text-[11px] rounded bg-red-500/10 text-red-400 hover:bg-red-500/25 hover:text-red-300 flex items-center gap-1 transition-all border border-red-500/20"
                          title="Hapus foto dari Cloudflare R2"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="font-medium">Hapus</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BULK UPLOAD DENGAN LIVE IMAGE REVIEW (REVIEW SEBELUM UPLOAD)   */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-amber-400/40 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <Badge variant="gold">CLOUDFLARE R2 BULK UPLOADER</Badge>
                <h3 className="font-display font-extrabold uppercase text-xl text-white mt-1">
                  Upload Foto & Galeri Touring
                </h3>
                <p className="text-xs text-bone-muted mt-0.5">
                  Tinjau foto sebelum diunggah ke storage Cloudflare R2, atur keterangan, dan hapus foto yang tidak diinginkan.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) {
                    handleClearQueue();
                    setShowUploadModal(false);
                  }
                }}
                disabled={isUploading}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-bone-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
              {/* Drag & Drop Upload Zone */}
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-black/50 border-2 border-dashed border-amber-400/30 rounded-xl hover:border-amber-400 cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <UploadCloud className="w-8 h-8 mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-bone">
                    <span className="font-bold text-amber-400">Pilih file gambar</span> atau tarik beberapa file ke sini
                  </p>
                  <p className="text-[10px] text-bone-muted mt-0.5">
                    Mendukung JPG, PNG, WEBP, AVIF (Bisa pilih puluhan foto sekaligus)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesSelect}
                  className="hidden"
                />
              </label>

              {/* REVIEW GRID: Pratinjau Foto Sebelum Diunggah */}
              {filesQueue.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-black/60 border border-white/10">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">
                        Review Sebelum Upload ({filesQueue.length} Foto)
                      </span>
                      <span className="text-[11px] text-bone-muted font-mono">
                        Total: {formatFileSize(totalQueueSize)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Tambah Foto</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFilesSelect}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClearQueue}
                        disabled={isUploading}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Hapus Semua</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                    {filesQueue.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`relative rounded-lg overflow-hidden border bg-asphalt/80 flex flex-col justify-between group transition-all ${
                          item.status === "uploading"
                            ? "border-amber-400 shadow-md shadow-amber-400/20"
                            : item.status === "success"
                            ? "border-emerald-500"
                            : item.status === "error"
                            ? "border-red-500"
                            : "border-white/10 hover:border-amber-400/40"
                        }`}
                      >
                        <div className="h-28 relative overflow-hidden bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />

                          {/* Index badge */}
                          <Badge
                            variant="outline"
                            className="absolute top-1.5 left-1.5 text-[9px] bg-black/80 backdrop-blur-sm border-white/20 text-white font-mono"
                          >
                            #{idx + 1}
                          </Badge>

                          {/* Status overlay */}
                          {item.status === "uploading" && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-amber-400 text-xs font-bold gap-1.5">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Mengunggah...</span>
                            </div>
                          )}

                          {item.status === "success" && (
                            <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center text-emerald-300 text-xs font-bold gap-1">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              <span>Tersimpan</span>
                            </div>
                          )}

                          {item.status === "error" && (
                            <div className="absolute inset-0 bg-red-950/80 p-2 flex flex-col items-center justify-center text-red-200 text-[10px] text-center">
                              <AlertCircle className="h-4 w-4 text-red-400 mb-1" />
                              <span className="line-clamp-2">{item.errorMsg}</span>
                            </div>
                          )}

                          {/* Remove button (Only if not uploading) */}
                          {!isUploading && item.status !== "success" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFromQueue(item.id)}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                              title="Hapus foto ini dari antrean"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* File detail & individual caption */}
                        <div className="p-2 space-y-1 bg-[#12151b]">
                          <div className="flex items-center justify-between text-[10px] text-bone-muted font-mono">
                            <span className="truncate max-w-[100px]" title={item.file.name}>
                              {item.file.name}
                            </span>
                            <span>{formatFileSize(item.file.size)}</span>
                          </div>

                          <input
                            type="text"
                            placeholder="Keterangan foto ini..."
                            value={item.caption}
                            disabled={isUploading}
                            onChange={(e) =>
                              handleUpdateItemCaption(item.id, e.target.value)
                            }
                            className="w-full bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-bone placeholder:text-bone-muted/50 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Album Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="targetAlbum" className="text-xs">
                    Tautkan ke Album Touring
                  </Label>
                  <select
                    id="targetAlbum"
                    value={targetAlbum}
                    disabled={isUploading}
                    onChange={(e) => setTargetAlbum(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Tanpa Album (Foto Bebas / Umum) --</option>
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.slug}>
                        {alb.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Global Caption for All Photos */}
                <div className="space-y-1.5">
                  <Label htmlFor="globalCaption" className="text-xs">
                    Keterangan Masal (Berlaku untuk semua foto)
                  </Label>
                  <Input
                    id="globalCaption"
                    placeholder="Contoh: Barisan konvoi etape 1..."
                    value={globalCaption}
                    disabled={isUploading}
                    onChange={(e) => setGlobalCaption(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Bulk Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 p-3 rounded-lg bg-amber-400/10 border border-amber-400/30">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>
                      Mengunggah ({currentUploadIndex} dari {filesQueue.length} foto)...
                    </span>
                    <span className="font-mono">
                      {Math.round((currentUploadIndex / filesQueue.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                      style={{
                        width: `${(currentUploadIndex / filesQueue.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-[11px] text-bone-muted font-mono">
                  {filesQueue.length > 0
                    ? `${filesQueue.length} foto siap diunggah ke Cloudflare R2`
                    : "Pilih foto untuk memulai"}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      handleClearQueue();
                      setShowUploadModal(false);
                    }}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || filesQueue.length === 0}
                    className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Mengunggah Massal...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Unggah {filesQueue.length > 0 ? `(${filesQueue.length}) Foto` : "Foto"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BUAT ALBUM BARU (DENGAN DIRECT IMAGE UPLOAD)                    */}
      {/* ========================================================================= */}
      {showAddAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-muted-gold/40 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">ALBUM FOTO BARU</Badge>
                <h3 className="font-display font-extrabold uppercase text-lg text-bone mt-1">
                  Buat Album Dokumentasi Touring
                </h3>
              </div>
              <button
                onClick={() => setShowAddAlbumModal(false)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-bone-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitAlbum)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">
                  Judul Album Kegiatan *
                </Label>
                <Input
                  id="title"
                  placeholder="Contoh: Touring Jalur Selatan Jawa: Pangandaran - Yogyakarta"
                  {...register("title")}
                  onChange={(e) => {
                    register("title").onChange(e);
                    handleTitleChange(e);
                  }}
                  className="text-xs"
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* Kategori Album */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs">
                  Kategori Album *
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value !== "Kustom") {
                        setValue("category", e.target.value);
                      }
                    }}
                    className="h-9 rounded-lg bg-asphalt/80 border border-white/10 px-2.5 text-xs text-bone focus:border-amber-400 outline-none cursor-pointer"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Kustom">Kustom / Ketik Sendiri...</option>
                  </select>
                  <Input
                    id="category"
                    placeholder="Contoh: Ekspedisi Gunung / Sunmori"
                    {...register("category")}
                    className="text-xs"
                  />
                </div>
                {errors.category && (
                  <p className="text-xs text-red-400">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs">
                    Lokasi / Destinasi *
                  </Label>
                  <Input
                    id="location"
                    placeholder="Pangandaran - Yogyakarta"
                    {...register("location")}
                    className="text-xs"
                  />
                  {errors.location && (
                    <p className="text-xs text-red-400">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs">
                    Waktu Kegiatan *
                  </Label>
                  <Input
                    id="date"
                    placeholder="November 2026"
                    {...register("date")}
                    className="text-xs"
                  />
                  {errors.date && (
                    <p className="text-xs text-red-400">{errors.date.message}</p>
                  )}
                </div>
              </div>

              {/* Cover Image Uploader Mode */}
              <div className="space-y-2 p-3.5 rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-white">Foto Sampul Album *</Label>
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-md border border-white/10">
                    <button
                      type="button"
                      onClick={() => setCoverMode("upload")}
                      className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${
                        coverMode === "upload"
                          ? "bg-amber-400 text-charcoal"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode("url")}
                      className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${
                        coverMode === "url"
                          ? "bg-amber-400 text-charcoal"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                {coverMode === "upload" ? (
                  <div className="space-y-2">
                    <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-dashed border-amber-400/40 rounded-lg cursor-pointer transition text-xs text-amber-400">
                      {coverUploadLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Mengunggah foto sampul ke Cloudflare R2...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4" />
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
                    id="coverImageUrl"
                    placeholder="https://images.unsplash.com/photo-..."
                    {...register("coverImageUrl")}
                    className="text-xs font-mono"
                  />
                )}

                {/* Cover Image Thumbnail Preview */}
                {currentCoverUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-16 w-24 rounded-lg overflow-hidden border border-white/20 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentCoverUrl}
                        alt="Preview Sampul"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] text-bone-muted truncate">
                      <p className="font-semibold text-white">Preview Sampul Terpilih</p>
                      <p className="truncate font-mono text-[10px]">{currentCoverUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="photoCount" className="text-xs">
                    Jumlah Foto *
                  </Label>
                  <Input
                    id="photoCount"
                    type="number"
                    {...register("photoCount", { valueAsNumber: true })}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="isPublic" className="text-xs">
                    Visibilitas Album *
                  </Label>
                  <select
                    id="isPublic"
                    onChange={(e) => setValue("isPublic", e.target.value === "true")}
                    className="w-full rounded-md border border-white/10 bg-charcoal px-3 py-2 text-xs text-bone focus:outline-none focus:border-amber-400"
                  >
                    <option value="true">Publik (Bisa Dilihat Semua)</option>
                    <option value="false">Khusus Anggota (Member Only)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">
                  Deskripsi Singkat Album *
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Ceritakan gambaran singkat ekspedisi atau momen berkesan di album ini..."
                  {...register("description")}
                  className="text-xs"
                />
                {errors.description && (
                  <p className="text-xs text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAlbumModal(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Simpan Album</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM SINGLE PHOTO DELETE FROM CLOUDFLARE R2                   */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Hapus Foto Permanen?
                </h3>
                <p className="text-[11px] text-bone-muted">
                  Cloudflare R2 Bucket: 3kabrotherbikers
                </p>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={itemToDelete.url}
                alt={itemToDelete.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] space-y-0.5 font-mono">
                <p className="text-white font-semibold truncate">{itemToDelete.filename}</p>
                <div className="flex items-center justify-between text-bone-muted text-[9px]">
                  <span>{formatFileSize(itemToDelete.size)}</span>
                  <span>{itemToDelete.uploadedAt}</span>
                </div>
              </div>
            </div>

            {/* Warning Text */}
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Peringatan Hapus Permanen</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-200/90">
                Foto ini akan dihapus secara permanen dari server penyimpanan Cloudflare R2 dan tidak dapat dipulihkan kembali.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="text-xs border-white/20 hover:border-white text-bone hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmSingleDelete}
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
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRM BATCH PHOTOS DELETE                                     */}
      {/* ========================================================================= */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Hapus {selectedMediaKeys.length} Foto Terpilih?
                </h3>
                <p className="text-[11px] text-bone-muted">
                  Pembersihan masal dari Cloudflare R2 Storage
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Konfirmasi Penghapusan Masal</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-200/90">
                Sebanyak <strong className="text-white underline">{selectedMediaKeys.length} foto</strong> yang Anda pilih akan dihapus secara permanen dari Cloudflare R2 Storage. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setShowBatchDeleteModal(false)}
                className="text-xs border-white/20 hover:border-white text-bone hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmBatchDelete}
                className="text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus {selectedMediaKeys.length} Foto...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Hapus Semua Terpilih</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CONFIRM ALBUM DELETE                                             */}
      {/* ========================================================================= */}
      {albumToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Hapus Album Dokumentasi?
                </h3>
                <p className="text-[11px] text-bone-muted truncate max-w-[260px]">
                  {albumToDelete.title}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Konfirmasi Hapus Album</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-200/90">
                Album ini akan dihapus dari portal galeri. Foto-foto individual tetap aman di storage media Cloudflare R2.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setAlbumToDelete(null)}
                className="text-xs border-white/20 hover:border-white text-bone hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmAlbumDelete}
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
                    <span>Ya, Hapus Album</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT ALBUM DOKUMENTASI                                           */}
      {/* ========================================================================= */}
      {showEditAlbumModal && editingAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-amber-400/50 bg-[#0d0f14] p-6 text-bone shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">EDIT ALBUM</Badge>
                <h3 className="font-display font-extrabold uppercase text-lg text-bone mt-1">
                  Ubah Album Dokumentasi
                </h3>
                <p className="text-xs text-bone-muted mt-0.5">
                  Perbarui judul, lokasi, waktu kegiatan, deskripsi, atau foto sampul album.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isEditSubmitting) {
                    setShowEditAlbumModal(false);
                    setEditingAlbum(null);
                  }
                }}
                disabled={isEditSubmitting}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-bone-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditAlbum} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs">
                  Judul Album Kegiatan *
                </Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              {/* Kategori Album */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-category" className="text-xs font-semibold text-white">
                  Kategori Album *
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={CATEGORY_PRESETS.includes(editCategory) ? editCategory : "Kustom"}
                    onChange={(e) => {
                      if (e.target.value !== "Kustom") {
                        setEditCategory(e.target.value);
                      }
                    }}
                    className="h-9 rounded-lg bg-asphalt/80 border border-white/10 px-2.5 text-xs text-bone focus:border-amber-400 outline-none cursor-pointer"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Kustom">Kustom / Ketik Sendiri...</option>
                  </select>
                  <Input
                    id="edit-category"
                    placeholder="Ketik kategori..."
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-location" className="text-xs">
                    Lokasi / Destinasi *
                  </Label>
                  <Input
                    id="edit-location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-date" className="text-xs">
                    Waktu Kegiatan *
                  </Label>
                  <Input
                    id="edit-date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-slug" className="text-xs">
                  URL Slug
                </Label>
                <Input
                  id="edit-slug"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              {/* Cover Image Uploader Mode */}
              <div className="space-y-2 p-3.5 rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-white">Foto Sampul Album *</Label>
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-md border border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditCoverMode("upload")}
                      className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${
                        editCoverMode === "upload"
                          ? "bg-amber-400 text-charcoal"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCoverMode("url")}
                      className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${
                        editCoverMode === "url"
                          ? "bg-amber-400 text-charcoal"
                          : "text-bone-muted hover:text-bone"
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                {editCoverMode === "upload" ? (
                  <div className="space-y-2">
                    <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-dashed border-amber-400/40 rounded-lg cursor-pointer transition text-xs text-amber-400">
                      {editCoverUploadLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Mengunggah foto sampul ke Cloudflare R2...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4" />
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
                    id="editCoverImageUrl"
                    value={editCoverImageUrl}
                    onChange={(e) => setEditCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="text-xs font-mono"
                  />
                )}

                {/* Cover Image Thumbnail Preview */}
                {editCoverImageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-16 w-24 rounded-lg overflow-hidden border border-white/20 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editCoverImageUrl}
                        alt="Preview Sampul"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] text-bone-muted space-y-0.5 truncate flex-1">
                      <p className="font-bold text-amber-400">Sampul Terpilih</p>
                      <p className="truncate font-mono">{editCoverImageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs">
                  Ringkasan / Catatan Ekspedisi *
                </Label>
                <Textarea
                  id="edit-description"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              {/* KELOLA & HAPUS FOTO DALAM ALBUM */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-bone flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                      Foto dalam Album ({editPhotos.length} Foto)
                    </Label>
                    <p className="text-[10px] text-bone-muted">
                      Arahkan kursor ke foto lalu klik tombol hapus (tempat sampah merah) untuk menghapus foto atau foto rusak dari album ini.
                    </p>
                  </div>
                  {editPhotos.length > 0 && (
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      {editPhotos.length} foto aktif
                    </span>
                  )}
                </div>

                {editPhotos.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/15 text-center text-xs text-bone-muted bg-black/30">
                    Belum ada foto yang tertaut khusus ke album ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-2.5 bg-black/40 rounded-xl border border-white/10">
                    {editPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-lg overflow-hidden border border-white/15 bg-charcoal aspect-square flex items-center justify-center transition-all hover:border-amber-400/50"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.caption || `Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80";
                          }}
                        />

                        {/* Top badge index */}
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-bone border border-white/10">
                          #{idx + 1}
                        </span>

                        {/* Overlay with Delete Button */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 z-10">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus foto #${idx + 1} ini dari album "${editTitle}"?`)) {
                                setEditPhotos((prev) => prev.filter((_, i) => i !== idx));
                              }
                            }}
                            className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-md transition-all transform hover:scale-110"
                            title="Hapus foto dari album ini"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className="text-[10px] text-red-200 font-semibold text-center leading-tight">
                            Hapus Foto
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-isPublic"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-asphalt text-amber-400 focus:ring-amber-400"
                />
                <Label htmlFor="edit-isPublic" className="text-xs cursor-pointer font-medium text-bone">
                  Publikasikan album ke galeri umum website
                </Label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isEditSubmitting}
                  onClick={() => {
                    setShowEditAlbumModal(false);
                    setEditingAlbum(null);
                  }}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
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
                      <Check className="h-3.5 w-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
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
