export interface SystemSettings {
  siteName: string;
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
  updatedAt?: string;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  siteName: "Brotherhood Motorcycle Community",
  basecampAddress: "Basecamp Brotherhood, Jl. Jalur Puncak No. 45, Bogor - Jawa Barat",
  hotlinePhone: "+62 812-9988-7711",
  adminWhatsApp: "6281299887711",
  secretariatEmail: "sekretariat@brotherhood.id",
  whatsAppGreeting:
    "Halo Admin Brotherhood Community,\nSaya telah berhasil mengisi formulir pendaftaran calon anggota baru di website dengan rincian berikut:",
  bcaAccountNumber: "8839-0192-81",
  bcaAccountHolder: "Brotherhood Motorcycle Community",
  mandiriAccountNumber: "133-00-29381-00",
  mandiriAccountHolder: "Brotherhood Community Kas",
  operationalStatus: "Sekretariat Sungai Pinyuh Aktif",
  roadCode: "Respect All, Fear None",
  convoyFormation: "Staggered Formation",
  complianceNote: "100% Zero-Alcohol",
  showOperationalBar: true,
};
