import { NextRequest, NextResponse } from "next/server";
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
    const adminSupabase = createAdminClient();

    // 1. Resolve Member ID
    let memberId: string | null = null;
    if (user) {
      const { data: member } = await adminSupabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      memberId = member?.id || null;
    }

    // 2. Fetch all published events
    const { data: events, error: eventErr } = await adminSupabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: true });

    if (eventErr) {
      return NextResponse.json(
        { success: false, message: "Gagal memuat agenda event: " + eventErr.message },
        { status: 500 }
      );
    }

    // 3. Fetch all active registrations count per event
    const { data: allRegs } = await adminSupabase
      .from("event_registrations")
      .select("event_id, member_id, status");

    // 4. Fetch registrations & invoices for the current member
    let memberRegs: Record<string, any> = {};
    let memberInvoices: Record<string, any> = {};

    if (memberId) {
      const { data: userRegs } = await adminSupabase
        .from("event_registrations")
        .select("*")
        .eq("member_id", memberId);

      (userRegs || []).forEach((r) => {
        memberRegs[r.event_id] = r;
      });

      const { data: userInvs } = await adminSupabase
        .from("event_invoices")
        .select("*")
        .eq("member_id", memberId);

      (userInvs || []).forEach((inv) => {
        memberInvoices[inv.event_id] = inv;
      });
    }

    const now = new Date();

    const formattedEvents = (events || []).map((ev) => {
      const evRegs = (allRegs || []).filter(
        (r) => r.event_id === ev.id && ["registered", "confirmed", "attended"].includes(r.status)
      );
      const registeredCount = evRegs.length;

      const userReg = memberRegs[ev.id];
      const userInv = memberInvoices[ev.id];

      const deadline = ev.registration_deadline ? new Date(ev.registration_deadline) : null;
      const isPastDeadline = deadline ? now > deadline : false;
      const isFull = ev.capacity ? registeredCount >= ev.capacity : false;

      return {
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        description: ev.description,
        coverImageUrl: ev.cover_image_url,
        locationName: ev.location_name,
        locationAddress: ev.location_address,
        mapLink: ev.map_link,
        startTime: ev.start_time,
        endTime: ev.end_time,
        registrationDeadline: ev.registration_deadline,
        capacity: ev.capacity,
        fee: ev.fee || 0,
        registeredCount,
        isRegistered: !!userReg && userReg.status !== "cancelled",
        registrationId: userReg?.id,
        registrationStatus: userReg?.status,
        invoiceId: userInv?.id,
        invoiceNumber: userInv?.invoice_number,
        invoiceStatus: userInv?.status, // unpaid | submitted | paid | rejected
        invoiceAmount: userInv?.amount,
        isPastDeadline,
        isFull,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedEvents,
      memberId,
    });
  } catch (err: unknown) {
    console.error("GET /api/member/events catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem internal.",
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

    // 1. Resolve Member
    const { data: member, error: memErr } = await adminSupabase
      .from("members")
      .select("id, member_number, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (memErr || !member) {
      return NextResponse.json(
        { success: false, message: "Akun Anda belum terdaftar sebagai anggota resmi komunitas." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { eventId, notes } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID wajib disertakan." },
        { status: 400 }
      );
    }

    // 2. Fetch event
    const { data: event, error: evtErr } = await adminSupabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (evtErr || !event) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan." },
        { status: 404 }
      );
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { success: false, message: "Pendaftaran event ini belum dibuka untuk umum." },
        { status: 400 }
      );
    }

    const now = new Date();
    if (event.registration_deadline && now > new Date(event.registration_deadline)) {
      return NextResponse.json(
        { success: false, message: "Batas waktu pendaftaran event ini telah berakhir." },
        { status: 400 }
      );
    }

    // 3. Check existing registration
    const { data: existingReg } = await adminSupabase
      .from("event_registrations")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("member_id", member.id)
      .maybeSingle();

    if (existingReg && existingReg.status !== "cancelled") {
      return NextResponse.json(
        { success: false, message: "Anda sudah terdaftar dalam kegiatan event ini." },
        { status: 400 }
      );
    }

    // 4. Check capacity
    const { count } = await adminSupabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .in("status", ["registered", "confirmed", "attended"]);

    if (event.capacity && (count || 0) >= event.capacity) {
      return NextResponse.json(
        { success: false, message: "Kuota peserta event ini telah penuh." },
        { status: 400 }
      );
    }

    // 5. Insert registration
    const { data: newReg, error: regErr } = await adminSupabase
      .from("event_registrations")
      .insert({
        event_id: eventId,
        member_id: member.id,
        status: event.fee > 0 ? "registered" : "confirmed",
        notes: notes || "Pendaftaran mandiri via Portal Member",
      })
      .select()
      .single();

    if (regErr || !newReg) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan pendaftaran: " + (regErr?.message || "") },
        { status: 500 }
      );
    }

    // 6. If event has fee, create invoice
    let invoiceData = null;
    if (event.fee > 0) {
      const invNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${newReg.id.slice(0, 6).toUpperCase()}`;
      const { data: newInv, error: invErr } = await adminSupabase
        .from("event_invoices")
        .insert({
          invoice_number: invNum,
          event_id: eventId,
          member_id: member.id,
          amount: event.fee,
          status: "unpaid",
          due_date: event.registration_deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        })
        .select()
        .single();

      if (!invErr && newInv) {
        invoiceData = newInv;
      }
    }

    return NextResponse.json({
      success: true,
      message:
        event.fee > 0
          ? `Pendaftaran berhasil! Silakan lakukan pembayaran tagihan event sebesar ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(event.fee)}.`
          : "Pendaftaran berhasil! Anda resmi terdaftar dalam event ini.",
      data: {
        registrationId: newReg.id,
        invoice: invoiceData,
      },
    });
  } catch (err: unknown) {
    console.error("POST /api/member/events catch:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Terjadi kesalahan sistem internal.",
      },
      { status: 500 }
    );
  }
}
