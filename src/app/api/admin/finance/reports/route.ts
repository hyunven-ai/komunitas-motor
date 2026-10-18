import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFinanceAccountsWithSettings } from "@/features/finance/sync-accounts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch & sync finance accounts with portal settings
    const accounts = await syncFinanceAccountsWithSettings(supabase);
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    // 2. Fetch all events
    const { data: events, error: evErr } = await supabase
      .from("events")
      .select("id, title, fee, start_time, end_time, status")
      .order("start_time", { ascending: false });

    if (evErr) {
      console.error("GET /api/admin/finance/reports events error:", evErr);
      return NextResponse.json(
        { success: false, message: "Gagal memuat laporan event: " + evErr.message },
        { status: 500 }
      );
    }

    // 3. Fetch event registrations
    const { data: registrations } = await supabase
      .from("event_registrations")
      .select("id, event_id, status");

    // 4. Fetch invoices & transactions for events
    const { data: invoices } = await supabase
      .from("event_invoices")
      .select("id, event_id, amount, status");

    const { data: transactions } = await supabase
      .from("finance_transactions")
      .select("id, event_id, account_id, type, amount, category, description, reference_number, transaction_date")
      .order("transaction_date", { ascending: false });

    const reports = (events || []).map((evt) => {
      // Registrations for event
      const eventRegs = (registrations || []).filter((r) => r.event_id === evt.id);
      const participantsCount = eventRegs.filter((r) =>
        ["registered", "confirmed", "attended"].includes(r.status)
      ).length;

      // Invoices paid
      const eventInvs = (invoices || []).filter(
        (inv) => inv.event_id === evt.id && inv.status === "paid"
      );
      const totalRegistrationIncome = eventInvs.reduce(
        (sum, inv) => sum + (Number(inv.amount) || 0),
        0
      );

      // Event transactions
      const eventTxs = (transactions || []).filter((tx) => tx.event_id === evt.id);
      const incomeTxs = eventTxs.filter((tx) => tx.type === "income");
      const expenseTxs = eventTxs.filter((tx) => tx.type === "expense");

      // Additional income (sponsorship / donasi)
      const additionalIncomeTxs = incomeTxs.filter((tx) => tx.category !== "Event Registration");
      const sponsorshipIncome = additionalIncomeTxs.reduce(
        (sum, tx) => sum + (Number(tx.amount) || 0),
        0
      );

      const sponsorships = additionalIncomeTxs.map((tx) => {
        const acc = accountMap.get(tx.account_id);
        return {
          id: tx.id,
          category: tx.category,
          amount: Number(tx.amount) || 0,
          notes: tx.description,
          accountId: tx.account_id,
          accountName: acc ? acc.name : "Kas Komunitas",
          referenceNumber: tx.reference_number || undefined,
        };
      });

      const totalIncome = totalRegistrationIncome + sponsorshipIncome;

      const expenses = expenseTxs.map((tx) => {
        const acc = accountMap.get(tx.account_id);
        return {
          id: tx.id,
          category: tx.category,
          amount: Number(tx.amount) || 0,
          notes: tx.description,
          accountId: tx.account_id,
          accountName: acc ? acc.name : "Kas Komunitas",
          referenceNumber: tx.reference_number || undefined,
        };
      });

      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      const netSurplus = totalIncome - totalExpense;

      // Format event date
      const start = new Date(evt.start_time);
      const end = new Date(evt.end_time);
      const formattedDate = !isNaN(start.getTime())
        ? `${start.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}` +
          (!isNaN(end.getTime()) ? ` - ${end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}` : "")
        : "Tanggal Belum Ditentukan";

      return {
        eventId: evt.id,
        eventName: evt.title,
        eventDate: formattedDate,
        participantsCount: participantsCount || 0,
        ticketPrice: Number(evt.fee) || 0,
        totalRegistrationIncome: totalRegistrationIncome,
        sponsorshipIncome: sponsorshipIncome,
        sponsorships: sponsorships,
        totalIncome: totalIncome,
        expenses: expenses,
        totalExpense: totalExpense,
        netSurplus: netSurplus,
        status: (evt.status === "completed" ? "completed" : "ongoing") as "completed" | "ongoing" | "planning",
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        reports: reports,
        accounts: accounts || [],
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/finance/reports catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, accountId, type, amount, category, description, referenceNumber } = body;

    if (!eventId || !accountId || !category || !description || !amount) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi (Event, Rekening, Kategori, Nominal, Keterangan)." },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Nominal pengeluaran harus berupa angka lebih besar dari 0." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Default admin user ID
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const adminId = adminUsers?.users?.[0]?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const { data: inserted, error: insErr } = await supabase
      .from("finance_transactions")
      .insert({
        event_id: eventId,
        account_id: accountId,
        type: type === "income" ? "income" : "expense",
        amount: numAmount,
        category: category.trim(),
        description: description.trim(),
        reference_number: referenceNumber ? referenceNumber.trim() : null,
        recorded_by: adminId,
        transaction_date: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insErr) {
      console.error("POST /api/admin/finance/reports error:", insErr);
      return NextResponse.json(
        { success: false, message: "Gagal mencatat pengeluaran event: " + insErr.message },
        { status: 500 }
      );
    }

    // Record audit log
    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: type === "income" ? "CREATE_EVENT_INCOME" : "CREATE_EVENT_EXPENSE",
      entity_type: "finance_transactions",
      entity_id: inserted.id,
      new_data: {
        event_id: eventId,
        account_id: accountId,
        type: type === "income" ? "income" : "expense",
        amount: numAmount,
        category: category.trim(),
        description: description.trim(),
        reference_number: referenceNumber || null,
      },
      ip_address: ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: type === "income" ? "Dana sponsor/pemasukan event berhasil dicatat!" : "Pos pengeluaran event berhasil dicatat dan dibukukan!",
      data: inserted,
    });
  } catch (err: unknown) {
    console.error("POST /api/admin/finance/reports catch:", err);
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

    if (!id || !accountId || !category || !description || !amount) {
      return NextResponse.json(
        { success: false, message: "ID, Rekening, Kategori, Nominal, dan Keterangan wajib diisi." },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Nominal harus berupa angka lebih besar dari 0." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch existing
    const { data: existing, error: existErr } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (existErr || !existing) {
      return NextResponse.json(
        { success: false, message: "Catatan pengeluaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Update
    const { data: updated, error: updErr } = await supabase
      .from("finance_transactions")
      .update({
        account_id: accountId,
        type: type === "income" ? "income" : "expense",
        amount: numAmount,
        category: category.trim(),
        description: description.trim(),
        reference_number: referenceNumber ? referenceNumber.trim() : null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updErr) {
      console.error("PUT /api/admin/finance/reports error:", updErr);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui pengeluaran: " + updErr.message },
        { status: 500 }
      );
    }

    // Audit log
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const adminId = adminUsers?.users?.[0]?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "UPDATE_EVENT_EXPENSE",
      entity_type: "finance_transactions",
      entity_id: id,
      old_data: existing,
      new_data: updated,
      ip_address: ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Data pengeluaran event berhasil diperbarui!",
      data: updated,
    });
  } catch (err: unknown) {
    console.error("PUT /api/admin/finance/reports catch:", err);
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
        { success: false, message: "ID Transaksi pengeluaran harus disertakan." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch existing
    const { data: existing, error: existErr } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (existErr || !existing) {
      return NextResponse.json(
        { success: false, message: "Pengeluaran tidak ditemukan." },
        { status: 404 }
      );
    }

    // Delete
    const { error: delErr } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", id);

    if (delErr) {
      console.error("DELETE /api/admin/finance/reports error:", delErr);
      return NextResponse.json(
        { success: false, message: "Gagal menghapus pengeluaran: " + delErr.message },
        { status: 500 }
      );
    }

    // Audit log
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const adminId = adminUsers?.users?.[0]?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "DELETE_EVENT_EXPENSE",
      entity_type: "finance_transactions",
      entity_id: id,
      old_data: existing,
      ip_address: ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Pos pengeluaran event berhasil dihapus dari buku kas!",
    });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/finance/reports catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
