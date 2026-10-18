import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch audit logs related to finance
    const { data: logs, error: logErr } = await supabase
      .from("audit_logs")
      .select("*")
      .or("entity_type.in.(finance_transactions,payments,finance_accounts),action.ilike.%TRANSACTION%,action.ilike.%PAYMENT%,action.ilike.%FINANCE%")
      .order("created_at", { ascending: false })
      .limit(100);

    if (logErr) {
      console.error("GET /api/admin/finance/logs error:", logErr);
      return NextResponse.json(
        { success: false, message: "Gagal memuat log audit keuangan: " + logErr.message },
        { status: 500 }
      );
    }

    // 2. Fetch operator profiles
    const userIds = Array.from(new Set((logs || []).map((l) => l.user_id).filter(Boolean)));
    const profileMap = new Map();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", userIds);

      (profiles || []).forEach((p) => {
        profileMap.set(p.id, p.full_name || p.display_name);
      });
    }

    // 3. Format logs
    const actionLabels: Record<string, { label: string; badge: "success" | "destructive" | "gold" | "outline" | "secondary" }> = {
      CREATE_TRANSACTION: { label: "Pencatatan Kas Manual", badge: "success" },
      UPDATE_TRANSACTION: { label: "Perubahan Transaksi Kas", badge: "gold" },
      DELETE_TRANSACTION: { label: "Penghapusan Transaksi", badge: "destructive" },
      APPROVE_PAYMENT: { label: "Verifikasi & Pembukuan Kas", badge: "success" },
      REJECT_PAYMENT: { label: "Penolakan Pembayaran", badge: "destructive" },
      INIT_FINANCE_SYSTEM: { label: "Inisialisasi Sistem Kas", badge: "outline" },
    };

    const formatted = (logs || []).map((l) => {
      const dateObj = new Date(l.created_at);
      const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) + " WIB"
        : l.created_at;

      const actInfo = actionLabels[l.action] || {
        label: l.action.replace(/_/g, " "),
        badge: "secondary" as const,
      };

      const operator = profileMap.get(l.user_id) || "Administrator HQ";

      return {
        id: l.id,
        action: l.action,
        actionLabel: actInfo.label,
        badgeVariant: actInfo.badge,
        entityType: l.entity_type,
        entityId: l.entity_id,
        operatorName: operator,
        oldData: l.old_data,
        newData: l.new_data,
        ipAddress: l.ip_address || "127.0.0.1",
        timestamp: formattedDate,
        rawTimestamp: l.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/finance/logs catch:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
