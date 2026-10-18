"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Copy,
  CheckCircle2,
  Upload,
  ArrowLeft,
  AlertCircle,
  FileCheck,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { paymentSubmissionSchema, type PaymentSubmissionInput } from "@/features/finance/schemas";
import { useMember } from "@/context/member-context";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  eventId: string;
  eventName: string;
  eventLocation: string;
  eventStartTime: string | null;
  amount: number;
  status: "unpaid" | "submitted" | "paid" | "rejected";
  dueDate: string;
  payments: Array<any>;
}

export default function MemberInvoicePaymentPage() {
  const { member } = useMember();
  const params = useParams();
  const invoiceId = (params?.id as string) || "";

  const [loading, setLoading] = React.useState(true);
  const [invoice, setInvoice] = React.useState<InvoiceData | null>(null);
  const [bankAccounts, setBankAccounts] = React.useState<{
    bca: { bankName: string; accountNumber: string; accountHolder: string };
    mandiri: { bankName: string; accountNumber: string; accountHolder: string };
  }>({
    bca: {
      bankName: "BANK CENTRAL ASIA (BCA)",
      accountNumber: "3710335752",
      accountHolder: "Steven Fo",
    },
    mandiri: {
      bankName: "BANK MANDIRI",
      accountNumber: "133-00-29381-11",
      accountHolder: "Steven Fo",
    },
  });

  const [copiedBank, setCopiedBank] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentSubmissionInput>({
    resolver: zodResolver(paymentSubmissionSchema),
    defaultValues: {
      invoiceId: invoiceId,
      bankName: "BCA",
      accountName: member?.fullName || "",
      amount: 0,
      proofUrl: "",
      notes: "",
    },
  });

  const currentProofUrl = watch("proofUrl");

  // Fetch invoice details and official bank accounts
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/member/invoices?id=${encodeURIComponent(invoiceId)}`);
        const json = await res.json();

        if (isMounted && json.success) {
          if (json.data?.bankAccounts) {
            setBankAccounts(json.data.bankAccounts);
          }
          const found = (json.data?.invoices || []).find(
            (inv: InvoiceData) => inv.id === invoiceId || inv.invoiceNumber === invoiceId
          ) || json.data?.invoices?.[0];

          if (found) {
            setInvoice(found);
            setValue("invoiceId", found.id);
            setValue("amount", found.amount);
            if (found.status === "submitted" || found.status === "paid") {
              setSubmitSuccess(found.status === "submitted");
            }
          }
        }
      } catch (err) {
        console.error("Error loading invoice:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [invoiceId, setValue]);

  React.useEffect(() => {
    if (member?.fullName) {
      setValue("accountName", member.fullName);
    }
  }, [member?.fullName, setValue]);

  const handleCopy = (bank: string, number: string) => {
    navigator.clipboard.writeText(number.replace(/-/g, ""));
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 10MB");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "proofs");

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || "Gagal mengunggah foto bukti transfer.");
      }

      const fileUrl = uploadData.data?.url || `/uploads/proofs/${file.name}`;
      setValue("proofUrl", fileUrl);
      setUploadedPreview(fileUrl);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: PaymentSubmissionInput) => {
    if (!values.proofUrl) {
      setErrorMessage("Harap unggah bukti transfer terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/member/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengirim bukti pembayaran.");
      }

      setSubmitSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-gold" />
        <p className="text-sm font-mono text-bone-muted">Memuat informasi tagihan invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950/40 text-red-400 border border-red-500/30">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-serif font-black uppercase text-bone">
          Tagihan Tidak Ditemukan
        </h2>
        <p className="text-xs text-bone-muted">
          Nomor invoice tidak valid atau Anda belum terdaftar pada kegiatan ini.
        </p>
        <div className="pt-2">
          <Link href="/member/payments">
            <Button variant="outline" size="sm">
              Kembali ke Daftar Tagihan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAlreadyPaid = invoice.status === "paid";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/member/payments"
          className="inline-flex items-center gap-1.5 text-xs text-bone-muted hover:text-muted-gold mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Daftar Tagihan</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="gold">INVOICE EVENT</Badge>
          <span className="text-xs font-mono text-muted-gold font-bold">{invoice.invoiceNumber}</span>
          {invoice.status === "paid" && <Badge variant="success">LUNAS</Badge>}
          {invoice.status === "submitted" && <Badge variant="warning">MENUNGGU VERIFIKASI</Badge>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-bone mt-1">
          Pembayaran Iuran Kegiatan Touring
        </h1>
      </div>

      {isAlreadyPaid ? (
        <Card className="border-emerald-500/40 bg-asphalt/90 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <Badge variant="success">TAGIHAN LUNAS</Badge>
          <h2 className="text-2xl font-serif font-black uppercase text-bone">
            Pembayaran Telah Diverifikasi
          </h2>
          <p className="text-xs text-bone-muted max-w-md mx-auto">
            Pembayaran sebesar {formatRupiah(invoice.amount)} untuk kegiatan{" "}
            <span className="text-bone font-medium">{invoice.eventName}</span> telah diverifikasi
            oleh Bendahara.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/member/events">
              <Button variant="default" size="sm">
                Lihat Agenda Event Saya
              </Button>
            </Link>
            <Link href="/member/payments">
              <Button variant="outline" size="sm">
                Lihat Semua Tagihan
              </Button>
            </Link>
          </div>
        </Card>
      ) : submitSuccess ? (
        <Card className="border-emerald-500/40 bg-asphalt/90 p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <Badge variant="success">BUKTI TRANSFER TERKIRIM</Badge>
          <h2 className="text-2xl font-serif font-black uppercase text-bone">
            Bukti Pembayaran Sedang Ditinjau
          </h2>
          <p className="text-xs text-bone-muted max-w-md mx-auto">
            Bendahara Umum akan memeriksa mutasi rekening dan memvalidasi invoice Anda dalam waktu 1x24 jam.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/member/events">
              <Button variant="default" size="sm">
                Lihat Agenda Event Saya
              </Button>
            </Link>
            <Link href="/member/payments">
              <Button variant="outline" size="sm">
                Kembali ke Tagihan
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/10 bg-asphalt/60">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] uppercase text-bone-muted">Nama Kegiatan</span>
                    <h3 className="font-serif font-bold text-base text-bone mt-0.5">
                      {invoice.eventName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-bone-muted mt-1">
                      {invoice.eventLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-gold" />
                          {invoice.eventLocation}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-gold" />
                        Jatuh Tempo: {invoice.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase text-bone-muted">Total Tagihan</span>
                    <p className="font-mono font-bold text-xl text-muted-gold">
                      {formatRupiah(invoice.amount)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bankName">Bank Pengirim *</Label>
                      <Input
                        id="bankName"
                        placeholder="Contoh: BCA / Mandiri / BRI / BNI"
                        {...register("bankName")}
                      />
                      {errors.bankName && (
                        <p className="text-xs text-red-400">{errors.bankName.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="accountName">Nama Pemilik Rekening Pengirim *</Label>
                      <Input
                        id="accountName"
                        placeholder="Sesuai nama di buku tabungan/mutasi"
                        {...register("accountName")}
                      />
                      {errors.accountName && (
                        <p className="text-xs text-red-400">{errors.accountName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Jumlah Yang Ditransfer (Rp) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      {...register("amount", { valueAsNumber: true })}
                    />
                    {errors.amount && (
                      <p className="text-xs text-red-400">{errors.amount.message}</p>
                    )}
                  </div>

                  {/* Upload Struk Transfer */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fileUpload">Unggah Bukti Struk / Screenshot Transfer *</Label>
                    <div className="rounded-lg border-2 border-dashed border-white/10 bg-charcoal p-5 text-center space-y-2 hover:border-muted-gold/40 transition-colors">
                      {uploadedPreview || currentProofUrl ? (
                        <div className="space-y-3">
                          <img
                            src={uploadedPreview || currentProofUrl}
                            alt="Bukti Transfer"
                            className="max-h-48 mx-auto rounded border border-white/10 object-contain"
                          />
                          <p className="text-xs text-emerald-400 font-medium">
                            Foto bukti transfer siap dikirim!
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-gold/60 mx-auto" />
                          <p className="text-xs text-bone">
                            Pilih foto atau tangkapan layar bukti transfer m-banking / ATM
                          </p>
                          <p className="text-[10px] text-bone-muted">
                            Format: JPG, PNG, WEBP (Maksimal 10MB)
                          </p>
                        </>
                      )}

                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Input
                          id="fileUpload"
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          className="text-xs max-w-xs"
                          onChange={handleFileUpload}
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-gold" />}
                      </div>
                    </div>
                    {errors.proofUrl && (
                      <p className="text-xs text-red-400">{errors.proofUrl.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                    <Input
                      id="notes"
                      placeholder="Contoh: Transfer via BCA Mobile pukul 10.15"
                      {...register("notes")}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="w-full font-bold text-sm py-5 gap-2 mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Mengirim Bukti Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4" />
                        <span>Kirim Bukti Pembayaran ke Bendahara</span>
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right 1 Col: Official Community Bank Accounts */}
          <div className="space-y-4">
            <Card className="border-muted-gold/40 bg-asphalt/80 p-5 space-y-4">
              <div className="flex items-center gap-2 text-muted-gold">
                <Building2 className="h-5 w-5" />
                <h3 className="font-serif font-bold text-sm text-bone">
                  Rekening Resmi Komunitas
                </h3>
              </div>

              {/* Account 1: BCA */}
              <div className="rounded-lg bg-charcoal p-3.5 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted-gold font-mono">
                    {bankAccounts.bca.bankName}
                  </span>
                  <button
                    onClick={() => handleCopy("BCA", bankAccounts.bca.accountNumber)}
                    className="text-[11px] text-bone-muted hover:text-muted-gold flex items-center gap-1 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedBank === "BCA" ? "Tersalin!" : "Salin"}</span>
                  </button>
                </div>
                <p className="font-mono font-bold text-lg text-bone">
                  {bankAccounts.bca.accountNumber}
                </p>
                <p className="text-[11px] text-bone-muted">
                  a.n. {bankAccounts.bca.accountHolder}
                </p>
              </div>

              {/* Account 2: Mandiri */}
              <div className="rounded-lg bg-charcoal p-3.5 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted-gold font-mono">
                    {bankAccounts.mandiri.bankName}
                  </span>
                  <button
                    onClick={() => handleCopy("MANDIRI", bankAccounts.mandiri.accountNumber)}
                    className="text-[11px] text-bone-muted hover:text-muted-gold flex items-center gap-1 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedBank === "MANDIRI" ? "Tersalin!" : "Salin"}</span>
                  </button>
                </div>
                <p className="font-mono font-bold text-lg text-bone">
                  {bankAccounts.mandiri.accountNumber}
                </p>
                <p className="text-[11px] text-bone-muted">
                  a.n. {bankAccounts.mandiri.accountHolder}
                </p>
              </div>

              <div className="rounded-md bg-charcoal/60 p-3 text-[11px] text-bone-muted border border-white/5 space-y-1">
                <p className="font-semibold text-bone">Instruksi Pembayaran:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Lakukan transfer sesuai nominal tagihan yang tertera.</li>
                  <li>Simpan struk fisik atau tangkapan layar m-banking.</li>
                  <li>Unggah foto bukti transfer melalui formulir di samping.</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
