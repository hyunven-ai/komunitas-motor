export interface HeroSlide {
  id: string;
  headlinePart1: string;
  headlineGold: string;
  taglineSub: string;
  subtitle: string;
  location: string;
  date: string;
  bgUrl: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-goreme",
    headlinePart1: "GÖREME",
    headlineGold: "VALLEY",
    taglineSub: "Ekspedisi Trans Kalimantan • 2.400 KM • Formasi Zig-zag Tertib",
    subtitle:
      "Menembus bentang alam eksotis dengan formasi konvoi selang-seling yang disiplin, aman, dan berpegang teguh pada prinsip zero incident kehormatan brotherhood.",
    location: "Cappadocia - Turkey",
    date: "1.200 MDPL • 2.400 KM",
    bgUrl:
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=2000&q=85",
    ctaText: "DISCOVER LOCATION",
    ctaLink: "/events",
    isActive: true,
    orderIndex: 0,
  },
  {
    id: "slide-antonien",
    headlinePart1: "SAINT",
    headlineGold: "ANTONIEN",
    taglineSub: "Pegunungan Alpen Salju • Puncak Eiger • Jalur Kelok Presisi",
    subtitle:
      "Jelajahi keagungan pegunungan dengan panorama spektakuler dan udara sejuk alpine. Menguji ketahanan fisik dan solidaritas berkendara tanpa kompromi.",
    location: "Switzerland Alps",
    date: "2.100 MDPL • Alpine Tour",
    bgUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85",
    ctaText: "DISCOVER LOCATION",
    ctaLink: "/events",
    isActive: true,
    orderIndex: 1,
  },
  {
    id: "slide-nagano",
    headlinePart1: "NAGANO",
    headlineGold: "PREFECTURE",
    taglineSub: "Japan Alps • Kuil Tradisional • Jalur Hutan Pinus Berkabut",
    subtitle:
      "Menyusuri jalur pegunungan legendaris bernuansa sejarah ksatria. Ketertiban berkendara berpadu dengan keindahan budaya dan lanskap pegunungan berkabut.",
    location: "Japan Alps",
    date: "1.850 MDPL • Culture Ride",
    bgUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=85",
    ctaText: "DISCOVER LOCATION",
    ctaLink: "/events",
    isActive: true,
    orderIndex: 2,
  },
  {
    id: "slide-marrakech",
    headlinePart1: "MARRAKECH",
    headlineGold: "MERZOUGA",
    taglineSub: "Sahara Desert • Jalur Gurun Eksotis • Golden Dunes Horizon",
    subtitle:
      "Eksplorasi padang pasir tak berujung dengan hembusan angin hangat gurun. Ujian ketangguhan mesin dan ketenangan mental seorang rider sejati.",
    location: "Sahara Desert - Morocco",
    date: "Gurun Sahara • Sunset Safari",
    bgUrl:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2000&q=85",
    ctaText: "DISCOVER LOCATION",
    ctaLink: "/events",
    isActive: true,
    orderIndex: 3,
  },
  {
    id: "slide-yosemite",
    headlinePart1: "YOSEMITE",
    headlineGold: "NATIONAL PARK",
    taglineSub: "Sierra Nevada • Tebing Granit El Capitan • Hutan Pinus Liar",
    subtitle:
      "Sensasi menyusuri lembah alam terbesar dengan air terjun raksasa dan dinding tebing granit megah yang memacu adrenalin petualang sejati.",
    location: "Sierra Nevada - USA",
    date: "2.400 MDPL • Wilderness",
    bgUrl:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2000&q=85",
    ctaText: "DISCOVER LOCATION",
    ctaLink: "/events",
    isActive: true,
    orderIndex: 4,
  },
  {
    id: "slide-brotherhood",
    headlinePart1: "SATU ASPAL,",
    headlineGold: "SATU JIWA.",
    taglineSub: "Borneo Brotherhood • Kepatuhan AD/ART • KTA Digital Terverifikasi",
    subtitle:
      "Wadah resmi perkumpulan penjelajah jalanan nusantara yang menjunjung tinggi kehormatan, kepatuhan safety riding tanpa kompromi, dan kepedulian sosial bagi sesama.",
    location: "Borneo Brotherhood • Central",
    date: "Dedikasi Sewindu • 100% Solidaritas",
    bgUrl:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=2000&q=85",
    ctaText: "DAFTAR CALON MEMBER",
    ctaLink: "/join",
    isActive: true,
    orderIndex: 5,
  },
];
