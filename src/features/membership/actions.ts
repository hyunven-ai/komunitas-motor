"use server";

import { membershipApplicationSchema, type MembershipApplicationInput } from "./schemas";
import { createClient } from "@/lib/supabase/server";

export interface ApplicationSubmitResult {
  success: boolean;
  message: string;
  applicationId?: string;
  errors?: Record<string, string[]>;
}

export async function submitMembershipApplication(
  data: MembershipApplicationInput
): Promise<ApplicationSubmitResult> {
  // 1. Validate payload server-side using Zod
  const validation = membershipApplicationSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data formulir tidak valid. Mohon periksa kembali isian Anda.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const validData = validation.data;
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    // Generate development reference code
    const mockRefId = `REG-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      message: "Pendaftaran berhasil dikirim! (Mode Pengujian Lokal)",
      applicationId: mockRefId,
    };
  }

  try {
    const supabase = await createClient();

    // Check if email already applied
    const { data: existingApp } = await supabase
      .from("membership_applications")
      .select("id, status")
      .eq("email", validData.email)
      .maybeSingle();

    if (existingApp && existingApp.status === "pending") {
      return {
        success: false,
        message: "Email ini sudah memiliki pendaftaran yang sedang dalam proses review pengurus.",
      };
    }

    const { data: inserted, error } = await supabase
      .from("membership_applications")
      .insert({
        full_name: validData.fullName,
        email: validData.email,
        phone_number: validData.phoneNumber,
        city: validData.city,
        motorcycle_model: validData.motorcycleModel,
        motorcycle_plate: validData.motorcyclePlate,
        motorcycle_year: validData.motorcycleYear,
        id_card_number: validData.idCardNumber || null,
        driving_license_number: validData.drivingLicenseNumber || null,
        emergency_contact_name: validData.emergencyContactName,
        emergency_contact_phone: validData.emergencyContactPhone,
        reason_to_join: validData.reasonToJoin?.trim() || "-",
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase application insert error:", error);
      return {
        success: false,
        message: "Gagal menyimpan pendaftaran ke database: " + error.message,
      };
    }

    return {
      success: true,
      message: "Formulir pendaftaran berhasil dikirim ke dewan pengurus.",
      applicationId: inserted?.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return {
      success: false,
      message: errorMsg,
    };
  }
}
