"use client";

import * as React from "react";
import Link from "next/link";
import {
  Camera,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  User,
  MapPin,
  Images,
} from "lucide-react";
import { GalleryAlbumItem } from "@/features/gallery/queries";
import { NewsArticleItem } from "@/features/cms/queries";

interface CommunityMediaCarouselProps {
  albums: GalleryAlbumItem[];
  articles: NewsArticleItem[];
}

export function CommunityMediaCarousel({
  albums,
  articles,
}: CommunityMediaCarouselProps) {
  // Gallery Carousel State
  const [albumIndex, setAlbumIndex] = React.useState(0);
  const [isAlbumHovered, setIsAlbumHovered] = React.useState(false);
  const albumTouchStartX = React.useRef<number | null>(null);

  // News Carousel State
  const [articleIndex, setArticleIndex] = React.useState(0);
  const [isArticleHovered, setIsArticleHovered] = React.useState(false);
  const articleTouchStartX = React.useRef<number | null>(null);

  const totalAlbums = albums.length;
  const totalArticles = articles.length;

  // Next / Prev handlers for Gallery
  const nextAlbum = React.useCallback(() => {
    if (totalAlbums <= 1) return;
    setAlbumIndex((prev) => (prev + 1) % totalAlbums);
  }, [totalAlbums]);

  const prevAlbum = React.useCallback(() => {
    if (totalAlbums <= 1) return;
    setAlbumIndex((prev) => (prev - 1 + totalAlbums) % totalAlbums);
  }, [totalAlbums]);

  // Next / Prev handlers for News
  const nextArticle = React.useCallback(() => {
    if (totalArticles <= 1) return;
    setArticleIndex((prev) => (prev + 1) % totalArticles);
  }, [totalArticles]);

  const prevArticle = React.useCallback(() => {
    if (totalArticles <= 1) return;
    setArticleIndex((prev) => (prev - 1 + totalArticles) % totalArticles);
  }, [totalArticles]);

  // Auto-play timer for Gallery (every 7 seconds, pauses when hovered)
  React.useEffect(() => {
    if (isAlbumHovered || totalAlbums <= 1) return;
    const timer = setInterval(() => {
      setAlbumIndex((prev) => (prev + 1) % totalAlbums);
    }, 7000);
    return () => clearInterval(timer);
  }, [isAlbumHovered, totalAlbums]);

  // Auto-play timer for News (every 8.5 seconds, pauses when hovered)
  React.useEffect(() => {
    if (isArticleHovered || totalArticles <= 1) return;
    const timer = setInterval(() => {
      setArticleIndex((prev) => (prev + 1) % totalArticles);
    }, 8500);
    return () => clearInterval(timer);
  }, [isArticleHovered, totalArticles]);

  // Touch swipe handlers for Gallery
  const handleAlbumTouchStart = (e: React.TouchEvent) => {
    albumTouchStartX.current = e.touches[0].clientX;
  };
  const handleAlbumTouchEnd = (e: React.TouchEvent) => {
    if (albumTouchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - albumTouchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) nextAlbum();
      else prevAlbum();
    }
    albumTouchStartX.current = null;
  };

  // Touch swipe handlers for News
  const handleArticleTouchStart = (e: React.TouchEvent) => {
    articleTouchStartX.current = e.touches[0].clientX;
  };
  const handleArticleTouchEnd = (e: React.TouchEvent) => {
    if (articleTouchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - articleTouchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) nextArticle();
      else prevArticle();
    }
    articleTouchStartX.current = null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      {/* ========================================================================= */}
      {/* 1. GALLERY ALBUM CAROUSEL CARD                                            */}
      {/* ========================================================================= */}
      <div
        className="group/gallery flex flex-col justify-between rounded-xl border border-white/10 bg-[#12141C] overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20"
        onMouseEnter={() => setIsAlbumHovered(true)}
        onMouseLeave={() => setIsAlbumHovered(false)}
        onTouchStart={handleAlbumTouchStart}
        onTouchEnd={handleAlbumTouchEnd}
      >
        {/* Top Bar with Section Badge & Navigation Controls */}
        <div className="px-5 py-3.5 bg-[#161822] border-b border-white/10 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Camera className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-200">
                Dokumentasi Lapangan
              </span>
            </div>
          </div>

          {/* Carousel Controls */}
          {totalAlbums > 1 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-neutral-400 font-semibold px-2 py-0.5 rounded bg-black/40 border border-white/5">
                {String(albumIndex + 1).padStart(2, "0")} / {String(totalAlbums).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevAlbum}
                  aria-label="Dokumentasi Sebelumnya"
                  className="h-7 w-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/15 transition active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextAlbum}
                  aria-label="Dokumentasi Berikutnya"
                  className="h-7 w-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/15 transition active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slider Viewport with Horizontal Track */}
        <div className="relative w-full overflow-hidden flex-1 flex flex-col">
          {totalAlbums > 0 ? (
            <div
              className="flex w-full flex-1 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${albumIndex * 100}%)` }}
            >
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="min-w-full w-full shrink-0 flex flex-col justify-between"
                >
                  {/* Image Frame */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#181B26] overflow-hidden">
                    {album.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover/gallery:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#181B26] text-neutral-500 font-mono text-xs">
                        <Camera className="h-8 w-8 mb-2 stroke-[1.5] text-neutral-600" />
                        <span>Dokumentasi Ekspedisi</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-black/20 to-transparent" />

                    {/* Overlaid Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-red-600/90 text-white font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md shadow-md">
                        {album.category || "Ekspedisi Resmi"}
                      </span>

                      {album.photoCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-black/70 border border-white/15 text-neutral-200 font-mono text-[10px] font-medium flex items-center gap-1 backdrop-blur-md">
                          <Images className="h-3 w-3 text-red-400" />
                          <span>{album.photoCount} Foto</span>
                        </span>
                      )}
                    </div>

                    {/* Overlaid Title on Image Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1">
                        <MapPin className="h-3 w-3" />
                        <span>{album.location || "Nusantara"}</span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white leading-snug drop-shadow-md line-clamp-2">
                        {album.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Body & Description */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans line-clamp-3">
                      {album.description ||
                        "Dokumentasi barisan konvoi saat melintasi tanjakan ekstrem dan penyerahan santunan bagi warga di sekitar rute perjalanan."}
                    </p>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-red-500" />
                        <span>{album.date || "Oktober 2026"}</span>
                      </span>

                      <Link
                        href="/gallery"
                        className="text-neutral-200 hover:text-white font-medium flex items-center gap-1 group/btn"
                      >
                        <span className="text-xs font-display font-semibold uppercase tracking-wider">
                          Buka Album Foto Lengkap
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-red-500 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center bg-[#181B26] text-neutral-500 font-mono text-xs">
              Belum ada dokumentasi album foto.
            </div>
          )}
        </div>

        {/* Bottom Dots Indicator */}
        {totalAlbums > 1 && (
          <div className="px-6 pb-4 pt-1 flex items-center gap-1.5 shrink-0">
            {albums.map((alb, i) => (
              <button
                key={alb.id}
                type="button"
                onClick={() => setAlbumIndex(i)}
                aria-label={`Pilih album ${alb.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === albumIndex
                    ? "w-7 bg-red-500"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. NEWS ARTICLE CAROUSEL CARD                                             */}
      {/* ========================================================================= */}
      <div
        className="group/news flex flex-col justify-between rounded-xl border border-white/10 bg-[#12141C] overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20"
        onMouseEnter={() => setIsArticleHovered(true)}
        onMouseLeave={() => setIsArticleHovered(false)}
        onTouchStart={handleArticleTouchStart}
        onTouchEnd={handleArticleTouchEnd}
      >
        {/* Top Bar with Section Badge & Navigation Controls */}
        <div className="px-5 py-3.5 bg-[#161822] border-b border-white/10 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-200">
                Warta &amp; Catatan Touring
              </span>
            </div>
          </div>

          {/* Carousel Controls */}
          {totalArticles > 1 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-neutral-400 font-semibold px-2 py-0.5 rounded bg-black/40 border border-white/5">
                {String(articleIndex + 1).padStart(2, "0")} / {String(totalArticles).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevArticle}
                  aria-label="Warta Sebelumnya"
                  className="h-7 w-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/15 transition active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextArticle}
                  aria-label="Warta Berikutnya"
                  className="h-7 w-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/15 transition active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slider Viewport with Horizontal Track */}
        <div className="relative w-full overflow-hidden flex-1 flex flex-col">
          {totalArticles > 0 ? (
            <div
              className="flex w-full flex-1 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${articleIndex * 100}%)` }}
            >
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="min-w-full w-full shrink-0 flex flex-col justify-between"
                >
                  {/* Image Frame */}
                  <Link
                    href={`/news/${article.slug}`}
                    className="block relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#181B26] overflow-hidden"
                  >
                    {article.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.coverImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover/news:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#181B26] text-neutral-500 font-mono text-xs">
                        <BookOpen className="h-8 w-8 mb-2 stroke-[1.5] text-neutral-600" />
                        <span>Warta Brotherhood</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-black/20 to-transparent" />

                    {/* Overlaid Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-amber-500 text-charcoal font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
                        {article.category || "Berita"}
                      </span>

                      <span className="px-2 py-0.5 rounded bg-black/70 border border-white/15 text-neutral-300 font-mono text-[10px] font-medium flex items-center gap-1 backdrop-blur-md">
                        <Calendar className="h-3 w-3 text-amber-400" />
                        <span>{article.publishedAt}</span>
                      </span>
                    </div>

                    {/* Overlaid Title on Image Bottom */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white group-hover/news:text-amber-400 transition-colors leading-snug drop-shadow-md line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </Link>

                  {/* Content Body & Description */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans line-clamp-3">
                      {article.summary ||
                        "Catatan resmi dan liputan langsung seputar kegiatan komunitas Borneo Brotherhood di jalanan Nusantara."}
                    </p>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <User className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Oleh: {article.authorName || "Redaksi"}</span>
                      </span>

                      <Link
                        href={`/news/${article.slug}`}
                        className="text-neutral-200 hover:text-white font-medium flex items-center gap-1 group/btn"
                      >
                        <span className="text-xs font-display font-semibold uppercase tracking-wider">
                          Baca Catatan Lengkap
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center bg-[#181B26] text-neutral-500 font-mono text-xs">
              Belum ada warta berita komunitas.
            </div>
          )}
        </div>

        {/* Bottom Dots Indicator */}
        {totalArticles > 1 && (
          <div className="px-6 pb-4 pt-1 flex items-center gap-1.5 shrink-0">
            {articles.map((art, i) => (
              <button
                key={art.id}
                type="button"
                onClick={() => setArticleIndex(i)}
                aria-label={`Pilih berita ${art.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === articleIndex
                    ? "w-7 bg-amber-400"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
