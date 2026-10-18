"use server";

import { revalidatePath } from "next/cache";
import { getSponsors, getSponsorInquiries } from "./queries";
import { Sponsor, SponsorInquiry } from "./types";
import { SponsorFormInput, sponsorFormSchema, SponsorInquiryInput, sponsorInquirySchema } from "./schemas";
import fs from "fs";
import path from "path";

const SPONSORS_FILE_PATH = path.join(process.cwd(), "src", "data", "sponsors.json");
const INQUIRIES_FILE_PATH = path.join(process.cwd(), "src", "data", "sponsor-inquiries.json");

/**
 * Helper to persist sponsors data to Supabase and local JSON
 */
async function persistSponsors(sponsors: Sponsor[]): Promise<void> {
  // 1. Write to local JSON file
  try {
    const dir = path.dirname(SPONSORS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SPONSORS_FILE_PATH, JSON.stringify(sponsors, null, 2), "utf-8");
  } catch (fileErr) {
    console.error("Gagal menyimpan ke file lokal sponsors.json:", fileErr);
  }

  // 2. Persist to Supabase
  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      const { createClient } = await import("@/lib/supabase/server");
      supabase = await createClient();
    }

    const { data: existing } = await supabase
      .from("announcements")
      .select("id")
      .eq("title", "__SPONSORS_DATA__")
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("announcements")
        .update({
          content: JSON.stringify(sponsors),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("announcements").insert({
        title: "__SPONSORS_DATA__",
        content: JSON.stringify(sponsors),
        type: "system",
        created_at: new Date().toISOString(),
      });
    }
  } catch (dbErr) {
    console.warn("Gagal simpan sponsors ke database, data tetap aman di file lokal:", dbErr);
  }
}

/**
 * Helper to persist inquiries
 */
async function persistInquiries(inquiries: SponsorInquiry[]): Promise<void> {
  try {
    const dir = path.dirname(INQUIRIES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(INQUIRIES_FILE_PATH, JSON.stringify(inquiries, null, 2), "utf-8");
  } catch (fileErr) {
    console.error("Gagal simpan file sponsor-inquiries.json:", fileErr);
  }

  try {
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      supabase = createAdminClient();
    } else {
      const { createClient } = await import("@/lib/supabase/server");
      supabase = await createClient();
    }

    const { data: existing } = await supabase
      .from("announcements")
      .select("id")
      .eq("title", "__SPONSOR_INQUIRIES__")
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("announcements")
        .update({
          content: JSON.stringify(inquiries),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("announcements").insert({
        title: "__SPONSOR_INQUIRIES__",
        content: JSON.stringify(inquiries),
        type: "system",
        created_at: new Date().toISOString(),
      });
    }
  } catch (dbErr) {
    console.warn("Gagal simpan inquiries ke database:", dbErr);
  }
}

/**
 * Create or update a sponsor
 */
export async function saveSponsorAction(data: SponsorFormInput): Promise<{
  success: boolean;
  message: string;
  sponsor?: Sponsor;
}> {
  const parsed = sponsorFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Validasi data sponsor gagal.",
    };
  }

  const input = parsed.data;
  const currentSponsors = await getSponsors();
  const now = new Date().toISOString();

  let updatedSponsors: Sponsor[];
  let savedItem: Sponsor;

  const memberPerk =
    input.memberPerkTitle || input.memberPerkDiscount
      ? {
          title: input.memberPerkTitle || "Promo Eksklusif Member",
          discountText: input.memberPerkDiscount || "Diskon Khusus",
          promoCode: input.memberPerkCode || undefined,
          terms: input.memberPerkTerms || undefined,
        }
      : undefined;

  if (input.id) {
    // Edit
    const index = currentSponsors.findIndex((s) => s.id === input.id);
    if (index === -1) {
      return { success: false, message: "Sponsor tidak ditemukan." };
    }

    savedItem = {
      ...currentSponsors[index],
      name: input.name,
      slug: input.slug,
      tier: input.tier,
      category: input.category,
      logoUrl: input.logoUrl,
      bannerUrl: input.bannerUrl || undefined,
      websiteUrl: input.websiteUrl || undefined,
      description: input.description,
      status: input.status,
      order: input.order,
      startDate: input.startDate || undefined,
      endDate: input.endDate || undefined,
      memberPerk,
      assignedEventIds: input.assignedEventIds || [],
      updatedAt: now,
    };

    updatedSponsors = [...currentSponsors];
    updatedSponsors[index] = savedItem;
  } else {
    // Create new
    const id = `spon-${Date.now().toString(36)}`;
    savedItem = {
      id,
      name: input.name,
      slug: input.slug,
      tier: input.tier,
      category: input.category,
      logoUrl: input.logoUrl,
      bannerUrl: input.bannerUrl || undefined,
      websiteUrl: input.websiteUrl || undefined,
      description: input.description,
      status: input.status,
      order: input.order || currentSponsors.length + 1,
      startDate: input.startDate || undefined,
      endDate: input.endDate || undefined,
      memberPerk,
      assignedEventIds: input.assignedEventIds || [],
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    updatedSponsors = [...currentSponsors, savedItem];
  }

  await persistSponsors(updatedSponsors);

  revalidatePath("/");
  revalidatePath("/partners");
  revalidatePath("/admin/sponsors");
  revalidatePath("/member/perks");

  return {
    success: true,
    message: input.id ? "Data sponsor berhasil diperbarui." : "Sponsor baru berhasil ditambahkan.",
    sponsor: savedItem,
  };
}

