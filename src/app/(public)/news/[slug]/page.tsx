import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
  Share2,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchNewsArticleBySlug } from "@/features/cms/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchNewsArticleBySlug(slug);
  if (!article) return { title: "Artikel Tidak Ditemukan — Brotherhood" };
  return {
    title: `${article.title} — Brotherhood Community`,
    description: article.summary,
  };
}

export default async function PublicArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Split paragraphs by double newline or single newline
  const paragraphs = (article.content || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const wordCount = (article.content || "").split(/\s+/).length;
  const readMinutes = Math.max(2, Math.ceil(wordCount / 180));

  return (
    <article className="py-12 sm:py-20 bg-charcoal min-h-screen text-bone">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs text-bone-muted hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Warta Berita</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="space-y-4">
          <Badge variant="gold" className="text-xs uppercase font-mono tracking-wider shadow">
            {article.category || "Ekspedisi & Touring"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase text-bone leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-bone-muted">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-asphalt border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
                HQ
              </div>
              <div>
                <p className="font-bold text-bone">{article.authorName}</p>
                <p className="text-[11px] text-bone-muted">Redaksi Brotherhood Community</p>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                {article.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-bone-muted" />
                {readMinutes} mnt baca
              </span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-asphalt">
          {article.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-80 sm:h-96 md:h-[450px] object-cover"
            />
          ) : (
            <div className="w-full h-80 sm:h-96 flex flex-col items-center justify-center p-6 text-center text-bone-muted/40">
              <ImageIcon className="h-12 w-12 mb-2 stroke-[1.5] text-amber-400/60" />
              <span className="text-xs font-mono uppercase tracking-wider">Brotherhood Media</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Article Summary Quote */}
        {article.summary && (
          <blockquote className="my-6 rounded-xl border-l-4 border-amber-400 bg-asphalt/80 p-5 italic text-bone font-serif text-base sm:text-lg">
            &ldquo;{article.summary}&rdquo;
          </blockquote>
        )}

        {/* Article Body with Rich WordPress Typography (H2, H3, Lists, Blockquotes, etc.) */}
        <div className="pt-2">
          {/<[a-z][\s\S]*>/i.test(article.content || "") ? (
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="article-prose">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-bone-muted italic">Tidak ada konten teks tambahan.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-white/10">
          <Link href="/news">
            <Button variant="outline" size="sm" className="text-xs border-white/20 hover:border-amber-400 text-bone">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              <span>Lihat Semua Berita</span>
            </Button>
          </Link>

          <Link href="/join">
            <Button size="sm" className="text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-charcoal hover:brightness-110 shadow-lg shadow-amber-400/20">
              <span>Gabung Menjadi Anggota</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
