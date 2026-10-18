"use server";

import { createClient } from "@/lib/supabase/server";
import {
  paymentSubmissionSchema,
  type PaymentSubmissionInput,
  manualTransactionSchema,
  type ManualTransactionInput,
} from "./schemas";

export interface FinanceActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Member submits manual bank transfer proof for an event invoice
 */
export async function submitPaymentProofAction(
  data: PaymentSubmissionInput,
  memberId: string
): Promise<FinanceActionResult<{ paymentId: string }>> {
  const validation = paymentSubmissionSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data bukti pembayaran tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { invoiceId, bankName, accountName, amount, proofUrl } = validation.data;
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    const mockPaymentId = `pay_${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      message: "Bukti transfer berhasil dikirim ke bendahara! (Mode Pengujian Lokal)",
      data: { paymentId: mockPaymentId },
    };
  }

  try {
    const supabase = await createClient();

    // 1. Insert payment record
    const { data: payRecord, error: payError } = await supabase
      .from("payments")
      .insert({
        invoice_id: invoiceId,
        member_id: memberId,
        amount,
        bank_name: bankName,
        account_name: accountName,
        proof_url: proofUrl,
        status: "pending",
      })
      .select("id")
      .single();

    if (payError) {
      return { success: false, message: payError.message };
    }

    // 2. Update invoice status to 'submitted'
    await supabase
      .from("event_invoices")
      .update({ status: "submitted" })
      .eq("id", invoiceId);

    return {
      success: true,
      message: "Bukti transfer berhasil dikirim. Menunggu verifikasi Bendahara.",
      data: { paymentId: payRecord.id },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, message: msg };
  }
}

/**
 * Treasurer approves payment atomically and writes to cash ledger
 */
export async function approvePaymentAction(
  paymentId: string,
  accountId: string,
  reviewerId?: string
): Promise<FinanceActionResult> {
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: "Pembayaran telah disetujui! Entri kas masuk otomatis tercatat di buku kas.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    const treasurerId = reviewerId || userAuth?.user?.id;

    if (!treasurerId) {
      return { success: false, message: "Akses ditolak: Bendahara belum login." };
    }

    // Call atomic PostgreSQL function from migration
    const { error } = await supabase.rpc("approve_event_payment_atomic", {
      p_payment_id: paymentId,
      p_reviewer_id: treasurerId,
      p_account_id: accountId,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Pembayaran berhasil diverifikasi dan dibukukan ke kas komunitas.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, message: msg };
  }
}

/**
 * Treasurer rejects payment with verified reason
 */
export async function rejectPaymentAction(
  paymentId: string,
  reason: string,
  reviewerId?: string
): Promise<FinanceActionResult> {
  if (!reason || reason.trim().length < 5) {
    return { success: false, message: "Alasan penolakan minimal 5 karakter." };
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: "Pembayaran ditolak. Notifikasi dikirimkan ke anggota.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();
    const treasurerId = reviewerId || userAuth?.user?.id;

    // Fetch payment to get invoice_id
    const { data: pay } = await supabase
      .from("payments")
      .select("invoice_id")
      .eq("id", paymentId)
      .single();

    // Update payment
    const { error: payErr } = await supabase
      .from("payments")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: treasurerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (payErr) {
      return { success: false, message: payErr.message };
    }

    if (pay?.invoice_id) {
      // Revert invoice back to unpaid
      await supabase
        .from("event_invoices")
        .update({ status: "unpaid" })
        .eq("id", pay.invoice_id);
    }

    return {
      success: true,
      message: "Pembayaran telah ditolak dengan catatan terverifikasi.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
    return { success: false, message: msg };
  }
}

/**
 * Record non-event manual cash transaction (Treasurer)
 */
export async function recordManualTransactionAction(
  data: ManualTransactionInput
): Promise<FinanceActionResult<{ transactionId: string }>> {
  const validation = manualTransactionSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: "Data transaksi tidak valid.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

  if (isMock) {
    return {
      success: true,
      message: "Transaksi kas berhasil dicatat di buku kas!",
      data: { transactionId: `trx_${Date.now()}` },
    };
  }

  try {
    const supabase = await createClient();
    const { data: userAuth } = await supabase.auth.getUser();

    if (!userAuth?.user) {
      return { success: false, message: "Akses ditolak: Silakan login." };
    }

    const { data: inserted, error } = await supabase
      .from("finance_transactions")
      .insert({
        account_id: validation.data.accountId,
        type: validation.data.type,
        amount: validation.data.amount,
        category: validation.data.category,
        description: validation.data.description,
        reference_number: validation.data.referenceNumber || null,
        recorded_by: userAuth.user.id,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Transaksi kas berhasil dicatat.",
      data: { transactionId: inserted.id },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal";
    return { success: false, message: msg };
  }
}
