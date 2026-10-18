import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ItineraryItem {
  time: string;
  title: string;
  note: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  cover_image_url?: string | null;
  location_name: string;
  location_address?: string | null;
  map_link?: string | null;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  capacity: number;
  fee: number;
  status: "draft" | "published" | "cancelled" | "completed";
  created_at?: string;
  registeredCount: number;
  attendedCount?: number;
  itinerary?: ItineraryItem[];
  includes?: string[];
  mandatoryGears?: string[];
}

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "evt-001-jalur-selatan",
    slug: "touring-jalur-selatan-2026",
    title: "Touring Jalur Selatan Jawa: Pangandaran - Yogyakarta",
    category: "Touring Akbar",
    description:
      "Menjelajahi jalur pesisir laut selatan Jawa sepanjang 420 KM dengan suguhan aspal mulus, pemandangan tebing samudera, dan bakti sosial panti asuhan.",
    cover_image_url:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop",
    location_name: "Start: Basecamp Puncak, Bogor",
    location_address: "Jl. Raya Puncak KM 77, Cisarua, Bogor (Kumpul 05.00 WIB)",
    map_link: "https://maps.google.com/?q=Basecamp+Puncak+Bogor",
    start_time: "2026-11-24T05:30:00+07:00",
    end_time: "2026-11-26T18:00:00+07:00",
    registration_deadline: "2026-11-18T23:59:59+07:00",
    capacity: 50,
    fee: 350000,
    status: "published",
    registeredCount: 36,
    attendedCount: 0,
    created_at: "2026-10-01T08:00:00Z",
    itinerary: [
      { time: "Hari 1 - 05.30 WIB", title: "Start Basecamp Bogor & Etape 1", note: "Briefing safety, pembagian formasi regu konvoi menuju Garut - Tasikmalaya." },
      { time: "Hari 1 - 16.00 WIB", title: "Tiba di Pangandaran", note: "Check-in penginapan, makan malam bersama, dan santunan anak yatim piatu pesisir." },
      { time: "Hari 2 - 08.00 WIB", title: "Etape 2: Pangandaran ke Yogyakarta", note: "Menikmati aspal lintas selatan via Kebumen, rest area pantai Menganti." },
      { time: "Hari 2 - 18.00 WIB", title: "Gala Dinner di Yogyakarta", note: "Malam ramah tamah persaudaraan dan penyerahan pin plakat touring." },
      { time: "Hari 3 - 09.00 WIB", title: "Perjalanan Kembali / Bebas", note: "Pelepasan konvoi balik menuju domisili masing-masing." },
    ],
    includes: [
      "Penginapan hotel 2 malam (shared twin)",
      "Official T-Shirt & Emblem Touring Resmi",
      "Sticker Pack & Pin Logam Ekspedisi",
      "Mobil Sweeper & Tim Medis Darurat",
      "Pengawalan & Barisan Safety Officer",
      "Konsumsi & Gala Dinner Yogyakarta",
    ],
    mandatoryGears: [
      "Helm Full Face / Modular standar SNI / DOT",
      "Jaket riding dengan protektor siku & bahu",
      "Sarung tangan kulit / tekstil full finger",
      "Sepatu riding kokoh menutup mata kaki",
      "Surat kendaraan lengkap (STNK & SIM C aktif)",
      "Jas hujan berkualitas (two-piece)",
    ],
  },
  {
    id: "evt-002-safety-clinic",
    slug: "safety-clinic-2026",
    title: "Safety Riding Clinic & Emergency First Aid",
    category: "Workshop & Edukasi",
    description:
      "Pelatihan teknik pengereman basah (wet braking), manuver counter-steering, dan pertolongan pertama pada insiden darurat konvoi aspal.",
    cover_image_url:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop",
    location_name: "Sirkuit Sentul Paddock Area",
    location_address: "Kawasan Sirkuit Sentul, Babakan Madang, Bogor",
    map_link: "https://maps.google.com/?q=Sentul+International+Circuit",
    start_time: "2026-12-12T08:00:00+07:00",
    end_time: "2026-12-12T16:00:00+07:00",
    registration_deadline: "2026-12-05T23:59:59+07:00",
    capacity: 60,
    fee: 0,
    status: "published",
    registeredCount: 24,
    attendedCount: 0,
    created_at: "2026-10-05T10:30:00Z",
    itinerary: [
      { time: "08.00 WIB", title: "Registrasi & Pemeriksaan Fisik Rider", note: "Absensi QR code dan pembagian modul panduan safety." },
      { time: "09.00 WIB", title: "Materi Teori & Dinamika Kendaraan", note: "Pembekalan teknik pengereman basah, distribusi bobot, dan line racing aman." },
      { time: "11.30 WIB", title: "Simulasi Emergency First Aid", note: "Praktik pertolongan pertama pada insiden konvoi bersama tim medis." },
      { time: "13.30 WIB", title: "Praktek Sirkuit (Wet Braking & Slalom)", note: "Sesi uji coba langsung di trek aspal didampingi instruktur berlisensi." },
      { time: "15.30 WIB", title: "Evaluasi & Penyerahan Sertifikat", note: "Ulasan berkendara dan penyerahan badge Safety Rider Brotherhood." },
    ],
    includes: [
      "Sertifikat Pelatihan Safety Riding Resmi",
      "Snack & Makan Siang Paddock",
      "Modul Panduan & Checklist Emergency",
      "Sticker Pelatihan & Emblem Kehormatan",
      "Asuransi Latihan Sirkuit",
    ],
    mandatoryGears: [
      "Helm Full Face SNI / ECE / DOT",
      "Jaket Riding Protektor (Bahu, Siku, Punggung)",
      "Sarung Tangan Full Finger Protektor",
      "Sepatu Riding / Boots di atas mata kaki",
      "SIM C Aktif & Motor dalam kondisi prima",
    ],
  },
  {
    id: "evt-003-anniversary",
    slug: "anniversary-brotherhood-2027",
    title: "Malam Keakraban 8th Anniversary Brotherhood",
    category: "Anniversary Gathering",
    description:
      "Perayaan hari jadi ke-8 dengan agenda api unggun, pelantikan anggota baru, dan penyerahan lencana kehormatan loyalitas riding.",
    cover_image_url:
      "https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=1200&auto=format&fit=crop",
    location_name: "Camp Ground Sukamantri, Bogor",
    location_address: "Taman Nasional Gunung Halimun Salak, Tamansari, Bogor",
    map_link: "https://maps.google.com/?q=Sukamantri+Campground+Bogor",
    start_time: "2027-01-02T14:00:00+07:00",
    end_time: "2027-01-03T12:00:00+07:00",
    registration_deadline: "2026-12-25T23:59:59+07:00",
    capacity: 80,
    fee: 200000,
    status: "published",
    registeredCount: 42,
    attendedCount: 0,
    created_at: "2026-10-10T12:00:00Z",
    itinerary: [
      { time: "Hari 1 - 14.00 WIB", title: "Registrasi & Setup Tenda Camp", note: "Check-in camping ground dan pembagian nomor kavling tenda." },
      { time: "Hari 1 - 16.30 WIB", title: "Games Persaudaraan & Senja", note: "Aktivitas fun antar chapter dan ramah tamah member." },
      { time: "Hari 1 - 19.30 WIB", title: "Api Unggun & Malam Pelantikan", note: "Penyematan rompi resmi anggota baru dan renungan persaudaraan." },
      { time: "Hari 2 - 07.00 WIB", title: "Sarapan Pagi & Morning Ride Halimun", note: "Rolling santai jalur pegunungan kabut Halimun Salak." },
      { time: "Hari 2 - 11.00 WIB", title: "Foto Bersama & Penutupan", note: "Persiapan konvoi kembali ke domisili masing-masing." },
    ],
    includes: [
      "Tenda Camping Dome (kapasitas 4 orang)",
      "Makan Malam BBQ & Sarapan Pagi",
      "Official Anniversary T-Shirt & Pin Logam",
      "Tiket Masuk Kawasan TN Gunung Halimun Salak",
      "Dokumentasi Foto & Video Cinematic",
    ],
    mandatoryGears: [
      "Jaket Hangat / Windbreaker Gunung",
      "Perlengkapan Tidur (Sleeping Bag / Matras)",
      "Jas Hujan Standar",
      "Senter / Headlamp",
      "Obat-obatan Pribadi",
    ],
  },
];

