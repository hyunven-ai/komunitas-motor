"use client";

import * as React from "react";
import {
  Save,
  CheckCircle2,
  Building2,
  Shield,
  MessageCircle,
  ExternalLink,
  Phone,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "@/features/settings/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Fetch settings from API
  const fetchSettings = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
      setErrorMessage("Gagal memuat pengaturan terkini dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Clean and format WhatsApp phone number
  const cleanWhatsAppNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return "62" + digits.slice(1);
    }
    return digits;
  };

  const formattedWhatsAppNumber = cleanWhatsAppNumber(settings.adminWhatsApp || "");
  const testWhatsAppUrl = `https://wa.me/${formattedWhatsAppNumber}?text=${encodeURIComponent("Halo Admin Brotherhood Community, ini adalah uji coba pesan WhatsApp dari Pengaturan Admin Panel.")}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(null);
    setErrorMessage(null);

    // Normalisasi nomor whatsapp sebelum disimpan
    const normalizedWhatsApp = cleanWhatsAppNumber(settings.adminWhatsApp);

    const payload: SystemSettings = {
      ...settings,
      adminWhatsApp: normalizedWhatsApp,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSettings(payload);
        setSavedSuccess("Pengaturan nomor WhatsApp Admin dan portal berhasil disimpan ke database!");
        setTimeout(() => setSavedSuccess(null), 5000);
      } else {
        setErrorMessage(json.message || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      console.error("Gagal simpan:", err);
      setErrorMessage("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3">
        <Loader2 className="h-8 w-8 text-muted-gold animate-spin" />
        <p className="text-xs text-bone-muted">Memuat data pengaturan portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">KONFIGURASI SISTEM</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Pengaturan Portal & Nomor Admin
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Konfigurasi nomor WhatsApp Admin pendaftaran, identitas resmi, dan rekening resmi penampung kas.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchSettings}
          className="text-xs border-white/10 hover:border-muted-gold/40 text-bone flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-gold" />
          <span>Muat Ulang</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{savedSuccess}</span>
          </div>
          <button
            onClick={() => setSavedSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/40 bg-red-950/60 text-red-200 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. WHATSAPP ADMIN SETTING (TOP PRIORITY) */}
        <Card id="whatsapp" className="border-emerald-500/40 bg-asphalt/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-muted-gold to-emerald-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2.5 text-emerald-400">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                </div>
                <span>Hotline WhatsApp Admin (Pendaftaran Calon Anggota)</span>
              </CardTitle>
              <Badge variant="gold" className="text-[9px] uppercase tracking-wider">
                Prioritas Konfirmasi
              </Badge>
            </div>
            <CardDescription className="text-xs text-bone-muted pt-1">
              Nomor WhatsApp ini digunakan sebagai target konfirmasi langsung saat calon anggota selesai mengisi formulir di halaman pendaftaran (/join).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-1.5">
                <Label htmlFor="adminWhatsApp" className="text-xs font-semibold text-bone flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-gold" />
                  <span>Nomor WhatsApp Admin Aktif *</span>
                </Label>
                <Input
                  id="adminWhatsApp"
                  value={settings.adminWhatsApp}
                  onChange={(e) => setSettings({ ...settings, adminWhatsApp: e.target.value })}
                  placeholder="Contoh: 081299887711 atau 6281299887711"
                  className="text-xs font-mono border-white/20 focus:border-emerald-500 bg-charcoal"
                  required
                />
                <p className="text-[11px] text-bone-muted">
                  Bisa dimasukkan dengan awalan <strong>08...</strong> atau <strong>628...</strong>. Sistem akan otomatis memformat ke standar internasional.
                </p>
              </div>

              {/* Live Preview & Test Link */}
              <div className="p-4 rounded-lg bg-charcoal/90 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-bold">
                    Pratinjau Tautan WhatsApp
                  </span>
                  <span className="text-[10px] font-mono text-bone-muted">wa.me/{formattedWhatsAppNumber}</span>
                </div>
                <p className="text-[11px] text-bone-muted truncate">
                  Target URL: <code className="text-muted-gold font-mono">https://wa.me/{formattedWhatsAppNumber}</code>
                </p>
                <a
                  href={testWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md font-bold text-xs uppercase tracking-wider text-black bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-md active:scale-[0.98]"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-black" />
                  <span>Uji Coba Tautan WhatsApp</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="whatsAppGreeting" className="text-xs text-bone">
                Kalimat Salam Pembuka / Template Konfirmasi (Opsional)
              </Label>
              <Textarea
                id="whatsAppGreeting"
                rows={2}
                value={settings.whatsAppGreeting || ""}
                onChange={(e) => setSettings({ ...settings, whatsAppGreeting: e.target.value })}
                placeholder="Kalimat pembuka saat pesan WhatsApp terisi otomatis..."
                className="text-xs bg-charcoal border-white/10"
              />
              <p className="text-[10px] text-bone-muted">
                Pesan ini akan disisipkan di baris pertama chat WhatsApp calon anggota sebelum rincian data pendaftarannya.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Identity */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-gold" />
              <span>Identitas Resmi Organisasi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="siteName" className="text-xs">Nama Resmi Komunitas</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="text-xs bg-charcoal border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="basecamp" className="text-xs">Alamat Sekretariat / Basecamp</Label>
                <Input
                  id="basecamp"
                  value={settings.basecampAddress}
                  onChange={(e) => setSettings({ ...settings, basecampAddress: e.target.value })}
                  className="text-xs bg-charcoal border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hotline" className="text-xs">Hotline Rescue / Darurat Touring</Label>
                <Input
                  id="hotline"
                  value={settings.hotlinePhone}
                  onChange={(e) => setSettings({ ...settings, hotlinePhone: e.target.value })}
                  className="text-xs font-mono bg-charcoal border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="secretariatEmail" className="text-xs">Email Resmi Sekretariat</Label>
                <Input
                  id="secretariatEmail"
                  type="email"
                  value={settings.secretariatEmail || ""}
                  onChange={(e) => setSettings({ ...settings, secretariatEmail: e.target.value })}
                  placeholder="sekretariat@brotherhood.id"
                  className="text-xs font-mono bg-charcoal border-white/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2.5. Bar Status Operasional (Frontend Dispatch Bar) */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                <span>Bar Status Operasional (Frontend Dispatch Bar)</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOpBar"
                  checked={settings.showOperationalBar !== false}
                  onChange={(e) =>
                    setSettings({ ...settings, showOperationalBar: e.target.checked })
                  }
                  className="rounded border-white/20 bg-charcoal text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="showOpBar" className="text-xs text-bone cursor-pointer">
                  Tampilkan di Beranda
                </Label>
              </div>
            </div>
            <CardDescription className="text-xs text-bone-muted pt-1">
              Konfigurasi teks ringkasan operasional jalan raya yang tampil tepat di bawah banner hero beranda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="opStatus" className="text-xs">
                  Status Operasional (Kiri)
                </Label>
                <Input
                  id="opStatus"
                  value={settings.operationalStatus || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, operationalStatus: e.target.value })
                  }
                  placeholder="Contoh: Sekretariat Sungai Pinyuh Aktif"
                  className="text-xs bg-charcoal border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roadCode" className="text-xs">
                  Kode Jalan / Semboyan (Tengah)
                </Label>
                <Input
                  id="roadCode"
                  value={settings.roadCode || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, roadCode: e.target.value })
                  }
                  placeholder="Contoh: Respect All, Fear None"
                  className="text-xs bg-charcoal border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="convoyFormation" className="text-xs">
                  Formasi Konvoi (Tengah-Kanan)
                </Label>
                <Input
                  id="convoyFormation"
                  value={settings.convoyFormation || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, convoyFormation: e.target.value })
                  }
                  placeholder="Contoh: Staggered Formation (Selang-Seling)"
                  className="text-xs bg-charcoal border-white/10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="complianceNote" className="text-xs">
                  Kepatuhan AD/ART (Kanan)
                </Label>
                <Input
                  id="complianceNote"
                  value={settings.complianceNote || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, complianceNote: e.target.value })
                  }
                  placeholder="Contoh: 100% Zero-Alcohol"
                  className="text-xs bg-charcoal border-white/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Official Bank Accounts */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-gold" />
              <span>Rekening Resmi Penampung Kas Komunitas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-charcoal rounded-lg border border-white/5 space-y-2">
                <Badge variant="gold" className="text-[9px]">REKENING UTAMA (BCA)</Badge>
                <div className="space-y-1">
                  <Label htmlFor="bcaNumber" className="text-[11px] text-bone-muted">Nomor Rekening BCA</Label>
                  <Input
                    id="bcaNumber"
                    value={settings.bcaAccountNumber || ""}
                    onChange={(e) => setSettings({ ...settings, bcaAccountNumber: e.target.value })}
                    className="text-xs font-mono bg-asphalt border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bcaHolder" className="text-[11px] text-bone-muted">Atas Nama (A.N.)</Label>
                  <Input
                    id="bcaHolder"
                    value={settings.bcaAccountHolder || ""}
                    onChange={(e) => setSettings({ ...settings, bcaAccountHolder: e.target.value })}
                    className="text-xs bg-asphalt border-white/10"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-charcoal rounded-lg border border-white/5 space-y-2">
                <Badge variant="secondary" className="text-[9px]">REKENING OPERASIONAL (MANDIRI)</Badge>
                <div className="space-y-1">
                  <Label htmlFor="mandiriNumber" className="text-[11px] text-bone-muted">Nomor Rekening Mandiri</Label>
                  <Input
                    id="mandiriNumber"
                    value={settings.mandiriAccountNumber || ""}
                    onChange={(e) => setSettings({ ...settings, mandiriAccountNumber: e.target.value })}
                    className="text-xs font-mono bg-asphalt border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mandiriHolder" className="text-[11px] text-bone-muted">Atas Nama (A.N.)</Label>
                  <Input
                    id="mandiriHolder"
                    value={settings.mandiriAccountHolder || ""}
                    onChange={(e) => setSettings({ ...settings, mandiriAccountHolder: e.target.value })}
                    className="text-xs bg-asphalt border-white/10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
          <p className="text-[11px] text-bone-muted">
            Perubahan nomor WhatsApp admin dan data portal akan langsung aktif di seluruh halaman publik.
          </p>
          <Button
            type="submit"
            variant="default"
            disabled={isSaving}
            className="text-xs font-bold gap-2 w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Pengaturan Sekarang</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
