"use client";

import * as React from "react";
import { User, Bike, CheckCircle2, Save, Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMember } from "@/context/member-context";
import { createClient } from "@/lib/supabase/client";

export default function MemberProfilePage() {
  const { member, loading: memberLoading, refreshMember } = useMember();
  const [saved, setSaved] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    fullName: "",
    displayName: "",
    email: "",
    phoneNumber: "",
    city: "",
    bloodType: "",
    motorcycleModel: "",
    motorcyclePlate: "",
    motorcycleYear: "2024",
    emergencyContactName: "",
    emergencyContactPhone: "",
    bio: "",
  });

  // Populate form with authenticated member data when loaded
  React.useEffect(() => {
    if (member) {
      setForm({
        fullName: member.fullName || "",
        displayName: member.displayName || "",
        email: member.email || "",
        phoneNumber: member.phoneNumber || "",
        city: member.city || "",
        bloodType: member.bloodType || "",
        motorcycleModel: member.motorcycleModel || "",
        motorcyclePlate: member.motorcyclePlate || "",
        motorcycleYear: String(member.motorcycleYear || "2024"),
        emergencyContactName: member.emergencyContactName || "",
        emergencyContactPhone: member.emergencyContactPhone || "",
        bio: member.bio || "",
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        await refreshMember();
        setTimeout(() => setSaved(false), 4000);
      } else {
        setErrorMsg(json.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMsg("Terjadi kendala jaringan saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  if (memberLoading && !member) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3">
        <Loader2 className="h-8 w-8 text-muted-gold animate-spin" />
        <p className="text-xs text-bone-muted">Memuat data profil akun Anda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <Badge variant="gold">PENGATURAN PROFIL</Badge>
        <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
          Profil Pribadi & Data Rider
        </h1>
        <p className="text-xs text-bone-muted mt-0.5">
          Perbarui informasi kontak, data motor, dan kontak darurat Anda.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs text-emerald-300 shadow-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Profil Anda berhasil diperbarui dan tersinkronisasi ke sistem!</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/60 p-4 text-xs text-red-300 shadow-md">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Dasar */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-muted-gold" />
              <span>Identitas Rider & Akun</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nama Lengkap *</Label>
              <Input
                id="fullName"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Nama Panggilan / Alias</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Terdaftar</Label>
              <Input
                id="email"
                value={form.email}
                disabled
                className="opacity-70 cursor-not-allowed font-mono bg-charcoal"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">Nomor WhatsApp / HP *</Label>
              <Input
                id="phoneNumber"
                required
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Kota Domisili *</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bloodType">Golongan Darah</Label>
              <Input
                id="bloodType"
                placeholder="Contoh: O+, A+, B+, AB+"
                value={form.bloodType}
                onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bio">Tentang Anda (Bio Singkat)</Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Tuliskan pengalaman berkendara atau moto hidup Anda..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Motor & Kontak Darurat */}
        <Card className="border-white/10 bg-asphalt/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bike className="h-4 w-4 text-muted-gold" />
              <span>Data Motor & Kontak Darurat Medis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="motorcycleModel">Tipe & Merk Motor Touring</Label>
              <Input
                id="motorcycleModel"
                placeholder="Contoh: Kawasaki Versys 650"
                value={form.motorcycleModel}
                onChange={(e) => setForm({ ...form, motorcycleModel: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="motorcyclePlate">Nomor Polisi (Plat Motor)</Label>
              <Input
                id="motorcyclePlate"
                placeholder="Contoh: B 1234 ABC"
                value={form.motorcyclePlate}
                onChange={(e) => setForm({ ...form, motorcyclePlate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergencyContactName">Nama Kontak Darurat</Label>
              <Input
                id="emergencyContactName"
                placeholder="Nama keluarga / kerabat terdekat"
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergencyContactPhone">Nomor Telepon Darurat</Label>
              <Input
                id="emergencyContactPhone"
                placeholder="Nomor telepon yang dapat dihubungi saat darurat"
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-2 font-bold px-6">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Profil</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
