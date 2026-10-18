import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak ditemukan." },
        { status: 401 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Resolve Member
    const { data: member } = await adminSupabase
      .from("members")
      .select("id, user_id, member_number, motorcycle_model, motorcycle_plate, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({
        success: true,
        data: {
          tickets: [],
          history: [],
          stats: { totalRegistered: 0, totalAttended: 0, attendanceRate: 100 },
        },
      });
    }

    // 2. Fetch all event registrations for this member
    const { data: registrations, error: regError } = await adminSupabase
      .from("event_registrations")
      .select(`
        id,
        event_id,
        status,
        registered_at,
        notes,
        event:events(
          id,
          title,
          slug,
          description,
          location_name,
          location_address,
          start_time,
          end_time,
          fee,
          status,
          cover_image_url
        )
      `)
      .eq("member_id", member.id)
      .order("registered_at", { ascending: false });

    if (regError) {
      console.error("GET /api/member/attendance regError:", regError);
      return NextResponse.json(
        { success: false, message: "Gagal memuat data presensi: " + regError.message },
        { status: 500 }
      );
    }

    // 3. Fetch all attendance records for this member
    const { data: attendanceRecords } = await adminSupabase
      .from("attendance_records")
      .select("id, event_id, scanned_at, method, notes")
      .eq("member_id", member.id);

    const attendanceMap = new Map();
    (attendanceRecords || []).forEach((rec: any) => {
      attendanceMap.set(rec.event_id, rec);
    });

    // 4. Fetch invoices for this member to determine payment status
    const { data: invoices } = await adminSupabase
      .from("event_invoices")
      .select("id, event_id, invoice_number, amount, status")
      .eq("member_id", member.id);

    const invoiceMap = new Map();
    (invoices || []).forEach((inv: any) => {
      invoiceMap.set(inv.event_id, inv);
    });

    // 5. Ensure attendance tokens exist for active registrations
    const tickets = [];
    const history = [];

    const now = new Date();

    for (const reg of registrations || []) {
      const event: any = reg.event;
      if (!event) continue;

      const attendance = attendanceMap.get(event.id);
      const invoice = invoiceMap.get(event.id);
      const isAttended = reg.status === "attended" || !!attendance;

      // Determine or create check-in token
      let tokenHash = "";
      const { data: existingToken } = await adminSupabase
        .from("attendance_tokens")
        .select("token_hash, expires_at")
        .eq("event_id", event.id)
        .eq("member_id", member.id)
        .eq("is_revoked", false)
        .maybeSingle();

      if (existingToken) {
        tokenHash = existingToken.token_hash;
      } else {
        // Generate new token
        const randomStr = crypto.randomBytes(6).toString("hex").toUpperCase();
        const cleanMemberNumber = member.member_number.replace(/[^a-zA-Z0-9]/g, "");
        tokenHash = `EVT-ATT-${event.id.slice(0, 6).toUpperCase()}-${cleanMemberNumber}-${randomStr}`;

        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        await adminSupabase.from("attendance_tokens").insert({
          event_id: event.id,
          member_id: member.id,
          token_hash: tokenHash,
          expires_at: expiryDate.toISOString(),
        });
      }

      const item = {
        registrationId: reg.id,
        eventId: event.id,
        eventTitle: event.title,
        locationName: event.location_name,
        locationAddress: event.location_address,
        startTime: event.start_time,
        endTime: event.end_time,
        eventFee: event.fee,
        eventStatus: event.status,
        registrationStatus: reg.status, // 'registered' | 'confirmed' | 'attended' | 'cancelled'
        registeredAt: reg.registered_at,
        tokenHash,
        isAttended,
        attendedAt: attendance?.scanned_at || null,
        checkinMethod: attendance?.method || null,
        invoice: invoice
          ? {
              id: invoice.id,
              invoiceNumber: invoice.invoice_number,
              amount: invoice.amount,
              status: invoice.status,
            }
          : null,
      };

      // If already attended or event ended in the past, add to history
      const eventEndTime = new Date(event.end_time || event.start_time);
      if (isAttended || eventEndTime < now) {
        history.push(item);
      }

      // If active (not cancelled, and event is not yet finished or attended recently)
      if (reg.status !== "cancelled") {
        tickets.push(item);
      }
    }

    const totalRegistered = (registrations || []).length;
    const totalAttended = history.filter((h) => h.isAttended).length;
    const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        history,
        stats: {
          totalRegistered,
          totalAttended,
          attendanceRate,
        },
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/member/attendance catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem internal.",
      },
      { status: 500 }
    );
  }
}