/**
 * Fetch all events from Supabase, parse metadata, and calculate registrations
 */
export async function fetchEventsList(): Promise<EventItem[]> {
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return DEFAULT_EVENTS;
  }

  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createAdminClient();
    } else {
      supabase = await createClient();
    }

    const { data: dbEvents, error } = await supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: false });

    if (error) {
      console.warn("fetchEventsList error:", error.message);
      return DEFAULT_EVENTS;
    }

    if (!dbEvents || dbEvents.length === 0) {
      return DEFAULT_EVENTS;
    }

    // Fetch registration counts for each event
    const eventIds = dbEvents.map((e) => e.id);
    const regCounts: Record<string, number> = {};
    const attendedCounts: Record<string, number> = {};

    try {
      const { data: regs } = await supabase
        .from("event_registrations")
        .select("event_id, status")
        .in("event_id", eventIds);

      if (regs) {
        for (const r of regs) {
          regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1;
          if (r.status === "attended") {
            attendedCounts[r.event_id] = (attendedCounts[r.event_id] || 0) + 1;
          }
        }
      }
    } catch {
      // ignore registration count query errors
    }

    const formattedEvents: EventItem[] = dbEvents.map((item) => {
      let rawDesc = item.description || "";
      let category = "Touring Akbar";

      // 1. Extract category
      const catMatch = rawDesc.match(/<!--CATEGORY:([\s\S]*?)-->/);
      if (catMatch) {
        category = catMatch[1].trim();
        rawDesc = rawDesc.replace(/<!--CATEGORY:[\s\S]*?-->/, "").trim();
      }

      // Check default fallback
      const matchingDefault = DEFAULT_EVENTS.find((d) => d.slug === item.slug);

      // 2. Extract itinerary
      let itinerary: ItineraryItem[] = matchingDefault?.itinerary || [];
      const itinMatch = rawDesc.match(/<!--ITINERARY:([\s\S]*?)-->/);
      if (itinMatch) {
        try {
          itinerary = JSON.parse(itinMatch[1]);
          rawDesc = rawDesc.replace(/<!--ITINERARY:[\s\S]*?-->/, "").trim();
        } catch {}
      }

      // 3. Extract includes / facilities
      let includes: string[] = matchingDefault?.includes || [];
      const incMatch = rawDesc.match(/<!--INCLUDES:([\s\S]*?)-->/);
      if (incMatch) {
        try {
          includes = JSON.parse(incMatch[1]);
          rawDesc = rawDesc.replace(/<!--INCLUDES:[\s\S]*?-->/, "").trim();
        } catch {}
      }

      // 4. Extract mandatory gears
      let mandatoryGears: string[] = matchingDefault?.mandatoryGears || [];
      const gearMatch = rawDesc.match(/<!--MANDATORY_GEARS:([\s\S]*?)-->/);
      if (gearMatch) {
        try {
          mandatoryGears = JSON.parse(gearMatch[1]);
          rawDesc = rawDesc.replace(/<!--MANDATORY_GEARS:[\s\S]*?-->/, "").trim();
        } catch {}
      }

      const computedRegistered =
        regCounts[item.id] !== undefined
          ? regCounts[item.id]
          : matchingDefault?.registeredCount || 0;

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: rawDesc,
        category,
        cover_image_url: item.cover_image_url || matchingDefault?.cover_image_url || null,
        location_name: item.location_name,
        location_address: item.location_address || null,
        map_link: item.map_link || null,
        start_time: item.start_time,
        end_time: item.end_time,
        registration_deadline: item.registration_deadline,
        capacity: Number(item.capacity) || 50,
        fee: Number(item.fee) || 0,
        status: item.status || "published",
        created_at: item.created_at,
        registeredCount: computedRegistered,
        attendedCount: attendedCounts[item.id] || 0,
        itinerary,
        includes,
        mandatoryGears,
      };
    });

    return formattedEvents;
  } catch (err: unknown) {
    console.error("fetchEventsList unexpected error:", err);
    return DEFAULT_EVENTS;
  }
}
