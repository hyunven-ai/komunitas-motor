import Link from "next/link";
import { Calendar, User, ArrowRight, Clock, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchNewsArticlesList } from "@/features/cms/queries";

export const metadata = {
  title: "Berita & Pengumuman — Brotherhood Community",
  description: "Warta ekspedisi touring, siaran pers resmi, dan artikel etika berkendara Brotherhood Motorcycle Community.",
};

export const dynamic = "force-dynamic";

export default async function PublicNewsPage() {
  const articles = await fetchNewsArticlesList("published");

  return (
    <div className="py-16 sm:py-24 bg-charcoal min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <Badge variant="gold">KABAR & RILIS RESMI</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-black uppercase text-bone tracking-tight">
            Berita & Pengumuman Komunitas
          </h1>
          <p className="text-lg text-bone-muted leading-relaxed">
            Ikuti dokumentasi perjalanan, artikel keselamatan berkendara, dan siaran pers resmi dari sekretariat Brotherhood Motorcycle Community.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/10 bg-asphalt/50 text-center text-bone-muted space-y-3">
            <Calendar className="h-10 w-10 mx-auto text-muted-gold opacity-60" />
            <p className="text-base font-medium text-bone">Belum ada warta berita yang dipublikasikan saat ini.</p>
            <p className="text-xs text-bone-muted/80">Pantau terus kabar terbaru seputar ekspedisi dan agenda komunitas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              // Calculate reading time estimate
              const wordCount = (article.content || "").split(/\s+/).length;
              const readMinutes = Math.max(2, Math.ceil(wordCount / 180));

              return (
                <Card
                  key={article.id || article.slug}
                  className="border-white/10 bg-asphalt/60 hover:border-amber-400/50 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
                >
                  {/* Photo Thumbnail */}
                  <div className="h-48 overflow-hidden relative bg-charcoal">
                    {article.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.coverImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-charcoal via-asphalt to-charcoal text-bone-muted/40">
                        <ImageIcon className="h-10 w-10 mb-2 stroke-[1.5] text-muted-gold/60" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Brotherhood News</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-black/30" />
                    <Badge
                      variant="gold"
                      className="absolute top-3 left-3 text-[10px] font-mono shadow-md backdrop-blur-sm"
                    >
                      {article.category || "Ekspedisi & Touring"}
                    </Badge>
                  </div>

                  <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-bone-muted font-mono">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-gold" />
                          {article.publishedAt}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3" />
                          {readMinutes} mnt baca
                        </span>
                      </div>

                      <Link href={`/news/${article.slug}`}>
                        <h3 className="text-xl font-serif font-bold text-bone leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-bone-muted leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-bone-muted">
                      <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <User className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                        <span className="truncate">{article.authorName}</span>
                      </span>
                      <Link
                        href={`/news/${article.slug}`}
                        className="text-amber-400 font-bold flex items-center gap-1 hover:underline shrink-0"
                      >
                        <span>Baca</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
