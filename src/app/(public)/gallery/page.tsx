import { fetchGalleryAlbumsList } from "@/features/gallery/queries";
import GalleryClient from "./gallery-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galeri Foto & Ekspedisi Touring | Brotherhood Community",
  description:
    "Merekam setiap jejak ban, panorama alam nusantara, dan kehangatan persaudaraan yang terukir di sepanjang lintasan aspal.",
};

export default async function PublicGalleryPage() {
  // Fetch real albums directly from Supabase & Cloudflare R2 on the server
  // This guarantees ZERO flash of default/mock data on the frontend
  const albums = await fetchGalleryAlbumsList();

  return <GalleryClient initialAlbums={albums} />;
}
