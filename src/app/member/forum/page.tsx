"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pin,
  Eye,
  MessageCircle,
  PlusCircle,
  Lock,
  Filter,
  CheckCircle2,
  Loader2,
  Search,
  AlertCircle,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTopicSchema, type CreateTopicInput } from "@/features/forum/schemas";
import { useMember } from "@/context/member-context";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface TopicItem {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  author: string;
  authorNumber: string;
  authorRole: string;
  replies: number;
  views: number;
  likes?: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

export default function MemberForumPage() {
  const { member } = useMember();
  const [loading, setLoading] = React.useState(true);
  const [topics, setTopics] = React.useState<TopicItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTopicInput>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      content: "",
    },
  });

  const loadForumData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/member/forum", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setTopics(json.data.topics || []);
        setCategories(json.data.categories || []);
        if (json.data.categories?.length > 0) {
          setValue("categoryId", json.data.categories[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading forum data:", err);
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  React.useEffect(() => {
    loadForumData();
  }, [loadForumData]);

  const filteredTopics = topics.filter((t) => {
    if (selectedCategory !== "all" && t.categoryId !== selectedCategory && t.categorySlug !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const onSubmit = async (data: CreateTopicInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/member/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal membuat topik diskusi.");
      }

      await loadForumData();
      setShowCreateModal(false);
      reset();
      setSuccessToast("Topik diskusi berhasil diterbitkan ke forum!");
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays} hari lalu`;
      if (diffHours > 0) return `${diffHours} jam lalu`;
      return "Baru saja";
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">FORUM INTERNAL ANGGOTA</Badge>
          <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
            Ruang Diskusi & Persaudaraan
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Wadah diskusi tertutup khusus anggota terverifikasi Brotherhood Community.
          </p>
        </div>

        <Button
          size="sm"
          variant="default"
          onClick={() => {
            setErrorMessage(null);
            setShowCreateModal(true);
          }}
          className="text-xs font-bold gap-1.5 shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Buat Topik Baru</span>
        </Button>
      </div>

      {successToast && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-bone-muted" />
          <Input
            placeholder="Cari judul topik, nama pembuat, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-asphalt/60 border-white/10 text-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            size="sm"
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className="h-7 text-xs rounded-full px-3"
          >
            Semua Kategori
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="h-7 text-xs rounded-full px-3"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-gold mx-auto" />
          <p className="text-xs font-mono text-bone-muted">Memuat daftar topik diskusi...</p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <Card className="border-dashed border-white/15 bg-asphalt/40 p-12 text-center space-y-3">
          <MessageCircle className="h-10 w-10 text-bone-muted mx-auto" />
          <h3 className="font-serif font-bold text-lg text-bone">Belum Ada Topik Diskusi</h3>
          <p className="text-xs text-bone-muted max-w-sm mx-auto">
            Jadilah yang pertama memulai obrolan atau ajukan pertanyaan seputar motor dan touring kepada saudara lainnya.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            className="text-xs gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5 text-muted-gold" />
            <span>Mulai Topik Pertama</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/member/forum/${topic.slug || topic.id}`}
              className="block group"
            >
              <Card className="border-white/10 bg-asphalt/60 hover:border-muted-gold/40 hover:bg-asphalt transition-all p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {topic.isPinned && (
                        <Badge variant="gold" className="text-[10px] gap-1 py-0 px-2 font-bold">
                          <Pin className="h-2.5 w-2.5" /> PINNED
                        </Badge>
                      )}
                      {topic.isLocked && (
                        <Badge variant="destructive" className="text-[10px] gap-1 py-0 px-2 font-bold">
                          <Lock className="h-2.5 w-2.5" /> LOCKED
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {topic.category}
                      </Badge>
                    </div>

                    <h3 className="font-serif font-bold text-base text-bone group-hover:text-muted-gold transition-colors">
                      {topic.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-bone-muted">
                      <span>Oleh: <strong className="text-bone">{topic.author}</strong></span>
                      <span>&bull;</span>
                      <span className="font-mono text-muted-gold">{topic.authorNumber}</span>
                      <span>&bull;</span>
                      <span>{formatRelativeTime(topic.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 text-xs text-bone-muted shrink-0 sm:border-l sm:border-white/5 sm:pl-4">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-red-400" />
                      <span>{topic.likes || 0} suka</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 text-muted-gold" />
                      <span>{topic.replies} balasan</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-bone-muted" />
                      <span>{topic.views} dilihat</span>
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* CREATE TOPIC MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-asphalt border border-muted-gold/40 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <div className="border-b border-white/10 pb-3">
              <Badge variant="gold">DISKUSI BARU</Badge>
              <h3 className="text-xl font-serif font-black uppercase text-bone mt-1">
                Buat Topik Pembahasan
              </h3>
              <p className="text-xs text-bone-muted">
                Posting topik baru ke ruang forum komunitas.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Judul Topik *</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Rekomendasi Rute Pantura vs Jalur Tengah"
                  {...register("title")}
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="categoryId">Kategori Diskusi *</Label>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  className="w-full h-10 rounded-md border border-white/15 bg-charcoal px-3 text-xs text-bone focus:outline-none focus:ring-1 focus:ring-muted-gold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-400">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content">Isi Pembahasan *</Label>
                <Textarea
                  id="content"
                  rows={5}
                  placeholder="Uraikan pertanyaan, pengalaman, atau informasi yang ingin Anda bagikan..."
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-xs text-red-400">{errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="font-bold gap-1.5">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menerbitkan...</span>
                    </>
                  ) : (
                    <span>Terbitkan Topik</span>
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