/**
 * Delete a sponsor
 */
export async function deleteSponsorAction(id: string): Promise<{ success: boolean; message: string }> {
  const currentSponsors = await getSponsors();
  const filtered = currentSponsors.filter((s) => s.id !== id);

  if (filtered.length === currentSponsors.length) {
    return { success: false, message: "Sponsor tidak ditemukan." };
  }

  await persistSponsors(filtered);

  revalidatePath("/");
  revalidatePath("/partners");
  revalidatePath("/admin/sponsors");
  revalidatePath("/member/perks");

  return { success: true, message: "Sponsor berhasil dihapus." };
}

/**
 * Toggle active/inactive
 */
export async function toggleSponsorStatusAction(
  id: string
): Promise<{ success: boolean; message: string; newStatus?: string }> {
  const currentSponsors = await getSponsors();
  const item = currentSponsors.find((s) => s.id === id);

  if (!item) {
    return { success: false, message: "Sponsor tidak ditemukan." };
  }

  const newStatus = item.status === "active" ? "inactive" : "active";
  item.status = newStatus;
  item.updatedAt = new Date().toISOString();

  await persistSponsors(currentSponsors);

  revalidatePath("/");
  revalidatePath("/partners");
  revalidatePath("/admin/sponsors");
  revalidatePath("/member/perks");

  return {
    success: true,
    message: `Status sponsor diubah menjadi ${newStatus === "active" ? "Aktif" : "Non-Aktif"}.`,
    newStatus,
  };
}

/**
 * Submit public partnership inquiry
 */
export async function submitSponsorInquiryAction(
  data: SponsorInquiryInput
): Promise<{ success: boolean; message: string }> {
  const parsed = sponsorInquirySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Validasi formulir pengajuan gagal.",
    };
  }

  const input = parsed.data;
  const currentInquiries = await getSponsorInquiries();

  const newInquiry: SponsorInquiry = {
    id: `inq-${Date.now().toString(36)}`,
    companyName: input.companyName,
    contactPerson: input.contactPerson,
    email: input.email,
    phone: input.phone,
    tierInterest: input.tierInterest,
    category: input.category,
    message: input.message,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  const updated = [newInquiry, ...currentInquiries];
  await persistInquiries(updated);

  revalidatePath("/admin/sponsors");

  return {
    success: true,
    message: "Terima kasih! Pengajuan kemitraan sponsorship Anda telah diterima. Tim Humas Brotherhood MC akan segera menghubungi Anda.",
  };
}

/**
 * Update inquiry status (admin)
 */
export async function updateInquiryStatusAction(
  id: string,
  status: SponsorInquiry["status"]
): Promise<{ success: boolean; message: string }> {
  const currentInquiries = await getSponsorInquiries();
  const inquiry = currentInquiries.find((i) => i.id === id);

  if (!inquiry) {
    return { success: false, message: "Pengajuan tidak ditemukan." };
  }

  inquiry.status = status;
  await persistInquiries(currentInquiries);

  revalidatePath("/admin/sponsors");

  return {
    success: true,
    message: `Status prospek berhasil diperbarui menjadi ${status}.`,
  };
}

/**
 * Record click on sponsor link
 */
export async function recordSponsorClickAction(id: string): Promise<void> {
  try {
    const currentSponsors = await getSponsors();
    const item = currentSponsors.find((s) => s.id === id);
    if (item) {
      item.clickCount = (item.clickCount || 0) + 1;
      await persistSponsors(currentSponsors);
    }
  } catch (err) {
    console.warn("Gagal merekam klik sponsor:", err);
  }
}
