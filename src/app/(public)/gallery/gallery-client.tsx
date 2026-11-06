"use client";

import * as React from "react";
import {
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionReveal } from "@/components/ui/section-reveal";
import { FadeInSlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import type { GalleryAlbumItem } from "@/features/gallery/queries";

interface GalleryClientProps {
  initialAlbums: GalleryAlbumItem[];
}

/**
 * AlbumCoverCarousel
 * Automatic photo carousel for gallery album cards that contain more than 1 image.
 * Cycles smoothly every 3.5s with cinematic crossfade, hover pause, and manual quick-arrows.
 */
interface AlbumCoverCarouselProps {
  photos: { url: string; caption?: string }[];
  fallbackCover: string;
  title: string;
  category?: string;
  photoCountLabel: string;
}

function AlbumCoverCarousel({
  photos,
  fallbackCover,
  title,
  category,
  photoCountLabel,
}: AlbumCoverCarouselProps) {
  const displayPhotos = React.useMemo(() => {
    if (photos && photos.length > 0) return photos;
    return [{ url: fallbackCover, caption: title }];
  }, [photos, fallbackCover, title]);

  const hasMultiple = displayPhotos.length > 1;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto carousel effect for albums with > 1 photos
  React.useEffect(() => {
    if (!hasMultiple || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [hasMultiple, isHovered, displayPhotos.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
  };

  return (
    <div
      className="h-64 sm:h-72 overflow-hidden relative group/img bg-charcoal select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Photo Stack with Smooth Crossfade */}
      {displayPhotos.map((photo, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption || title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80";
              }}
            />
          </div>
        );
      })}

      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-transparent z-10 pointer-events-none" />

      {/* Badges on top left */}
      <div className="absolute top-4 left-4 flex gap-2 z-20">
        <Badge variant="gold" className="text-[10px] font-mono shadow-md">
          {photoCountLabel}
        </Badge>
        {category && (
          <Badge variant="secondary" className="text-[10px] shadow-md uppercase font-bold">
            {category}
          </Badge>
        )}
      </div>

      {/* Manual Quick Navigation Arrows (visible on hover if > 1 photo) */}
      {hasMultiple && (
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2.5 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white border border-white/10 backdrop-blur-sm transition-all shadow-md"
            title="Foto Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white border border-white/10 backdrop-blur-sm transition-all shadow-md"
            title="Foto Selanjutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Slide Indicators on bottom left */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 z-20">
          {displayPhotos.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentIndex
                  ? "w-5 bg-muted-gold shadow-md"
                  : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      )}

      {/* View Gallery Badge CTA */}
      <div className="absolute bottom-4 right-4 bg-charcoal/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/10 text-xs text-bone flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-20">
        <Eye className="h-3.5 w-3.5 text-muted-gold" />
        <span>Buka Galeri Foto</span>
      </div>
    </div>
  );
}

export default function GalleryClient({ initialAlbums }: GalleryClientProps) {
  const [albums, setAlbums] = React.useState<GalleryAlbumItem[]>(initialAlbums);
  const [selectedCat, setSelectedCat] = React.useState("Semua Album");
  const [activeAlbum, setActiveAlbum] = React.useState<GalleryAlbumItem | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

  // Pagination State (items per page = 10)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Sync state if initialAlbums update (e.g. on navigation or revalidation)
  React.useEffect(() => {
    setAlbums(initialAlbums);
  }, [initialAlbums]);

  /**
   * 1. Dynamic Category List:
   * Only show categories that actually exist across the current albums.
   */
  const categoriesList = React.useMemo(() => {
    const set = new Set<string>();
    albums.forEach((a) => {
      const cat = a.category?.trim();
      if (cat) {
        set.add(cat);
      }
    });
    return ["Semua Album", ...Array.from(set)];
  }, [albums]);

  // Filter albums by category
  const filteredAlbums = React.useMemo(() => {
    return albums.filter((a) => {
      if (selectedCat !== "Semua Album" && a.category !== selectedCat) return false;
      return true;
    });
  }, [albums, selectedCat]);

  // Handle Category Selection (resets page to 1)
  const handleSelectCategory = (cat: string) => {
    setSelectedCat(cat);
    setCurrentPage(1);
  };

  /**
   * 2. Pagination Calculations (max 10 items per page)
   */
  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);

  const paginatedAlbums = React.useMemo(() => {
    if (filteredAlbums.length <= ITEMS_PER_PAGE) return filteredAlbums;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlbums.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlbums, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  // Lightbox Handlers
  const openLightbox = (album: GalleryAlbumItem, photoIdx = 0) => {
    setActiveAlbum(album);
    setCurrentPhotoIndex(photoIdx);
  };

  const closeLightbox = () => {
    setActiveAlbum(null);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = () => {
    if (!activeAlbum || !activeAlbum.photos.length) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % activeAlbum.photos.length);
  };

  const prevPhoto = () => {
    if (!activeAlbum || !activeAlbum.photos.length) return;
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + activeAlbum.photos.length) % activeAlbum.photos.length
    );
  };

  React.useEffect(() => {
    if (!activeAlbum) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        prevPhoto();
      } else if (e.key === "Escape") {
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAlbum]);

  return (
    <div className="py-16 sm:py-24 bg-[#0B0D12] min-h-screen text-[#F5F5F2]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <FadeInSlideUp trigger="mount" duration={800} className="max-w-3xl space-y-4">
          <Badge variant="gold">DOKUMENTASI VISUAL</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-black uppercase text-bone tracking-tight">
            Galeri Foto & Ekspedisi Touring
          </h1>
          <p className="text-lg text-bone-muted leading-relaxed">
            Merekam setiap jejak ban, panorama alam nusantara, dan kehangatan persaudaraan yang terukir di sepanjang lintasan aspal.
          </p>
        </FadeInSlideUp>

        {/* Filter categories (only showing existing categories) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <Filter className="h-3.5 w-3.5 text-muted-gold mr-1" />
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedCat === cat
                  ? "bg-muted-gold text-charcoal font-bold shadow-md"
                  : "bg-asphalt text-bone-muted hover:text-bone border border-white/5 hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Albums Grid with Automatic Card Carousel */}
        <SectionReveal>
          {paginatedAlbums.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-asphalt/40 p-12 text-center space-y-3">
              <p className="text-sm text-bone-muted">Tidak ada album untuk kategori ini.</p>
              <button
                type="button"
                onClick={() => handleSelectCategory("Semua Album")}
                className="text-xs font-mono text-muted-gold hover:underline"
              >
                Kembali ke Semua Album
              </button>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paginatedAlbums.map((album, index) => {
                const photoCount = album.photoCount || album.photos?.length || 1;
                const photoCountLabel = `${photoCount} FOTO`;
                const coverImage =
                  album.coverImageUrl ||
                  album.photos?.[0]?.url ||
                  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80";

                return (
                  <StaggerItem key={album.id} index={index}>
                    <Card
                      className="border-white/10 bg-asphalt/60 hover:border-muted-gold/40 transition-all overflow-hidden flex flex-col group cursor-pointer shadow-xl h-full"
                      onClick={() => openLightbox(album)}
                    >
                    {/* Automatic Image Carousel for Albums with > 1 Photos */}
                    <AlbumCoverCarousel
                      photos={album.photos}
                      fallbackCover={coverImage}
                      title={album.title}
                      category={album.category || "TOURING RESMI"}
                      photoCountLabel={photoCountLabel}
                    />

                    {/* Album Metadata Card Content */}
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-bone-muted font-mono">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-gold" />
                          {album.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-gold" />
                          {album.date}
                        </span>
                      </div>

                      <h3 className="text-xl font-serif font-bold text-bone group-hover:text-muted-gold transition-colors">
                        {album.title}
                      </h3>

                      <p className="text-xs text-bone-muted leading-relaxed line-clamp-2">
                        {album.description}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
        </SectionReveal>

        {/* Pagination Controls (Toggle Next / Previous when albums exceed 10) */}
        {filteredAlbums.length > ITEMS_PER_PAGE && (
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-bone-muted font-mono">
              Menampilkan{" "}
              <strong className="text-bone">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAlbums.length)}
              </strong>{" "}
              dari <strong className="text-bone">{filteredAlbums.length}</strong> album
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all border",
                  currentPage === 1
                    ? "border-white/5 text-bone-muted/40 cursor-not-allowed bg-asphalt/30"
                    : "border-white/10 text-bone hover:text-muted-gold hover:border-muted-gold/50 bg-asphalt/80"
                )}
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 200, behavior: "smooth" });
                      }}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center",
                        isActive
                          ? "bg-muted-gold text-charcoal shadow-md"
                          : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all border",
                  currentPage === totalPages
                    ? "border-white/5 text-bone-muted/40 cursor-not-allowed bg-asphalt/30"
                    : "border-white/10 text-bone hover:text-muted-gold hover:border-muted-gold/50 bg-asphalt/80"
                )}
                title="Halaman Selanjutnya"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL VIEWER */}
      {activeAlbum && activeAlbum.photos && activeAlbum.photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-asphalt p-4 sm:p-6 text-bone shadow-2xl flex flex-col max-h-[90vh]">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif font-black uppercase text-base text-bone">
                  {activeAlbum.title}
                </h3>
                <p className="text-xs text-bone-muted font-mono">
                  {activeAlbum.location} &bull; Foto {currentPhotoIndex + 1} dari{" "}
                  {activeAlbum.photos.length}
                </p>
              </div>

              <button
                onClick={closeLightbox}
                className="p-1.5 rounded-lg text-bone-muted hover:text-bone hover:bg-white/10 transition-colors"
                title="Tutup Galeri (Esc)"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Lightbox Photo Preview */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden rounded-xl bg-charcoal min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeAlbum.photos[currentPhotoIndex]?.url}
                alt={activeAlbum.photos[currentPhotoIndex]?.caption || activeAlbum.title}
                className="max-h-[60vh] max-w-full object-contain rounded"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80";
                }}
              />

              {activeAlbum.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-charcoal/80 border border-white/10 text-bone hover:text-muted-gold transition-colors shadow-lg"
                    title="Foto Sebelumnya (Panah Kiri)"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-charcoal/80 border border-white/10 text-bone hover:text-muted-gold transition-colors shadow-lg"
                    title="Foto Selanjutnya (Panah Kanan)"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Photo Caption & Pagination Indicators */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
              <p className="text-bone-muted italic truncate max-w-md">
                &ldquo;{activeAlbum.photos[currentPhotoIndex]?.caption || activeAlbum.title}&rdquo;
              </p>

              <div className="flex items-center gap-1.5 shrink-0">
                {activeAlbum.photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      idx === currentPhotoIndex
                        ? "w-6 bg-muted-gold"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    )}
                    title={`Lihat foto ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {activeAlbum.photos.length > 1 && (
              <div className="flex items-center gap-2 pt-2.5 overflow-x-auto pb-1 max-w-full">
                {activeAlbum.photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={cn(
                      "h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                      idx === currentPhotoIndex
                        ? "border-amber-400 scale-105 shadow-md shadow-amber-400/30"
                        : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/40"
                    )}
                    title={`Pilih foto ${idx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.caption || `Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
