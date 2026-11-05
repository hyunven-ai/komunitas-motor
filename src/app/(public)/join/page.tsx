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
  Save,
  Clock,
  ShieldCheck,
  Send,
  Copy,
  Check,
  ExternalLink,
  AtSign,
  MessageSquare,
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
import {
  SuccessState,
  ValidatedField,
  useDraftAutoSave,
} from "@/components/states";
import { DraftStorage } from "@/lib/states/draft-storage";

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

  const [autoForwardWhatsApp, setAutoForwardWhatsApp] = React.useState<boolean>(true);
  const [copiedApproval, setCopiedApproval] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MembershipApplicationInput>({
    resolver: zodResolver(membershipApplicationSchema),
    defaultValues: {
      fullName: "",
      username: "",
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

  const formValues = watch();
  const { lastSaved, clearDraft } = useDraftAutoSave(
    "membership_join_form",
    formValues as unknown as Record<string, unknown>,
    { title: "Pendaftaran Calon Anggota" }
  );

  // Restore draft if available and form is blank
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = DraftStorage.get<MembershipApplicationInput>("membership_join_form");
    if (existing && existing.data) {
      // Check if current form is still mostly empty
      if (!formValues.fullName && !formValues.email && !formValues.username) {
        reset(existing.data);
      }
    }
  }, []);

  const getWhatsAppApprovalMessage = (
    formData?: MembershipApplicationInput,
    applicationId?: string
  ): string => {
    const f = formData || submitSuccess?.formData;
    const refId = applicationId || submitSuccess?.applicationId || "N/A";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://brotherhood-portal.com";
    const approvalPortalUrl = `${origin}/admin/applications?ref=${refId}`;

    if (!f) {
      return `*PERMOHONAN PENDAFTARAN ANGGOTA BARU*\n*BORNEO BROTHERHOOD COMMUNITY*\n\nHalo Admin,\nSaya telah mendaftar calon anggota baru di portal dengan No. Registrasi: *${refId}*.\n\nMohon bantuannya untuk meninjau dan melakukan approval di portal admin:\n${approvalPortalUrl}\n\nTerima kasih!`;
    }

    return [
      `*PERMOHONAN PENDAFTARAN ANGGOTA BARU*`,
      `*BORNEO BROTHERHOOD COMMUNITY*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Status:* ⏳ Menunggu Persetujuan (Pending Approval)`,
      `*No. Registrasi:* \`${refId}\``,
      ``,
      `*1. IDENTITAS CALON ANGGOTA:*`,
      `• *Nama Lengkap:* ${f.fullName}`,
      `• *Username (Login):* @${f.username}`,
      `• *Alamat Email:* ${f.email}`,
      `• *Nomor WhatsApp:* ${f.phoneNumber}`,
      `• *Kota Domisili:* ${f.city}`,
      ``,
      `*2. DATA MOTOR TOURING:*`,
      `• *Model Motor:* ${f.motorcycleModel} (${f.motorcycleYear})`,
      `• *Nomor Polisi (Plat):* ${f.motorcyclePlate}`,
      ``,
      `*3. KONTAK DARURAT:*`,
      `• *Nama Kontak:* ${f.emergencyContactName}`,
      `• *Nomor Telepon:* ${f.emergencyContactPhone}`,
      ``,
      `*4. ALASAN BERGABUNG:*`,
      `"${f.reasonToJoin?.trim() || "Ingin memperluas silaturahmi touring jarak jauh dan belajar manajemen konvoi yang tertib sesuai prinsip safety riding."}"`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Tautan Review & Approval Admin:*`,
      `${approvalPortalUrl}`,
      ``,
      `*Mohon diverifikasi dan diproses persetujuannya (Approve) di sistem admin.* Terima kasih!`,
    ].join("\n");
  };

  const getWhatsAppApprovalUrl = (
    formData?: MembershipApplicationInput,
    applicationId?: string
  ): string => {
    const message = getWhatsAppApprovalMessage(formData, applicationId);
    return `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyApprovalMessage = () => {
    const text = getWhatsAppApprovalMessage();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedApproval(true);
      setTimeout(() => setCopiedApproval(false), 2500);
    }
  };

  const onSubmit = async (values: MembershipApplicationInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitMembershipApplication(values);
      if (result.success) {
        clearDraft();
        setSubmitSuccess({
          success: true,
          applicationId: result.applicationId,
          message: result.message,
          formData: values,
        });

        // Automatically open WhatsApp in new tab if autoForwardWhatsApp is checked
        if (autoForwardWhatsApp && typeof window !== "undefined") {
          const waUrl = getWhatsAppApprovalUrl(values, result.applicationId);
          window.open(waUrl, "_blank");
        }
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem saat mengirim data pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    const waUrl = getWhatsAppApprovalUrl();

    return (
      <div className="py-16 sm:py-24 bg-asphalt-grit min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          <SuccessState
            title="Aplikasi Pendaftaran Berhasil Dikirimkan!"
            subtitle="Formulir calon anggota Anda telah resmi masuk ke antrean verifikasi dewan pengurus Brotherhood Community."
            referenceId={submitSuccess.applicationId}
            reassuranceMessage={`Data identitas (${submitSuccess.formData?.fullName}), username (@${submitSuccess.formData?.username}), dan spesifikasi motor Anda disimpan dengan enkripsi aman di server komunitas. Privasi Anda terjaga dan tidak akan dibagikan ke pihak eksternal.`}
            dispatchedTo={submitSuccess.formData?.email}
            nextSteps={[
              {
                stepNumber: 1,
                title: "Approval Dewan Pengurus",
                description: "Admin dan Road Captain memverifikasi kelengkapan SIM C dan data touring Anda.",
                timeframe: "1 x 24 Jam Kerja",
              },
              {
                stepNumber: 2,
                title: "Aktivasi Akun & Login",
                description: `Akun Anda diaktifkan dan Anda dapat langsung login menggunakan email atau username @${submitSuccess.formData?.username}.`,
                timeframe: "Setelah Di-Approve",
              },
              {
                stepNumber: 3,
                title: "Penerbitan KTA Digital & Kopdar",
                description: "Nomor Registrasi Anggota (NRA) resmi diterbitkan dan Anda diundang ke forum resmi.",
                timeframe: "Resmi Dilantik",
              },
            ]}
            secondaryAction={{
              label: "Kembali ke Beranda Komunitas",
              href: "/",
            }}
          >
            {/* FITUR KHUSUS: TERUSKAN DATA PENDAFTARAN KE WHATSAPP ADMIN UNTUK APPROVAL */}
            <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/40 p-6 sm:p-8 space-y-5 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col items-center space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider border border-emerald-500/40">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Langkah Terakhir: Approval Admin
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-white">
                  Teruskan Berkas ke WhatsApp Admin untuk Di-Approve
                </h3>

                <p className="text-xs sm:text-sm text-bone-muted max-w-xl mx-auto font-sans leading-relaxed">
                  Agar pendaftaran Anda segera diproses tanpa menunggu antrean panjang, kirimkan format persetujuan resmi berikut langsung ke WhatsApp Admin Sekretariat.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 relative z-10">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    type="button"
                    className="w-full sm:w-auto px-8 py-6 rounded-xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-black bg-[#25D366] hover:bg-[#20ba59] shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                  >
                    <svg
                      className="h-5 w-5 fill-black shrink-0"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>Kirim Data ke WhatsApp Admin (Buka Chat)</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyApprovalMessage}
                  className="w-full sm:w-auto px-5 py-6 text-xs font-mono uppercase tracking-wider border-white/20 hover:border-emerald-500/50 hover:bg-emerald-950/40 text-bone flex items-center justify-center gap-2"
                >
                  {copiedApproval ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Pesan Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-bone-muted" />
                      <span>Salin Format Pesan</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-2 text-[11px] font-mono text-bone-muted/80 flex items-center justify-center gap-2">
                <span>Hotline Admin:</span>
                <strong className="text-emerald-400 font-bold">+{adminWhatsAppNumber}</strong>
                <span>• Pesan sudah menyertakan link review instan untuk dewan pengurus</span>
              </div>
            </div>
          </SuccessState>
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

        {/* Draft Secured Status Banner (State 8 Feature) */}
        {lastSaved && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-bone-muted font-mono animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-300">Draf Formulir Diamankan:</strong> Isian Anda tersimpan otomatis di perangkat.
              </span>
            </div>
            <span className="text-[11px] text-bone-muted/70">
              Pukul: {new Date(lastSaved.savedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}

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
              <div className="sm:col-span-2">
                <ValidatedField
                  label="Nama Lengkap (Sesuai KTP)"
                  required
                  fieldName="fullName"
                  error={errors.fullName}
                >
                  <Input
                    id="fullName"
                    placeholder="Contoh: Bambang Pamungkas"
                    {...register("fullName")}
                  />
                </ValidatedField>
              </div>

              <div className="sm:col-span-2">
                <ValidatedField
                  label="Username Akun"
                  required
                  fieldName="username"
                  error={errors.username}
                  hint="Opsi login alternatif tanpa email"
                >
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-gold font-bold select-none">
                      @
                    </span>
                    <Input
                      id="username"
                      placeholder="biker_borneo (3-30 karakter huruf, angka, underscore)"
                      className="pl-8 text-xs font-mono"
                      {...register("username")}
                    />
                  </div>
                </ValidatedField>
              </div>

              <div>
                <ValidatedField
                  label="Alamat Email Aktif"
                  required
                  fieldName="email"
                  error={errors.email}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@domain.com"
                    {...register("email")}
                  />
                </ValidatedField>
              </div>

              <div>
                <ValidatedField
                  label="Nomor WhatsApp Aktif"
                  required
                  fieldName="phoneNumber"
                  error={errors.phoneNumber}
                >
                  <Input
                    id="phoneNumber"
                    placeholder="081234567890"
                    {...register("phoneNumber")}
                  />
                </ValidatedField>
              </div>

              <div className="sm:col-span-2">
                <ValidatedField
                  label="Kota Domisili Saat Ini"
                  required
                  fieldName="city"
                  error={errors.city}
                >
                  <Input
                    id="city"
                    placeholder="Contoh: Jakarta Selatan / Bogor / Bandung"
                    {...register("city")}
                  />
                </ValidatedField>
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
              <div className="sm:col-span-2">
                <ValidatedField
                  label="Merk & Model Motor"
                  required
                  fieldName="motorcycleModel"
                  error={errors.motorcycleModel}
                >
                  <Input
                    id="motorcycleModel"
                    placeholder="Contoh: Kawasaki Versys 650 / Honda CB500X"
                    {...register("motorcycleModel")}
                  />
                </ValidatedField>
              </div>

              <div>
                <ValidatedField
                  label="Tahun Perakitan"
                  required
                  fieldName="motorcycleYear"
                  error={errors.motorcycleYear}
                >
                  <Input
                    id="motorcycleYear"
                    type="number"
                    {...register("motorcycleYear", { valueAsNumber: true })}
                  />
                </ValidatedField>
              </div>

              <div className="sm:col-span-3">
                <ValidatedField
                  label="Nomor Polisi (Plat Motor)"
                  required
                  fieldName="motorcyclePlate"
                  error={errors.motorcyclePlate}
                >
                  <Input
                    id="motorcyclePlate"
                    placeholder="Contoh: B 3456 KBR"
                    {...register("motorcyclePlate")}
                  />
                </ValidatedField>
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
              <div>
                <ValidatedField
                  label="Nama Kontak Darurat (Keluarga/Istri/Ortu)"
                  required
                  fieldName="emergencyContactName"
                  error={errors.emergencyContactName}
                >
                  <Input
                    id="emergencyContactName"
                    placeholder="Nama kerabat terdekat"
                    {...register("emergencyContactName")}
                  />
                </ValidatedField>
              </div>

              <div>
                <ValidatedField
                  label="Nomor Telepon Kontak Darurat"
                  required
                  fieldName="emergencyContactPhone"
                  error={errors.emergencyContactPhone}
                >
                  <Input
                    id="emergencyContactPhone"
                    placeholder="0812XXXXXXXX"
                    {...register("emergencyContactPhone")}
                  />
                </ValidatedField>
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
            <CardContent>
              <ValidatedField
                label="Mengapa Anda Ingin Bergabung dengan Brotherhood Community? (Opsional)"
                fieldName="reasonToJoin"
                error={errors.reasonToJoin}
              >
                <Textarea
                  id="reasonToJoin"
                  rows={4}
                  placeholder="Ceritakan pengalaman riding atau harapan Anda bergabung dalam keluarga Brotherhood (opsional)..."
                  {...register("reasonToJoin")}
                />
              </ValidatedField>
            </CardContent>
          </Card>

          {/* OPSI TERUSKAN KE WHATSAPP ADMIN UNTUK APPROVAL */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-start gap-3.5 transition-colors hover:border-emerald-500/50">
            <input
              type="checkbox"
              id="autoForwardWhatsApp"
              checked={autoForwardWhatsApp}
              onChange={(e) => setAutoForwardWhatsApp(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-emerald-500/50 text-emerald-500 accent-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="autoForwardWhatsApp"
              className="text-xs text-bone cursor-pointer select-none space-y-1"
            >
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Send className="h-3.5 w-3.5" />
                Teruskan Data Pendaftaran ke WhatsApp Admin untuk Di-Approve
              </span>
              <span className="text-bone-muted block text-[11px] leading-relaxed font-sans">
                Setelah formulir dikirim, sistem otomatis membuka chat WhatsApp Admin dengan format data pendaftaran lengkap beserta tautan approval dewan pengurus.
              </span>
            </label>
          </div>

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
