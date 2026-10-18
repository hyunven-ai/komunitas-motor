"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Bike,
  HeartHandshake,
  FileText,
  Loader2,
} from "lucide-react";
import {
  membershipApplicationSchema,
  type MembershipApplicationInput,
} from "@/features/membership/schemas";
import { submitMembershipApplication } from "@/features/membership/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JoinPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState<{
    success: boolean;
    applicationId?: string;
    message: string;
    formData?: MembershipApplicationInput;
  } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = React.useState<string>(
    (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6281299887711").replace(/\D/g, "")
  );
  const [whatsAppGreeting, setWhatsAppGreeting] = React.useState<string>(
    "Halo Admin Brotherhood Community,\nSaya telah berhasil mengisi formulir pendaftaran calon anggota baru di website dengan rincian berikut:"
  );

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data?.adminWhatsApp) {
          const clean = json.data.adminWhatsApp.replace(/\D/g, "");
          const formatted = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
          setAdminWhatsAppNumber(formatted);
          if (json.data.whatsAppGreeting) {
            setWhatsAppGreeting(json.data.whatsAppGreeting);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat nomor WhatsApp dinamis:", err);
      }
    }
    loadSettings();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MembershipApplicationInput>({
    resolver: zodResolver(membershipApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      city: "",
      motorcycleModel: "",
      motorcyclePlate: "",
      motorcycleYear: 2026,
      idCardNumber: "",
      drivingLicenseNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      reasonToJoin: "",
    },
  });

  const onSubmit = async (values: MembershipApplicationInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitMembershipApplication(values);
      if (result.success) {
        setSubmitSuccess({
          success: true,
          applicationId: result.applicationId,
          message: result.message,
          formData: values,
        });
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem saat mengirim data pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppConfirmationUrl = () => {
    const f = submitSuccess?.formData;
    const refText = submitSuccess?.applicationId ? `*No. Registrasi:* ${submitSuccess.applicationId}\n` : "";
    const greeting = whatsAppGreeting.trim();

    let message = "";
    if (f) {
      message = `${greeting}\n\n${refText}*Nama Lengkap:* ${f.fullName}\n*Kota Asal:* ${f.city}\n*Nomor WhatsApp:* ${f.phoneNumber}\n*Motor:* ${f.motorcycleModel} (${f.motorcycleYear})\n*Plat Nomor:* ${f.motorcyclePlate}\n\nMohon bantuannya untuk memproses dan mengonfirmasi pendaftaran saya. Terima kasih!`;
    } else {
      message = `Halo Admin Brotherhood Community,\nSaya telah mendaftar calon anggota baru via website.${submitSuccess?.applicationId ? ` Ref: ${submitSuccess.applicationId}` : ""}\nMohon bantuannya untuk proses verifikasi. Terima kasih!`;
    }

    return `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;
  };

  if (submitSuccess) {
    return (
      <div className="py-20 sm:py-32">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <Card className="border-muted-gold/40 bg-asphalt/80 p-8 sm:p-12 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted-gold/20 text-muted-gold border border-muted-gold/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="gold">Aplikasi Berhasil Diterima</Badge>
              <h2 className="text-3xl font-serif font-black uppercase text-bone">
                Terima Kasih Telah Mendaftar!
              </h2>
              <p className="text-sm text-bone-muted max-w-md mx-auto">
                Formulir Anda telah masuk ke dalam antrean verifikasi database dewan pengurus Brotherhood Community.
              </p>
            </div>

            {submitSuccess.applicationId && (
              <div className="rounded-lg border border-white/10 bg-charcoal p-4 max-w-xs mx-auto">
                <p className="text-[10px] uppercase tracking-widest text-bone-muted">
                  Nomor Referensi Pendaftaran
                </p>
                <p className="text-sm font-mono font-bold text-muted-gold mt-1 break-all">
                  {submitSuccess.applicationId}
                </p>
              </div>
            )}

            {/* Direct WhatsApp Confirmation Callout */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-5 text-center space-y-3.5 shadow-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Langkah Terakhir Konfirmasi
              </div>
              <p className="text-xs text-bone-muted max-w-md mx-auto">
                Agar data Anda segera diprioritaskan dan diverifikasi oleh dewan pengurus, silakan lanjutkan konfirmasi langsung ke nomor WhatsApp Admin:
              </p>
              <a
                href={getWhatsAppConfirmationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider text-black bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]"
              >
                <svg
                  className="h-5 w-5 fill-black"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Konfirmasi ke WhatsApp Admin Sekarang</span>
              </a>
            </div>

            <div className="rounded-lg bg-charcoal/50 p-4 text-left text-xs text-bone-muted space-y-2 border border-white/5">
              <p className="font-semibold text-bone">Tahapan Selanjutnya:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Divisi Keanggotaan akan memvalidasi data dan menghubungi Anda via WhatsApp.</li>
                <li>Undangan tatap muka / kopdar pengenalan calon anggota.</li>
                <li>Setelah disetujui, akun portal akan diaktifkan dan nomor KTA resmi diterbitkan.</li>
              </ul>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link href="/">
                <Button variant="default">Kembali ke Beranda</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline">Pelajari Ikrar Komunitas</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <Badge variant="default">Rekrutmen Anggota Baru</Badge>
          <h1 className="text-3xl sm:text-4xl font-serif font-black uppercase text-bone">
            Formulir Pendaftaran Calon Member
          </h1>
          <p className="text-sm text-bone-muted max-w-xl mx-auto">
            Lengkapi data diri dan spesifikasi kendaraan Anda di bawah ini secara akurat. Pengurus akan memverifikasi keabsahan data sebelum menerbitkan KTA digital.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-950/60 p-4 text-sm text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 1. DATA PRIBADI */}
          <Card className="border-white/10 bg-asphalt/60">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-gold">
                <User className="h-5 w-5" />
                <CardTitle className="text-lg">1. Identitas Pribadi</CardTitle>
              </div>
              <CardDescription>
                Informasi dasar pemohon keanggotaan Brotherhood.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fullName">Nama Lengkap (Sesuai KTP) *</Label>
                <Input
                  id="fullName"
                  placeholder="Contoh: Bambang Pamungkas"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Alamat Email Aktif *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@domain.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Nomor WhatsApp Aktif *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="081234567890"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-400">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="city">Kota Domisili Saat Ini *</Label>
                <Input
                  id="city"
                  placeholder="Contoh: Jakarta Selatan / Bogor / Bandung"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-xs text-red-400">{errors.city.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. DATA KENDARAAN */}
          <Card className="border-white/10 bg-asphalt/60">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-gold">
                <Bike className="h-5 w-5" />
                <CardTitle className="text-lg">2. Data Motor Touring</CardTitle>
              </div>
              <CardDescription>
                Motor yang akan digunakan saat agenda touring resmi.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="motorcycleModel">Merk & Model Motor *</Label>
                <Input
                  id="motorcycleModel"
                  placeholder="Contoh: Kawasaki Versys 650 / Honda CB500X"
                  {...register("motorcycleModel")}
                />
                {errors.motorcycleModel && (
                  <p className="text-xs text-red-400">
                    {errors.motorcycleModel.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motorcycleYear">Tahun Perakitan *</Label>
                <Input
                  id="motorcycleYear"
                  type="number"
                  {...register("motorcycleYear", { valueAsNumber: true })}
                />
                {errors.motorcycleYear && (
                  <p className="text-xs text-red-400">
                    {errors.motorcycleYear.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="motorcyclePlate">Nomor Polisi (Plat Motor) *</Label>
                <Input
                  id="motorcyclePlate"
                  placeholder="Contoh: B 3456 KBR"
                  {...register("motorcyclePlate")}
                />
                {errors.motorcyclePlate && (
                  <p className="text-xs text-red-400">
                    {errors.motorcyclePlate.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. KONTAK DARURAT */}
          <Card className="border-white/10 bg-asphalt/60">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-gold">
                <HeartHandshake className="h-5 w-5" />
                <CardTitle className="text-lg">
                  3. Kontak Darurat
                </CardTitle>
              </div>
              <CardDescription>
                Wajib untuk keselamatan medis darurat saat ekspedisi touring.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactName">
                  Nama Kontak Darurat (Keluarga/Istri/Ortu) *
                </Label>
                <Input
                  id="emergencyContactName"
                  placeholder="Nama kerabat terdekat"
                  {...register("emergencyContactName")}
                />
                {errors.emergencyContactName && (
                  <p className="text-xs text-red-400">
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactPhone">
                  Nomor Telepon Kontak Darurat *
                </Label>
                <Input
                  id="emergencyContactPhone"
                  placeholder="0812XXXXXXXX"
                  {...register("emergencyContactPhone")}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-xs text-red-400">
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4. ALASAN BERGABUNG */}
          <Card className="border-white/10 bg-asphalt/60">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-gold">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-lg">4. Alasan & Motivasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Label htmlFor="reasonToJoin">
                Mengapa Anda Ingin Bergabung dengan Brotherhood Community? (Opsional)
              </Label>
              <Textarea
                id="reasonToJoin"
                rows={4}
                placeholder="Ceritakan pengalaman riding atau harapan Anda bergabung dalam keluarga Brotherhood (opsional)..."
                {...register("reasonToJoin")}
              />
              {errors.reasonToJoin && (
                <p className="text-xs text-red-400">
                  {errors.reasonToJoin.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full text-base font-bold py-6 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Memproses Pendaftaran...</span>
                </>
              ) : (
                <>
                  <span>Kirim Formulir Pendaftaran</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-center text-xs text-bone-muted">
              Dengan mengirimkan formulir ini, Anda menyetujui AD/ART Komunitas serta berkomitmen mematuhi Ikrar Safety Riding Brotherhood.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
