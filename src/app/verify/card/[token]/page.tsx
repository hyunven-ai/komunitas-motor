import Link from "next/link";
import { Shield, CheckCircle2, AlertTriangle, ArrowLeft, Bike, Calendar, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Verifikasi Keaslian KTA — Brotherhood Community Portal",
  description: "Hasil verifikasi keabsahan Kartu Tanda Anggota resmi Brotherhood Motorcycle Community.",
};

export default async function VerifyCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const decodedToken = decodeURIComponent(token || "").trim();

  const adminSupabase = createAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedToken);

  let query = adminSupabase
    .from("members")
    .select(`
      id,
      user_id,
      member_number,
      status,
      motorcycle_model,
      motorcycle_plate,
      motorcycle_year,
      joined_date,
      qr_verification_token
    `);

  if (isUuid) {
    query = query.or(`id.eq.${decodedToken},qr_verification_token.eq.${decodedToken}`);
  } else {
    query = query.or(`qr_verification_token.eq.${decodedToken},member_number.ilike.${decodedToken}`);
  }

  const { data: member } = await query.maybeSingle();

  let fullName = "Anggota Brotherhood";
  let city = "-";
  let bloodType = "-";

  if (member) {
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("full_name, display_name, city, blood_type")
      .eq("id", member.user_id)
      .maybeSingle();

    if (profile?.full_name) {
      fullName = profile.full_name;
    } else {
      const { data: appData } = await adminSupabase
        .from("membership_applications")
        .select("full_name, city")
        .eq("user_id", member.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (appData?.full_name) {
        fullName = appData.full_name;
      }
      if (appData?.city && city === "-") {
        city = appData.city;
      }
    }

    if (profile?.city) city = profile.city;
    if (profile?.blood_type) bloodType = profile.blood_type;
  }

  const isValid = !!member;
  const isActive = member?.status === "active";

  const formatJoinedDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-bone flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-muted-gold/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Icon */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-muted-gold/40 bg-asphalt shadow-inner">
          <Shield className="h-7 w-7 text-muted-gold" />
        </div>
        <h2 className="font-serif text-lg font-black tracking-widest text-bone uppercase mt-2">
          BROTHERHOOD
        </h2>
        <p className="text-[10px] tracking-wider text-muted-gold font-mono uppercase">
          Sistem Verifikasi KTA Resmi
        </p>
      </div>

      <Card className="w-full max-w-md border-muted-gold/40 bg-asphalt/90 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center pb-4 border-b border-white/10 space-y-2">
          {isValid ? (
            <div className="space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <Badge variant="gold" className="text-xs font-mono font-bold tracking-wider">
                ANGGOTA RESMI & TERVERIFIKASI
              </Badge>
              <CardTitle className="text-xl font-serif font-black uppercase text-bone">
                KTA Sah Terdaftar
              </CardTitle>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950/80 text-red-400 border border-red-500/40">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <Badge variant="destructive" className="text-xs">
                TIDAK TERDAFTAR
              </Badge>
              <CardTitle className="text-xl font-serif font-black uppercase text-bone">
                Token Tidak Valid
              </CardTitle>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {isValid ? (
            <div className="space-y-3.5">
              <div className="rounded-lg bg-charcoal p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-bone-muted uppercase">Nama Anggota</span>
                  <span className="text-sm font-serif font-bold text-bone uppercase">{fullName}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-bone-muted uppercase">Nomor Anggota (KTA)</span>
                  <span className="text-xs font-mono font-bold text-muted-gold">{member.member_number}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-bone-muted uppercase">Status Keanggotaan</span>
                  <span className={`text-xs font-bold ${isActive ? "text-emerald-400" : "text-amber-400"}`}>
                    {isActive ? "Aktif (Good Standing)" : member.status?.toUpperCase() || "TERDAFTAR"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-bone-muted uppercase">Tanggal Bergabung</span>
                  <span className="text-xs text-bone">{formatJoinedDate(member.joined_date)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-bone-muted uppercase">Tipe Motor Terdaftar</span>
                  <span className="text-xs text-bone">{member.motorcycle_model || "-"}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-bone-muted uppercase">Nomor Polisi (Plat)</span>
                  <span className="text-xs font-mono text-muted-gold">{member.motorcycle_plate || "-"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-bone-muted uppercase">Kota / Domisili</span>
                  <span className="text-xs text-bone">{city}</span>
                </div>
              </div>

              <div className="text-[11px] text-bone-muted leading-relaxed text-center">
                Verifikasi real-time langsung dari server database Brotherhood Motorcycle Community. Keaslian identitas anggota terjamin.
              </div>
            </div>
          ) : (
            <p className="text-xs text-bone-muted text-center py-4 leading-relaxed">
              Kode QR atau tautan verifikasi ini tidak cocok dengan data keanggotaan aktif yang sah di database Brotherhood. Waspada terhadap potensi pemalsuan kartu atau keanggotaan.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0 border-t border-white/5">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full text-xs gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Buka Website Resmi Brotherhood</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
