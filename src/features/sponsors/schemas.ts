import { z } from "zod";

export const sponsorFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama brand minimal 2 karakter").max(80),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan strip (-)"),
  tier: z.enum(["main", "official", "event", "supporting"]),
  category: z.enum([
    "automotive_parts",
    "workshop_service",
    "apparel_gear",
    "oil_fluids",
    "hospitality_cafe",
    "other",
  ]),
  logoUrl: z.string().optional().default(""),
  bannerUrl: z.string().optional().or(z.literal("")),
  websiteUrl: z
    .string()
    .url("Format URL website tidak valid")
    .optional()
    .or(z.literal("")),
  description: z.string().min(10, "Deskripsi sponsor minimal 10 karakter"),
  status: z.enum(["active", "inactive", "expired"]),
  order: z.number().int().min(0).default(0),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  memberPerkTitle: z.string().optional().or(z.literal("")),
  memberPerkDiscount: z.string().optional().or(z.literal("")),
  memberPerkCode: z.string().optional().or(z.literal("")),
  memberPerkTerms: z.string().optional().or(z.literal("")),
  assignedEventIds: z.array(z.string()).optional(),
});

export type SponsorFormInput = z.infer<typeof sponsorFormSchema>;

export const sponsorInquirySchema = z.object({
  companyName: z.string().min(2, "Nama perusahaan/brand wajib diisi"),
  contactPerson: z.string().min(2, "Nama PIC wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  tierInterest: z.enum(["main", "official", "event", "supporting"]),
  category: z.enum([
    "automotive_parts",
    "workshop_service",
    "apparel_gear",
    "oil_fluids",
    "hospitality_cafe",
    "other",
  ]),
  message: z.string().min(15, "Pesan atau proposal pengantar minimal 15 karakter"),
});

export type SponsorInquiryInput = z.infer<typeof sponsorInquirySchema>;
