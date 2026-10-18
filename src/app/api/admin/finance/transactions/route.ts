import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { manualTransactionSchema } from "@/features/finance/schemas";
import { syncFinanceAccountsWithSettings } from "@/features/finance/sync-accounts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch & sync finance accounts with portal settings
    const accounts = await syncFinanceAccountsWithSettings(supabase);
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    // 2. Fetch transactions
    const { data: transactions, error: txErr } = await supabase
      .from("finance_transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    if (txErr) {
      console.error("GET /api/admin/finance/transactions error:", txErr);
      return NextResponse.json(
        { success: false, message: "Gagal memuat buku kas: " + txErr.message },
        { status: 500 }
      );
    }

    // Format transactions
    const formatted = (transactions || []).map((t) => {
      const acc = accountMap.get(t.account_id);
      const accDisplay = acc
        ? `${acc.name}${acc.account_number ? ` (${acc.account_number})` : ""}`
        : "Kas Komunitas";

      const dateObj = new Date(t.transaction_date || t.created_at);
      const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " WIB"
        : t.transaction_date;

      return {
        id: t.id,
        type: t.type as "income" | "expense",
        accountId: t.account_id,
        accountName: accDisplay,
        category: t.category,
        description: t.description,
        referenceNumber: t.reference_number || undefined,
        amount: Number(t.amount) || 0,
        date: formattedDate,
        rawDate: t.transaction_date || t.created_at,
        isFromPayment: !!t.payment_id,
        paymentId: t.payment_id,
      };
    });

    // Calculate totals
    const totalIncome = formatted
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = formatted
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Per-account breakdown
    const accountBalances = (accounts || []).map((acc) => {
      const accTx = formatted.filter((t) => t.accountId === acc.id);
      const inc = accTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = accTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return {
        id: acc.id,
        name: acc.name,
        accountNumber: acc.account_number,
        accountHolder: acc.accountHolder,
        balance: inc - exp,
        income: inc,
        expense: exp,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions: formatted,
        accounts: accounts || [],
        summary: {
          totalIncome,
          totalExpense,
          netBalance,
          accountBalances,
        },
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/finance/transactions catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = manualTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data transaksi tidak valid.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { accountId, type, amount, category, description, referenceNumber } = validation.data;

    const supabase = createAdminClient();

    // Default admin user ID
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const adminId = adminUsers?.users?.[0]?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const { data: inserted, error: insErr } = await supabase
      .from("finance_transactions")
      .insert({
        account_id: accountId,
        type: type,
        amount: amount,
        category: category,
        description: description,
        reference_number: referenceNumber || null,
        recorded_by: adminId,
        transaction_date: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insErr) {
      console.error("POST /api/admin/finance/transactions insert error:", insErr);
      return NextResponse.json(
        { success: false, message: "Gagal mencatat transaksi: " + insErr.message },
        { status: 500 }
      );
    }

    // Record audit log
    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "CREATE_TRANSACTION",
      entity_type: "finance_transactions",
      entity_id: inserted.id,
      new_data: {
        type,
        amount,
        category,
        description,
        account_id: accountId,
        reference_number: referenceNumber || null,
      },
      ip_address: ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi kas berhasil dibukukan ke dalam buku kas!",
      data: inserted,
    });
  } catch (err: unknown) {
    console.error("POST /api/admin/finance/transactions catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, accountId, type, amount, category, description, referenceNumber } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Transaksi wajib disertakan." },
        { status: 400 }
      );
    }

    const validation = manualTransactionSchema.safeParse({
      accountId,
      type,
      amount: Number(amount),
      category,
      description,
      referenceNumber,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data perubahan transaksi tidak valid.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch existing transaction for old_data audit
    const { data: existing, error: existErr } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (existErr || !existing) {
      return NextResponse.json(
        { success: false, message: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    // Default admin user ID
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const adminId = adminUsers?.users?.[0]?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const { data: updated, error: updateErr } = await supabase
      .from("finance_transactions")
      .update({
        account_id: validation.data.accountId,
        type: validation.data.type,
        amount: validation.data.amount,
        category: validation.data.category,
        description: validation.data.description,
        reference_number: validation.data.referenceNumber || null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateErr) {
      console.error("PUT /api/admin/finance/transactions error:", updateErr);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui transaksi: " + updateErr.message },
        { status: 500 }
      );
    }

    // Record audit log
    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "UPDATE_TRANSACTION",
      entity_type: "finance_transactions",
      entity_id: id,
      old_data: {
        type: existing.type,
        amount: existing.amount,
        category: existing.category,
        description: existing.description,
        account_id: existing.account_id,
        reference_number: existing.reference_number,
      },
      new_data: {
        type: updated.type,
        amount: updated.amount,
        category: updated.category,
        description: updated.description,
        account_id: updated.account_id,
        reference_number: updated.reference_number,
      },
      ip_address: ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi kas berhasil diperbarui dan dicatat dalam audit log!",
      data: updated,
    });
  } catch (err: unknown) {
    console.error("PUT /api/admin/finance/transactions catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Transaksi harus disertakan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch existing transaction
    const { data: existing, error: existErr } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (existErr || !existing) {
      return NextResponse.json(
        { success: false, message: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    // Delete transaction
    const { error: delErr } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", id);

    if (delErr) {
      console.error("DELETE /api/admin/finance/transactions error:", delErr);
      return NextResponse.json(
        { success: false, message: "Gagal menghapus transaksi: " + delErr.message },
        { status: 500 }
      );
    }

    // If this transaction was tied to a payment, update payment status back to pending so data remains accurate
    if (existing.payment_id) {
      await supabase
        .from("payments")
        .update({ status: "pending", reviewed_by: null, reviewed_at: null })
        .eq("id", existing.payment_id);
    }

    // Record audit log
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const adminId = adminUsers?.users?.[0]?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "DELETE_TRANSACTION",
      entity_type: "finance_transactions",
      entity_id: id,
      old_data: existing,
      ip_address: ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi kas berhasil dihapus dari buku kas dan dicatat dalam audit log!",
    });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/finance/transactions catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
