"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Pin,
  Lock,
  MessageCircle,
  Heart,
  Send,
  Flag,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { replyPostSchema, type ReplyPostInput } from "@/features/forum/schemas";
import { useMember } from "@/context/member-context";

interface PostReply {
  id: string;
  author: string;
  authorNumber: string;
  authorRole: string;
  motorcycle: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

interface TopicDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  categorySlug: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    memberNumber: string;
    motorcycle: string;
    motorcycleYear: string | number;
    role: string;
  };
  replies: PostReply[];
}

export default function MemberTopicDetailPage() {
  const { member } = useMember();
  const params = useParams();
  const topicId = (params?.id as string) || "";

  const [loading, setLoading] = React.useState(true);
  const [topic, setTopic] = React.useState<TopicDetail | null>(null);
  const [replies, setReplies] = React.useState<PostReply[]>([]);
  const [topicLikes, setTopicLikes] = React.useState<number>(0);
  const [isTopicLiked, setIsTopicLiked] = React.useState<boolean>(false);
  const [likedPosts, setLikedPosts] = React.useState<Record<string, boolean>>({});

  const [showReportModal, setShowReportModal] = React.useState(false);
  const [reportReason, setReportReason] = React.useState("");
  const [isReporting, setIsReporting] = React.useState(false);
  const [reportSuccess, setReportSuccess] = React.useState(false);

  const [isSubmittingReply, setIsSubmittingReply] = React.useState(false);
  const [replyError, setReplyError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyPostInput>({
    resolver: zodResolver(replyPostSchema),
    defaultValues: {
      topicId: topicId,
      content: "",
    },
  });

  const loadTopicDetail = React.useCallback(async () => {
    if (!topicId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/member/forum/${encodeURIComponent(topicId)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d: TopicDetail = json.data;
        setTopic(d);
        setTopicLikes(d.likes || 0);
        setIsTopicLiked(Boolean(d.isLiked));
        setReplies(d.replies || []);

        const initialLikesMap: Record<string, boolean> = {};
        (d.replies || []).forEach((r) => {
          if (r.isLiked) {
            initialLikesMap[r.id] = true;
          }
        });
        setLikedPosts(initialLikesMap);
      }
    } catch (err) {
      console.error("Error loading topic detail:", err);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  React.useEffect(() => {
    loadTopicDetail();
  }, [loadTopicDetail]);

  // Toggle Topic Like with database persistence
  const toggleTopicLike = async () => {
    if (!topic) return;

    // Optimistic UI update
    const nextLikedState = !isTopicLiked;
    setIsTopicLiked(nextLikedState);
    setTopicLikes((prev) => (nextLikedState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/member/forum/${topic.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "like",
          targetType: "topic",
          targetId: topic.id,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setIsTopicLiked(json.data.isLiked);
        setTopicLikes(json.data.likeCount);
      }
    } catch (err) {
      console.error("Error toggling topic like:", err);
      // Revert if error
      setIsTopicLiked(!nextLikedState);
      setTopicLikes((prev) => (nextLikedState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  // Toggle Reply Post Like with database persistence
  const togglePostLike = async (postId: string) => {
    if (!topic) return;

    const currentlyLiked = !!likedPosts[postId];
    const nextState = !currentlyLiked;

    // Optimistic UI update
    setLikedPosts((prev) => ({ ...prev, [postId]: nextState }));
    setReplies((rList) =>
      rList.map((r) =>
        r.id === postId ? { ...r, likes: nextState ? r.likes + 1 : Math.max(0, r.likes - 1) } : r
      )
    );

    try {
      const res = await fetch(`/api/member/forum/${topic.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "like",
          targetType: "post",
          targetId: postId,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLikedPosts((prev) => ({ ...prev, [postId]: json.data.isLiked }));
        setReplies((rList) =>
          rList.map((r) =>
            r.id === postId ? { ...r, likes: json.data.likeCount } : r
          )
        );
      }
    } catch (err) {
      console.error("Error toggling post like:", err);
      // Revert if error
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      setReplies((rList) =>
        rList.map((r) =>
          r.id === postId
            ? { ...r, likes: currentlyLiked ? r.likes + 1 : Math.max(0, r.likes - 1) }
            : r
        )
      );
    }
  };

  const onSubmitReply = async (data: ReplyPostInput) => {
    if (!topic) return;
    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/member/forum/${topic.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengirim balasan.");
      }

      const newReply: PostReply = {
        id: json.data?.id || `rep-${Date.now()}`,
        author: member?.fullName || "Anggota Brotherhood",
        authorNumber: member?.memberNumber || "BMC-MEMBER",
        authorRole: "Member",
        motorcycle: member?.motorcycleModel ? `${member.motorcycleModel} (${member.motorcycleYear || ""})` : "Motor Member",
        content: data.content,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setReplies((prev) => [...prev, newReply]);
      reset({ topicId: topic.id, content: "" });
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleSendReport = async () => {
    if (!topic || !reportReason || reportReason.trim().length < 5) return;
    setIsReporting(true);
    try {
      const res = await fetch(`/api/member/forum/${topic.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "report", reason: reportReason }),
      });
      const json = await res.json();
      if (json.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setShowReportModal(false);
          setReportReason("");
        }, 2000);
      }
    } catch (err) {
      console.error("Report error:", err);
    } finally {
      setIsReporting(false);
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

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-gold mx-auto" />
        <p className="text-xs font-mono text-bone-muted">Memuat isi diskusi forum...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950/40 text-red-400 border border-red-500/30">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-serif font-black uppercase text-bone">
          Topik Tidak Ditemukan
        </h2>
        <p className="text-xs text-bone-muted">
          Topik diskusi mungkin telah dihapus oleh moderator atau tautan tidak valid.
        </p>
        <Link href="/member/forum">
          <Button variant="outline" size="sm" className="mt-2 text-xs">
            Kembali ke Katalog Forum
          </Button>
        </Link>
      </div>
    );
  }

  const authorInitials = (topic.author?.name ? topic.author.name.slice(0, 2) : "BM").toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/member/forum"
          className="inline-flex items-center gap-1.5 text-xs text-bone-muted hover:text-muted-gold transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Katalog Forum</span>
        </Link>
      </div>

      {/* Main Topic Card */}
      <Card className="border-muted-gold/30 bg-asphalt/80 shadow-xl">
        <CardHeader className="space-y-3 pb-4 border-b border-white/5">
          <div className="flex flex-wrap items-center justify-between gap-2">
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReportModal(true)}
              className="text-xs text-bone-muted hover:text-red-400 gap-1.5 h-7"
            >
              <Flag className="h-3 w-3" />
              <span>Laporkan</span>
            </Button>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-serif font-black uppercase text-bone leading-tight">
            {topic.title}
          </CardTitle>

          {/* Author Badge */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-full bg-charcoal border border-muted-gold/40 flex items-center justify-center text-muted-gold font-bold">
              {authorInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-bone text-sm">{topic.author.name}</span>
                <Badge variant="gold" className="text-[9px] py-0 px-1 font-mono">
                  {topic.author.memberNumber}
                </Badge>
                <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-gold border-muted-gold/30">
                  {topic.author.role}
                </Badge>
              </div>
              <p className="text-[11px] text-bone-muted mt-0.5">
                {topic.author.motorcycle} &bull; Diposting {formatRelativeTime(topic.createdAt)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="text-xs sm:text-sm text-bone leading-relaxed whitespace-pre-line">
            {topic.content}
          </div>

          {/* Footer: Likes, Replies, Views */}
          <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-3 text-xs text-bone-muted gap-3">
            <div className="flex items-center gap-4">
              {/* Suka Topik Utama */}
              <button
                onClick={toggleTopicLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                  isTopicLiked
                    ? "bg-red-950/60 border-red-500/40 text-red-300 font-bold shadow-sm shadow-red-500/20"
                    : "bg-charcoal border-white/10 text-bone hover:border-red-400/50 hover:text-red-300"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isTopicLiked ? "fill-red-400 text-red-400" : ""}`} />
                <span>{topicLikes > 0 ? `${topicLikes} Suka` : "Suka Topik"}</span>
              </button>

              <span className="flex items-center gap-1.5 text-bone-muted">
                <MessageCircle className="h-4 w-4 text-muted-gold" />
                <span>{replies.length} Tanggapan Anggota</span>
              </span>
            </div>

            <span className="flex items-center gap-1.5 text-bone font-medium">
              <Eye className="h-4 w-4 text-muted-gold" />
              <span>{topic.viewCount} Kali Dilihat</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Replies List */}
      <div className="space-y-3">
        <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-muted-gold flex items-center gap-2">
          <span>Tanggapan & Diskusi Saudara ({replies.length})</span>
        </h3>

        {replies.length === 0 ? (
          <div className="p-8 rounded-lg bg-asphalt/50 border border-white/5 text-center text-xs text-bone-muted">
            Belum ada balasan pada topik ini. Jadilah yang pertama memberikan tanggapan!
          </div>
        ) : (
          replies.map((reply) => {
            const replyInitials = (reply.author ? reply.author.slice(0, 2) : "BM").toUpperCase();
            const isLiked = !!likedPosts[reply.id];

            return (
              <Card
                key={reply.id}
                className="border-white/10 bg-asphalt/50 hover:border-white/15 transition-colors p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-xs font-bold text-bone-muted shrink-0 mt-0.5">
                    {replyInitials}
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-bone">{reply.author}</span>
                        <span className="text-[10px] font-mono text-muted-gold">
                          {reply.authorNumber}
                        </span>
                        <span className="text-[10px] text-bone-muted">
                          &bull; {reply.motorcycle}
                        </span>
                      </div>
                      <span className="text-[10px] text-bone-muted">
                        {formatRelativeTime(reply.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-bone/90 leading-relaxed whitespace-pre-line">
                      {reply.content}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => togglePostLike(reply.id)}
                        className={`text-[11px] flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                          isLiked
                            ? "bg-red-950/50 border-red-500/30 text-red-300 font-bold"
                            : "bg-charcoal/60 border-white/5 text-bone-muted hover:text-red-300 hover:border-red-400/30"
                        }`}
                      >
                        <Heart className={`h-3 w-3 ${isLiked ? "fill-red-400 text-red-400" : ""}`} />
                        <span>{reply.likes > 0 ? `${reply.likes} Suka` : "Suka"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Reply Box */}
      {topic.isLocked ? (
        <Card className="border-red-500/30 bg-asphalt/60 p-4 text-center space-y-1">
          <p className="font-bold text-xs text-red-300 flex items-center justify-center gap-1.5">
            <Lock className="h-4 w-4" />
            <span>Topik Telah Dikunci oleh Moderator</span>
          </p>
          <p className="text-[11px] text-bone-muted">
            Diskusi ini telah ditutup dan tidak dapat menerima balasan tambahan.
          </p>
        </Card>
      ) : (
        <Card className="border-white/10 bg-asphalt/70 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-bone">
              Tulis Tanggapan Anda
            </h4>
            <span className="text-[10px] text-bone-muted">
              Menanggapi sebagai: <strong className="text-muted-gold">{member?.fullName}</strong>
            </span>
          </div>

          {replyError && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-950/60 p-2.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{replyError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitReply)} className="space-y-3">
            <Textarea
              rows={3}
              placeholder="Berikan saran, masukan, atau pengalaman Anda seputar topik ini..."
              {...register("content")}
              className="text-xs"
            />
            {errors.content && (
              <p className="text-xs text-red-400">{errors.content.message}</p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittingReply}
                size="sm"
                className="font-bold text-xs gap-1.5"
              >
                {isSubmittingReply ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Balasan</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-asphalt border border-red-500/40 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-white/10 pb-2">
              <Badge variant="destructive">LAPORAN MODERATOR</Badge>
              <h3 className="text-lg font-serif font-black uppercase text-bone mt-1">
                Laporkan Topik / Konten
              </h3>
              <p className="text-xs text-bone-muted">
                Bantu kami menjaga etika dan ketertiban ruang diskusi komunitas.
              </p>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-bone">Laporan Berhasil Terkirim</p>
                <p className="text-[11px] text-bone-muted">
                  Tim moderator akan meninjau postingan ini secepatnya.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="reportReason">Alasan Pelaporan *</Label>
                  <Textarea
                    id="reportReason"
                    rows={3}
                    placeholder="Contoh: Mengandung unsur knalpot brong ilegal, penipuan jual-beli, ujaran kebencian..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportModal(false)}
                    disabled={isReporting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleSendReport}
                    disabled={isReporting || reportReason.trim().length < 5}
                    className="text-xs font-bold"
                  >
                    {isReporting ? "Mengirim..." : "Kirim Laporan"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
