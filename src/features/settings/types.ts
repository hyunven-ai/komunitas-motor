export interface SystemSettings {
  siteName: string;
  siteUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  siteDescription?: string;
  siteDescriptionEn?: string;
  basecampAddress: string;
  hotlinePhone: string;
  adminWhatsApp: string;
  secretariatEmail?: string;
  whatsAppGreeting?: string;
  bcaAccountNumber?: string;
  bcaAccountHolder?: string;
  mandiriAccountNumber?: string;
  mandiriAccountHolder?: string;
  // Status Operasional Bar
  operationalStatus?: string;
  roadCode?: string;
  convoyFormation?: string;
  complianceNote?: string;
  showOperationalBar?: boolean;
  // SEO & Webmaster Integrations
  googleVerificationToken?: string;
  gaMeasurementId?: string;
  defaultLocale?: "id" | "en";
  // Local SEO Geo Data
  latitude?: number;
  longitude?: number;
  geoRegion?: string;
  // Multi-Provider AI SEO Engine
  aiProvider?: "gemini" | "openai" | "claude" | "grok";
  openaiApiKey?: string;
  claudeApiKey?: string;
  grokApiKey?: string;
  geminiApiKey?: string;
  updatedAt?: string;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  siteName: "Borneo Brotherhood — Motorcycle Touring & Brotherhood Portal",
  siteUrl: "https://borneobikers.com",
  logoUrl: "/icon.png",
  faviconUrl: "/favicon.ico",
  siteDescription:
    "Portal resmi manajemen komunitas motor touring Borneo Brotherhood. Info touring akbar, pendaftaran anggota, e-KTA digital verifikasi QR, dan forum bikers se-Borneo.",
  siteDescriptionEn:
    "Official Borneo Brotherhood motorcycle touring portal. Expedition routes, membership registration, digital e-KTA verification, and cross-border riders community.",
  basecampAddress: "Sekretariat Borneo Brotherhood, Jl. Trans Kalimantan No. 88, Pontianak - Kalimantan Barat",
  hotlinePhone: "+62 812-9988-7711",
  adminWhatsApp: "6281299887711",
  secretariatEmail: "sekretariat@borneobikers.com",
  whatsAppGreeting:
    "Halo Admin Brotherhood Community,\nSaya telah berhasil mengisi formulir pendaftaran calon anggota baru di website dengan rincian berikut:",
  bcaAccountNumber: "8839-0192-81",
  bcaAccountHolder: "Borneo Brotherhood Community",
  mandiriAccountNumber: "133-00-29381-00",
  mandiriAccountHolder: "Borneo Brotherhood Kas",
  operationalStatus: "Sekretariat Sungai Pinyuh Aktif",
  roadCode: "Respect All, Fear None",
  convoyFormation: "Staggered Formation",
  complianceNote: "100% Zero-Alcohol & Safety Riding",
  showOperationalBar: true,
  defaultLocale: "id",
  latitude: -0.0263,
  longitude: 109.3425,
  geoRegion: "ID-KB",
  aiProvider: "gemini",
};
