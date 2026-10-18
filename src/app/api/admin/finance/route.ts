import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFinanceAccountsWithSettings } from "@/features/finance/sync-accounts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch & sync finance accounts with portal settings
    const accounts = await syncFinanceAccountsWithSettings(supabase);

    // 2. Fetch payments
    const { data: payments, error: payErr } = await supabase
      .from("payments")
      .select(`
        id,
        invoice_id,
        member_id,
        amount,
        bank_name,
        account_name,
        proof_url,
        status,
        reviewed_by,
        reviewed_at,
        rejection_reason,
        submitted_at
      `)
      .order("submitted_at", { ascending: false });

    if (payErr) {
      console.error("GET /api/admin/finance payments err:", payErr);
      return NextResponse.json(
        { success: false, message: "Gagal mengambil data pembayaran: " + payErr.message },
        { status: 500 }
      );
    }

    // 3. Collect IDs for relation lookup
    const invoiceIds = (payments || []).map((p) => p.invoice_id).filter(Boolean);
    const memberIds = (payments || []).map((p) => p.member_id).filter(Boolean);

    // Fetch invoices with event_id
    const invoiceMap = new Map();
    const eventIds: string[] = [];
    if (invoiceIds.length > 0) {
      const { data: invs } = await supabase
        .from("event_invoices")
        .select("id, invoice_number, event_id, amount, status, due_date")
        .in("id", invoiceIds);

      (invs || []).forEach((inv) => {
        invoiceMap.set(inv.id, inv);
        if (inv.event_id) eventIds.push(inv.event_id);
      });
    }

    // Fetch events
    const eventMap = new Map();
    if (eventIds.length > 0) {
      const { data: evts } = await supabase
        .from("events")
        .select("id, title")
        .in("id", eventIds);

      (evts || []).forEach((e) => eventMap.set(e.id, e.title));
    }

    // Fetch members & profiles
    const memberMap = new Map();
    if (memberIds.length > 0) {
      const { data: mems } = await supabase
        .from("members")
        .select("id, user_id, member_number")
        .in("id", memberIds);

      const userIds = (mems || []).map((m) => m.user_id).filter(Boolean);
      const profileMap = new Map();
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        (profs || []).forEach((p) => profileMap.set(p.id, p.full_name));
      }

      (mems || []).forEach((m) => {
        memberMap.set(m.id, {
          memberNumber: m.member_number,
          memberName: profileMap.get(m.user_id) || "Anggota Brotherhood",
        });
      });
    }

    // Combine data
    const formattedPayments = (payments || []).map((p) => {
      const inv = invoiceMap.get(p.invoice_id);
      const mem = memberMap.get(p.member_id) || {
        memberNumber: "BMC-MEMBER",
        memberName: p.account_name || "Anggota Brotherhood",
      };
      const eventName = inv?.event_id ? eventMap.get(inv.event_id) || "Agenda Kegiatan Touring" : "Agenda Kegiatan Touring";

      const dateObj = new Date(p.submitted_at);
      const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " WIB"
        : p.submitted_at;

      return {
        id: p.id,
        invoiceId: p.invoice_id,
        invoiceNumber: inv?.invoice_number || `INV-${p.id.slice(0, 8)}`,
        memberId: p.member_id,
        memberName: mem.memberName,
        memberNumber: mem.memberNumber,
        eventName: eventName,
        amount: Number(p.amount) || 0,
        bankName: p.bank_name || "-",
        accountName: p.account_name || "-",
        proofUrl: p.proof_url || "",
        submittedAt: formattedDate,
        status: p.status,
        rejectionReason: p.rejection_reason || undefined,
      };
    });

    // 4. Fetch finance transactions to compute ledger balance, income, expense
    const { data: transactions } = await supabase
      .from("finance_transactions")
      .select("id, account_id, type, amount");

    let totalIncome = 0;
    let totalExpense = 0;
    const accountBalanceMap = new Map<string, number>();

    (transactions || []).forEach((t) => {
      const amt = Number(t.amount) || 0;
      const current = accountBalanceMap.get(t.account_id) || 0;
      if (t.type === "income") {
        totalIncome += amt;
        accountBalanceMap.set(t.account_id, current + amt);
      } else if (t.type === "expense") {
        totalExpense += amt;
        accountBalanceMap.set(t.account_id, current - amt);
      }
    });

    const netBalance = totalIncome - totalExpense;

    const enrichedAccounts = (accounts || []).map((acc) => ({
      ...acc,
      balance: accountBalanceMap.get(acc.id) || 0,
    }));

    const pendingCount = formattedPayments.filter((p) => p.status === "pending").length;
    const approvedCount = formattedPayments.filter((p) => p.status === "approved").length;
    const rejectedCount = formattedPayments.filter((p) => p.status === "rejected").length;

    return NextResponse.json({
      success: true,
      data: {
        payments: formattedPayments,
        accounts: enrichedAccounts,
        stats: {
          pendingCount,
          approvedCount,
          rejectedCount,
          total: formattedPayments.length,
          totalIncome,
          totalExpense,
          netBalance,
        },
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/finance catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, paymentId, accountId, reason } = body;

    const supabase = createAdminClient();

    // Default admin user ID for audit log / reviewed_by
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const adminId = adminUsers?.users?.[0]?.id || "69b1ae80-facc-40e9-9b60-d08cb2152d28";

    if (action === "approve") {
      if (!paymentId || !accountId) {
        return NextResponse.json(
          { success: false, message: "Payment ID dan Akun Kas harus disertakan." },
          { status: 400 }
        );
      }

      // Check if payment exists
      const { data: payment, error: pErr } = await supabase
        .from("payments")
        .select("id, invoice_id, member_id, amount, status")
        .eq("id", paymentId)
        .single();

      if (pErr || !payment) {
        return NextResponse.json(
          { success: false, message: "Data pembayaran tidak ditemukan di database." },
          { status: 404 }
        );
      }

      if (payment.status === "approved") {
        return NextResponse.json({
          success: true,
          message: "Pembayaran ini sudah disetujui sebelumnya.",
        });
      }

      // Try PostgreSQL atomic RPC function first
      const { error: rpcError } = await supabase.rpc("approve_event_payment_atomic", {
        p_payment_id: paymentId,
        p_reviewer_id: adminId,
        p_account_id: accountId,
      });

      if (rpcError) {
        console.warn("RPC approve_event_payment_atomic failed, applying direct updates:", rpcError);

        // Fallback: direct update
        await supabase
          .from("payments")
          .update({
            status: "approved",
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", paymentId);

        if (payment.invoice_id) {
          const { data: inv } = await supabase
            .from("event_invoices")
            .update({ status: "paid", updated_at: new Date().toISOString() })
            .eq("id", payment.invoice_id)
            .select("event_id, invoice_number")
            .single();

          if (inv?.event_id && payment.member_id) {
            await supabase
              .from("event_registrations")
              .update({ status: "confirmed" })
              .eq("event_id", inv.event_id)
              .eq("member_id", payment.member_id);
          }

          // Insert into finance_transactions
          await supabase.from("finance_transactions").insert({
            account_id: accountId,
            payment_id: paymentId,
            event_id: inv?.event_id || null,
            type: "income",
            amount: payment.amount,
            category: "Event Registration",
            description: `Iuran Event terverifikasi (${inv?.invoice_number || "INV"})`,
            reference_number: inv?.invoice_number || null,
            recorded_by: adminId,
            transaction_date: new Date().toISOString(),
          });
        }
      }

      // Record audit log for approval
      const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await supabase.from("audit_logs").insert({
        user_id: adminId,
        action: "APPROVE_PAYMENT",
        entity_type: "payments",
        entity_id: paymentId,
        new_data: {
          amount: payment.amount,
          account_id: accountId,
          invoice_id: payment.invoice_id,
          member_id: payment.member_id,
        },
        ip_address: ipAddress,
      });

      return NextResponse.json({
        success: true,
        message: "Pembayaran berhasil diverifikasi dan otomatis dibukukan ke buku kas!",
      });
    } else if (action === "reject") {
      if (!paymentId || !reason || reason.trim().length < 5) {
        return NextResponse.json(
          { success: false, message: "Alasan penolakan minimal 5 karakter harus disertakan." },
          { status: 400 }
        );
      }

      const { data: payment } = await supabase
        .from("payments")
        .select("invoice_id, amount, member_id")
        .eq("id", paymentId)
        .single();

      const { error: updateErr } = await supabase
        .from("payments")
        .update({
          status: "rejected",
          rejection_reason: reason,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (updateErr) {
        return NextResponse.json(
          { success: false, message: "Gagal menolak pembayaran: " + updateErr.message },
          { status: 500 }
        );
      }

      if (payment?.invoice_id) {
        await supabase
          .from("event_invoices")
          .update({ status: "unpaid", updated_at: new Date().toISOString() })
          .eq("id", payment.invoice_id);
      }

      // Record audit log for rejection
      const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await supabase.from("audit_logs").insert({
        user_id: adminId,
        action: "REJECT_PAYMENT",
        entity_type: "payments",
        entity_id: paymentId,
        new_data: {
          reason: reason,
          invoice_id: payment?.invoice_id,
          member_id: payment?.member_id,
          amount: payment?.amount,
        },
        ip_address: ipAddress,
      });

      return NextResponse.json({
        success: true,
        message: "Pembayaran telah ditolak dengan catatan alasan tersimpan.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak dikenali." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("POST /api/admin/finance catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
