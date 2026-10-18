import { z } from "zod";

export const eventFormSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(5, "Judul event minimal 5 karakter")
    .max(120, "Judul event maksimal 120 karakter"),
  slug: z
    .string()
    .min(3, "Slug harus diisi")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan strip (-)"),
  category: z.string(),
  description: z.string().min(10, "Deskripsi event minimal 10 karakter"),
  coverImageUrl: z.string().optional().or(z.literal("")),
  locationName: z.string().min(3, "Nama lokasi / meeting point harus diisi"),
  locationAddress: z.string().optional().or(z.literal("")),
  mapLink: z.string().url("Format link Google Maps tidak valid").optional().or(z.literal("")),
  startTime: z.string().min(1, "Waktu mulai event harus ditentukan"),
  endTime: z.string().min(1, "Waktu selesai event harus ditentukan"),
  registrationDeadline: z.string().min(1, "Batas akhir pendaftaran harus ditentukan"),
  capacity: z.number().min(1, "Kapasitas minimal 1 peserta").max(1000, "Kapasitas maksimal 1000 peserta"),
  fee: z.number().min(0, "Biaya pendaftaran tidak boleh negatif"),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
  itinerary: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        note: z.string(),
      })
    )
    .optional(),
  includes: z.array(z.string()).optional(),
  mandatoryGears: z.array(z.string()).optional(),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;


export const checkinTokenSchema = z.object({
  eventId: z.string().min(1, "ID event harus diisi"),
  tokenHash: z.string().min(6, "Token QR tidak valid"),
});

export type CheckinTokenInput = z.infer<typeof checkinTokenSchema>;

