import { z } from "zod";

export const membershipApplicationSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z
    .string()
    .min(10, "Nomor WhatsApp minimal 10 digit")
    .max(16, "Nomor WhatsApp maksimal 16 digit")
    .regex(/^[0-9+]+$/, "Nomor telepon hanya boleh berisi angka dan simbol +"),
  city: z.string().min(2, "Kota domisili harus diisi"),
  motorcycleModel: z.string().min(2, "Tipe / merk motor harus diisi (cth: Yamaha MT-25, Versys 650)"),
  motorcyclePlate: z.string().min(3, "Nomor plat kendaraan harus diisi (cth: B 1234 ABC)"),
  motorcycleYear: z
    .number()
    .min(1980, "Tahun kendaraan minimal 1980")
    .max(2030, "Tahun kendaraan tidak valid"),
  idCardNumber: z.string().optional(),
  drivingLicenseNumber: z.string().optional(),
  emergencyContactName: z.string().min(3, "Nama kontak darurat harus diisi (keluarga/kerabat)"),
  emergencyContactPhone: z
    .string()
    .min(10, "Nomor kontak darurat minimal 10 digit")
    .max(16, "Nomor kontak darurat maksimal 16 digit"),
  reasonToJoin: z.string().optional().or(z.literal("")),
});

export type MembershipApplicationInput = z.infer<typeof membershipApplicationSchema>;
