import { createClient } from "@/lib/supabase/server";
import { listR2Objects, getR2PublicUrl } from "@/lib/storage/r2";

export interface AlbumPhotoItem {
  url: string;
  caption?: string;
  key?: string;
}

export interface GalleryAlbumItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  date: string;
  photoCount: number;
  description: string;
  coverImageUrl: string;
  isPublic: boolean;
  photos: AlbumPhotoItem[];
  createdAt?: string;
}

export const DEFAULT_ALBUMS: GalleryAlbumItem[] = [
  {
    id: "alb-01",
    slug: "ekspedisi-dieng-plateau-2026",
    title: "Ekspedisi Dieng Plateau: Kabut Negeri Atas Awan",
    category: "Ekspedisi Gunung",
    location: "Wonosobo - Banjarnegara",
    date: "Oktober 2026",
    photoCount: 3,
    description:
      "Dokumentasi barisan konvoi saat melintasi tanjakan ekstrem Sikatok dan penyerahan santunan pendidikan.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    isPublic: true,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
        caption: "Formasi zig-zag rombongan saat melintasi kabut tebal jalan tembus Dieng.",
      },
      {
        url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
        caption: "Titik kumpul istirahat sejenak di Gardu Pandang Tieng.",
      },
      {
        url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85",
        caption: "Kebersamaan santap malam hangat dan briefing evaluasi rute.",
      },
    ],
  },
  {
    id: "alb-02",
    slug: "jalur-kemenyan-karang-hawu",
    title: "Jelajah Jalur Kemenyan & Pantai Karang Hawu",
    category: "Jalur Pantai",
    location: "Pelabuhan Ratu, Sukabumi",
    date: "Agustus 2026",
    photoCount: 2,
    description:
      "Pesona aspal pesisir laut selatan dan keakraban api unggun kopdar wajib malam kemerdekaan.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    isPublic: true,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
        caption: "Deretan kuda besi parkir rapi menghadap deburan ombak Karang Hawu.",
      },
      {
        url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
        caption: "Sunset ride menyusuri garis pantai selatan Sukabumi.",
      },
    ],
  },
  {
    id: "alb-03",
    slug: "touring-lintas-flores-kelimutu",
    title: "Touring Lintas Flores & Kelimutu Tri-Color",
    category: "Lintas Pulau",
    location: "Labuan Bajo - Ende, NTT",
    date: "Mei 2026",
    photoCount: 2,
    description:
      "Ekspedisi jarak jauh lintas pulau rider Brotherhood mengarungi medan perbukitan eksotis Nusa Tenggara Timur.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=800&q=80",
    isPublic: true,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85",
        caption: "Menatap keajaiban danau kawah Kelimutu bersama para rider tangguh.",
      },
      {
        url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85",
        caption: "Tiba di pelabuhan Labuan Bajo setelah 8 hari perjalanan darat & laut.",
      },
    ],
  },
];

/**
 * Fetch all gallery albums from Supabase and Cloudflare R2
 * Runs on server (SSR & API routes)
 */
export async function fetchGalleryAlbumsList(): Promise<GalleryAlbumItem[]> {
  try {
    const supabase = await createClient();

    // 1. Fetch real objects from Cloudflare R2 (strictly gallery folder)
    let allR2Photos: AlbumPhotoItem[] = [];
    try {
      const r2Objects = await listR2Objects("gallery");
      allR2Photos = r2Objects
        .filter(
          (o) =>
            o.Key &&
            o.Key.startsWith("gallery/") &&
            !o.Key.endsWith("/") &&
            /\.(jpe?g|png|webp|avif|gif)$/i.test(o.Key) &&
            (o.Size === undefined || o.Size > 100)
        )
        .map((o) => ({
          url: getR2PublicUrl(o.Key!),
          key: o.Key,
          caption: o.Key?.split("/").pop() || "Dokumentasi Touring",
        }));
    } catch (r2Err) {
      console.warn("Could not list R2 objects for albums:", r2Err);
    }

    // 2. Fetch database albums from Supabase
    const { data: dbRows, error } = await supabase
      .from("gallery_albums")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchGalleryAlbumsList Supabase error:", error);
      return DEFAULT_ALBUMS;
    }

    const fetchedAlbums: GalleryAlbumItem[] = (dbRows || []).map((row) => {
      // Parse category <!--CATEGORY:...--> if present
      let category = "Touring Resmi";
      let desc = row.description || "";
      const matchCat = desc.match(/<!--CATEGORY:([\s\S]*?)-->/);
      if (matchCat) {
        category = matchCat[1].trim();
        desc = desc.replace(/<!--CATEGORY:[\s\S]*?-->/, "").trim();
      }

      // Parse bracketed location if present: "[Location] Description"
      let loc = "Indonesia";
      const matchLoc = desc.match(/^\[(.*?)\]\s*([\s\S]*)$/);
      if (matchLoc) {
        loc = matchLoc[1];
        desc = matchLoc[2];
      }

      // Parse metadata <!--PHOTOS:[...]--> if present
      let photos: AlbumPhotoItem[] = [];
      const matchPhotos = desc.match(/<!--PHOTOS:([\s\S]*?)-->/);
      if (matchPhotos) {
        try {
          const parsed = JSON.parse(matchPhotos[1]);
          if (Array.isArray(parsed)) {
            photos = parsed.map((p) =>
              typeof p === "string" ? { url: p, caption: row.title } : p
            );
          }
          // Strip metadata comment from public description
          desc = desc.replace(/<!--PHOTOS:[\s\S]*?-->/, "").trim();
        } catch {
          // ignore parse error
        }
      }

      // If no explicit photos or only 1, intelligently link R2 photos
      if (photos.length === 0) {
        // Find R2 photos targeting this album slug
        const matchingSlugPhotos = allR2Photos.filter(
          (p) => p.key && p.key.includes(row.slug)
        );

        if (matchingSlugPhotos.length > 0) {
          photos = matchingSlugPhotos;
        } else if (allR2Photos.length > 0) {
          // If this is the active custom album, associate available R2 photos
          photos = allR2Photos;
        }
      }

      // Ensure cover_image_url is included in the photos array
      if (row.cover_image_url) {
        const hasCover = photos.some((p) => p.url === row.cover_image_url);
        if (!hasCover) {
          photos = [
            { url: row.cover_image_url, caption: `${row.title} - Foto Sampul` },
            ...photos,
          ];
        } else {
          // Move cover photo to first position if found
          const coverItem = photos.find((p) => p.url === row.cover_image_url);
          photos = [
            coverItem!,
            ...photos.filter((p) => p.url !== row.cover_image_url),
          ];
        }
      }

      // Fallback if still empty
      if (photos.length === 0 && row.cover_image_url) {
        photos = [{ url: row.cover_image_url, caption: row.title }];
      }

      const dateStr = row.created_at
        ? new Date(row.created_at).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })
        : "Oktober 2026";

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category,
        location: loc,
        date: dateStr,
        photoCount: photos.length || 1,
        description: desc,
        coverImageUrl:
          row.cover_image_url ||
          (photos[0]?.url ??
            "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"),
        isPublic: row.is_public ?? true,
        photos,
        createdAt: row.created_at,
      };
    });

    // Database is source of truth. If DB is queried successfully, return fetchedAlbums directly
    return fetchedAlbums;
  } catch (err: unknown) {
    console.error("fetchGalleryAlbumsList error:", err);
    return DEFAULT_ALBUMS;
  }
}
