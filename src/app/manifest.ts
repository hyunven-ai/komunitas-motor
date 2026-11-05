import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Borneo Brotherhood Portal",
    short_name: "Brotherhood",
    description: "Portal resmi manajemen komunitas motor touring Borneo Brotherhood.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0D12",
    theme_color: "#DC2626",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

