import { createClient } from "@/lib/supabase/server";

export interface NewsArticleItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  authorName: string;
  summary: string;
  content: string;
  coverImageUrl?: string;
  status: "published" | "draft";
  publishedAt: string;
  createdAt: string;
  views: number;
}

export const DEFAULT_NEWS_ARTICLES: NewsArticleItem[] = [
  {
    id: "art-01",
    slug: "sukses-ekspedisi-dieng-plateau-2026",
    title: "Catatan Ekspedisi 1.200 KM Negeri di Atas Awan Dieng Plateau",
    category: "Ekspedisi & Touring",
    authorName: "Divisi Humas & Media",
    summary:
      "Rombongan 42 rider Brotherhood berhasil menembus cuaca ekstrem kabut Dieng dengan zero accident.",
    content:
      "Perjalanan ekspedisi menembus kawasan dataran tinggi Dieng pada ketinggian 2.093 mdpl resmi dituntaskan dengan catatan tanpa insiden sama sekali (zero accident). Rombongan yang terdiri dari 42 motor berbagai kapasitas mesin bertolak dari sekretariat pusat pada Jumat dini hari melintasi jalur utara Jawa Barat.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    publishedAt: "10 Okt 2026",
    createdAt: new Date().toISOString(),
    views: 480,
  },
  {
    id: "art-02",
    slug: "sosialisasi-ikrar-safety-riding-bogor",
    title: "Brotherhood Gelar Workshop Kepatuhan Tertib Lalu Lintas Bersama Satlantas",
    category: "Sosialisasi Safety",
    authorName: "Safety Officer",
    summary:
      "Seminar terbuka etika berkendara dan penggunaan perlengkapan keselamatan standar internasional.",
    content:
      "Sebagai bagian dari kampanye anti-arogansi di jalan raya, Brotherhood mengadakan seminar terbuka etika berkendara dan penggunaan perlengkapan keselamatan standar internasional.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    publishedAt: "28 Sep 2026",
    createdAt: new Date().toISOString(),
    views: 325,
  },
  {
    id: "art-03",
    slug: "musyawarah-tahunan-penetapan-jadwal-touring",
    title: "Hasil Musyawarah Besar: Rute Touring Jawa - Bali Resmi Ditetapkan",
    category: "Organisasi",
    authorName: "Sekretaris Jenderal",
    summary:
      "Rapat koordinasi akbar menyepakati 4 agenda touring wajib periode 2026–2027.",
    content:
      "Rapat koordinasi akbar dewan pengurus menyepakati 4 agenda touring wajib untuk periode 2026–2027 dan pembaruan sistem KTA digital terintegrasi QR code.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    publishedAt: "14 Sep 2026",
    createdAt: new Date().toISOString(),
    views: 290,
  },
];

function parseArticleContent(rawContent: string) {
  let category = "Ekspedisi & Touring";
  let authorName = "Divisi Humas Brotherhood";
  let content = rawContent || "";

  const catMatch = content.match(/<!--CATEGORY:([\s\S]*?)-->/);
  if (catMatch) {
    category = catMatch[1].trim();
    content = content.replace(/<!--CATEGORY:[\s\S]*?-->/, "").trim();
  }

  const authorMatch = content.match(/<!--AUTHOR:([\s\S]*?)-->/);
  if (authorMatch) {
    authorName = authorMatch[1].trim();
    content = content.replace(/<!--AUTHOR:[\s\S]*?-->/, "").trim();
  }

  return { category, authorName, content };
}

export async function fetchNewsArticlesList(
  statusFilter?: "all" | "published" | "draft"
): Promise<NewsArticleItem[]> {
  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    let query = supabase
      .from("news_articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: dbRows, error } = await query;

    if (error) {
      console.error("fetchNewsArticlesList Supabase error:", error);
      return DEFAULT_NEWS_ARTICLES.filter((a) =>
        statusFilter && statusFilter !== "all" ? a.status === statusFilter : true
      );
    }

    if (!dbRows || dbRows.length === 0) {
      return [];
    }

    return dbRows.map((row) => {
      const { category, authorName, content } = parseArticleContent(row.content);
      const pubDate = row.published_at || row.created_at;
      const formattedDate = pubDate
        ? new Date(pubDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-";

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category,
        authorName,
        summary: row.summary,
        content,
        coverImageUrl:
          row.cover_image_url ||
          "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
        status: (row.status as "published" | "draft") || "published",
        publishedAt: formattedDate,
        createdAt: row.created_at,
        views: Math.floor(Math.random() * 200) + 150,
      };
    });
  } catch (err) {
    console.error("fetchNewsArticlesList error:", err);
    return DEFAULT_NEWS_ARTICLES;
  }
}

export async function fetchNewsArticleBySlug(
  slug: string
): Promise<NewsArticleItem | null> {
  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const { data: row, error } = await supabase
      .from("news_articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !row) {
      const defaultMatch = DEFAULT_NEWS_ARTICLES.find((a) => a.slug === slug);
      return defaultMatch || null;
    }

    const { category, authorName, content } = parseArticleContent(row.content);
    const pubDate = row.published_at || row.created_at;
    const formattedDate = pubDate
      ? new Date(pubDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      category,
      authorName,
      summary: row.summary,
      content,
      coverImageUrl:
        row.cover_image_url ||
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
      status: (row.status as "published" | "draft") || "published",
      publishedAt: formattedDate,
      createdAt: row.created_at,
      views: 320,
    };
  } catch (err) {
    console.error("fetchNewsArticleBySlug error:", err);
    return null;
  }
}
