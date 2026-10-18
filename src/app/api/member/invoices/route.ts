import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSystemSettings } from "@/features/settings/queries";

export const dynamic = "force-dynamic";

async function resolveUser(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: tokenData } = await supabase.auth.getUser(token);
    if (tokenData?.user) return tokenData.user;
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    const adminSupabase = createAdminClient();

    // 1. Fetch current settings for Bank Accounts
    const settings = await getSystemSettings();
    const bankAccounts = {
      bca: {
        bankName: "BANK CENTRAL ASIA (BCA)",
        accountNumber: settings.bcaAccountNumber || "8839-0192-81",
        accountHolder: settings.bcaAccountHolder || "Brotherhood Motorcycle Community",
      },
      mandiri: {
        bankName: "BANK MANDIRI",
        accountNumber: settings.mandiriAccountNumber || "133-00-29381-00",
        accountHolder: settings.mandiriAccountHolder || "Brotherhood Community Kas",
      },
    };

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          invoices: [],
          bankAccounts,
        },
      });
    }

    // 2. Resolve Member ID
    const { data: member } = await adminSupabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({
        success: true,
        data: {
          invoices: [],
          bankAccounts,
        },
      });
    }

    // 3. Fetch invoices
    const invoiceQueryId = req.nextUrl.searchParams.get("id");

    let query = adminSupabase
      .from("event_invoices")
      .select(`
        id,
        invoice_number,
        event_id,
        amount,
        status,
        due_date,
        created_at,
        event:events(id, title, location_name, start_time),
        payments(id, amount, bank_name, account_name, proof_url, status, submitted_at, reviewed_at)
      `)
      .order("created_at", { ascending: false });

    if (invoiceQueryId) {
      query = query.eq("id", invoiceQueryId);
    } else {
      query = query.eq("member_id", member.id);
    }

    const { data: invoices, error: invErr } = await query;

    if (invErr) {
      console.error("Fetch member invoices error:", invErr);
      return NextResponse.json(
        { success: false, message: "Gagal memuat invoice: " + invErr.message },
        { status: 500 }
      );
    }

    const formattedInvoices = (invoices || []).map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      eventId: inv.event_id,
      eventName: inv.event?.title || "Event Brotherhood",
      eventLocation: inv.event?.location_name || "-",
      eventStartTime: inv.event?.start_time || null,
      amount: inv.amount,
      status: inv.status, // unpaid | submitted | paid | rejected
      dueDate: inv.due_date ? inv.due_date.slice(0, 10) : "-",
      createdAt: inv.created_at,
      payments: inv.payments || [],
      latestPayment: inv.payments && inv.payments.length > 0 ? inv.payments[inv.payments.length - 1] : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        bankAccounts,
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/member/invoices catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient();

    // Resolve member
    const { data: member } = await adminSupabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Data anggota tidak ditemukan." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { invoiceId, bankName, accountName, amount, proofUrl, notes } = body;

    if (!invoiceId || !proofUrl || !bankName || !accountName) {
      return NextResponse.json(
        { success: false, message: "Data bukti pembayaran belum lengkap." },
        { status: 400 }
      );
    }

    // Insert payment record
    const { data: payRecord, error: payError } = await adminSupabase
      .from("payments")
      .insert({
        invoice_id: invoiceId,
        member_id: member.id,
        amount: Number(amount),
        bank_name: bankName,
        account_name: accountName,
        proof_url: proofUrl,
        status: "pending",
      })
      .select()
      .single();

    if (payError) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan bukti pembayaran: " + payError.message },
        { status: 500 }
      );
    }

    // Update invoice status to 'submitted'
    await adminSupabase
      .from("event_invoices")
      .update({ status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", invoiceId);

    return NextResponse.json({
      success: true,
      message: "Bukti transfer berhasil dikirim. Menunggu verifikasi Bendahara.",
      data: payRecord,
    });
  } catch (err: unknown) {
    console.error("POST /api/member/invoices catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
      },
      { status: 500 }
    );
  }
}
