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
import type { GalleryAlbumItem } from "@/features/gallery/queries";

interface GalleryClientProps {
  initialAlbums: GalleryAlbumItem[];
}

export default function GalleryClient({ initialAlbums }: GalleryClientProps) {
  const [albums, setAlbums] = React.useState<GalleryAlbumItem[]>(initialAlbums);
  const [selectedCat, setSelectedCat] = React.useState("Semua Album");
  const [activeAlbum, setActiveAlbum] = React.useState<GalleryAlbumItem | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

  // Sync state if initialAlbums update (e.g. on navigation or revalidation)
  React.useEffect(() => {
    setAlbums(initialAlbums);
  }, [initialAlbums]);

  const categoriesList = React.useMemo(() => {
    const defaultCats = [
      "Semua Album",
      "Ekspedisi Gunung",
      "Jalur Pantai",
      "Lintas Pulau",
      "Bakti Sosial",
    ];
    const set = new Set<string>(defaultCats);
    albums.forEach((a) => {
      if (a.category && a.category.trim()) {
        set.add(a.category.trim());
      }
    });
    return Array.from(set);
  }, [albums]);

  const filteredAlbums = albums.filter((a) => {
    if (selectedCat !== "Semua Album" && a.category !== selectedCat) return false;
    return true;
  });

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
    <div className="py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <Badge variant="gold">DOKUMENTASI VISUAL</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-black uppercase text-bone tracking-tight">
            Galeri Foto & Ekspedisi Touring
          </h1>
          <p className="text-lg text-bone-muted leading-relaxed">
            Merekam setiap jejak ban, panorama alam nusantara, dan kehangatan persaudaraan yang terukir di sepanjang lintasan aspal.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <Filter className="h-3.5 w-3.5 text-muted-gold mr-1" />
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCat === cat
                  ? "bg-muted-gold text-charcoal font-bold"
                  : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredAlbums.map((album) => {
            const photoCountLabel = `${album.photoCount || album.photos?.length || 1} FOTO`;
            const coverImage =
              album.coverImageUrl ||
              album.photos?.[0]?.url ||
              "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80";

            return (
              <Card
                key={album.id}
                className="border-white/10 bg-asphalt/60 hover:border-muted-gold/40 transition-all overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => openLightbox(album)}
              >
                <div className="h-64 sm:h-72 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="gold" className="text-[10px] font-mono shadow-md">
                      {photoCountLabel}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] shadow-md uppercase font-bold">
                      {album.category || "TOURING RESMI"}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-charcoal/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/10 text-xs text-bone flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3.5 w-3.5 text-muted-gold" />
                    <span>Buka Galeri Foto</span>
                  </div>
                </div>

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
            );
          })}
        </div>
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
                    className={`h-2 rounded-full transition-all ${
                      idx === currentPhotoIndex
                        ? "w-6 bg-muted-gold"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
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
                    className={`h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === currentPhotoIndex
                        ? "border-amber-400 scale-105 shadow-md shadow-amber-400/30"
                        : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/40"
                    }`}
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
