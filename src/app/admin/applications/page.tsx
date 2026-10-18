"use client";

import * as React from "react";
import Link from "next/link";
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Phone,
  Mail,
  MapPin,
  Bike,
  Shield,
  RefreshCw,
  Loader2,
  MessageCircle,
  Settings,
  History,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MembershipApplication, ApplicationStatus } from "@/types/database";

const INITIAL_APPLICATIONS: MembershipApplication[] = [
  {
    id: "app-101",
    full_name: "Denny Prasetyo",
    email: "denny.prasetyo@gmail.com",
    phone_number: "081288992211",
    city: "Depok",
    motorcycle_model: "Honda CB500X",
    motorcycle_plate: "B 3912 EFX",
    motorcycle_year: 2022,
    id_card_number: "3276011203920003",
    driving_license_number: "920312001928",
    emergency_contact_name: "Rina Kartika (Istri)",
    emergency_contact_phone: "081399887766",
    reason_to_join: "Ingin memperluas silaturahmi touring jarak jauh dan belajar manajemen konvoi yang tertib sesuai prinsip safety riding.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "app-102",
    full_name: "Fajar Ramadhan",
    email: "fajar.ramadhan@outlook.com",
    phone_number: "085711223344",
    city: "Bogor",
    motorcycle_model: "Yamaha XSR 155",
    motorcycle_plate: "F 5543 AAA",
    motorcycle_year: 2023,
    id_card_number: "3201011508950001",
    driving_license_number: "950815002931",
    emergency_contact_name: "Budi Santoso (Ayah)",
    emergency_contact_phone: "081233445566",
    reason_to_join: "Tertarik dengan ikrar keselamatan berkendara dan konsistensi kegiatan sosial komunitas di daerah yang dilalui saat touring.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "app-103",
    full_name: "Gilbert Simanjuntak",
    email: "gilbert.simanjuntak@yahoo.com",
    phone_number: "081900112233",
    city: "Jakarta Timur",
    motorcycle_model: "Kawasaki Ninja ZX-25R",
    motorcycle_plate: "B 4410 TXY",
    motorcycle_year: 2021,
    id_card_number: "3175022005930005",
    driving_license_number: "930520004120",
    emergency_contact_name: "Martha Simanjuntak (Kakak)",
    emergency_contact_phone: "081277665544",
    reason_to_join: "Mencari teman riding dengan tujuan edukatif tanpa arogan di jalan raya.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = React.useState<MembershipApplication[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedApp, setSelectedApp] = React.useState<MembershipApplication | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [actionProcessing, setActionProcessing] = React.useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const fetchApplications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/applications?scope=pending");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApplications(json.data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Gagal memuat antrean pendaftaran:", err);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.motorcycle_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (appId: string) => {
    setActionProcessing(true);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: "approved" }),
      });
      const json = await res.json();
      if (json.success) {
        // Otomatis keluarkan dari antrean review dan pindahkan ke log history
        setApplications((prev) => prev.filter((app) => app.id !== appId));
        window.dispatchEvent(new Event("application-status-changed"));
        setActionFeedback("Pendaftaran telah disetujui, KTA diterbitkan, dan formulir otomatis dipindahkan ke Riwayat Pendaftaran.");
        setSelectedApp(null);
      } else {
        alert(json.message || "Gagal menyetujui pendaftaran.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan saat memperbarui status.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleReject = async (appId: string) => {
    const reason = prompt("Masukkan alasan penolakan aplikasi:", "Persyaratan administrasi atau kelaikan motor belum memenuhi standar AD/ART");
    if (!reason) return;

    setActionProcessing(true);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: "rejected", rejection_reason: reason }),
      });
      const json = await res.json();
      if (json.success) {
        // Otomatis keluarkan dari antrean review dan pindahkan ke log history
        setApplications((prev) => prev.filter((app) => app.id !== appId));
        window.dispatchEvent(new Event("application-status-changed"));
        setActionFeedback("Aplikasi telah ditolak dengan catatan alasan tersimpan dan otomatis dipindahkan ke Riwayat Pendaftaran.");
        setSelectedApp(null);
      } else {
        alert(json.message || "Gagal menolak pendaftaran.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan saat memperbarui status.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRequestRevision = async (appId: string) => {
    const note = prompt("Catatan perbaikan berkas untuk calon anggota:", "Mohon perbarui berkas kelengkapan atau konfirmasi plat nomor motor");
    if (!note) return;

    setActionProcessing(true);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: "revision_requested", rejection_reason: note }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId
              ? { ...app, status: "revision_requested" as ApplicationStatus, rejection_reason: note, reviewed_at: new Date().toISOString() }
              : app
          )
        );
        window.dispatchEvent(new Event("application-status-changed"));
        setActionFeedback("Permintaan revisi data telah disimpan.");
        setSelectedApp(null);
      } else {
        alert(json.message || "Gagal meminta revisi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan saat memperbarui status.");
    } finally {
      setActionProcessing(false);
    }
  };

  const formatWhatsAppUrl = (phone: string, applicantName: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formatted = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const text = encodeURIComponent(
      `Halo Bro/Sis ${applicantName}, kami dari Pengurus Brotherhood Community terkait formulir pendaftaran calon anggota yang Anda kirimkan...`
    );
    return `https://wa.me/${formatted}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">MANAJEMEN REKRUTMEN</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Antrean Review Calon Anggota
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Tinjau berkas pendaftaran calon anggota, verifikasi data motor, dan setujui penerbitan KTA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/applications/history">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1.5 border-muted-gold/40 bg-muted-gold/10 hover:bg-muted-gold/20 text-muted-gold"
            >
              <History className="h-3.5 w-3.5" />
              <span>Lihat Riwayat Review</span>
            </Button>
          </Link>

          <Link href="/admin/settings#whatsapp">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1.5 border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
              <span>Setting No. WA Admin</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            disabled={isLoading}
            className="text-xs flex items-center gap-2 border-white/10 bg-asphalt hover:border-muted-gold/40 text-bone"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-gold ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan Antrean</span>
          </Button>
        </div>
      </div>

      {actionFeedback && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs text-emerald-300 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400 hover:text-emerald-200 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-bone-muted" />
          <Input
            placeholder="Cari nama pemohon, kota, tipe motor, no telp, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-gold shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-asphalt px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold w-full sm:w-auto"
          >
            <option value="all">Semua Menunggu</option>
            <option value="pending">Menunggu Review</option>
            <option value="revision_requested">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="h-8 w-8 text-muted-gold animate-spin" />
          <p className="text-xs text-bone-muted">Memuat antrean pendaftaran dari database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.length === 0 ? (
            <Card className="border-white/10 bg-asphalt/40 p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3 opacity-80" />
              <h3 className="text-base font-bold text-bone">Antrean Review Pendaftaran Bersih!</h3>
              <p className="text-xs text-bone-muted mt-1 max-w-md mx-auto">
                Semua pendaftaran calon anggota baru telah selesai ditinjau. Berkas yang sudah disetujui atau ditolak otomatis tersimpan rapi di menu <strong>Riwayat Pendaftaran</strong>.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <Link href="/admin/applications/history">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-muted-gold/50 text-muted-gold hover:bg-muted-gold/10"
                  >
                    <History className="h-3.5 w-3.5 mr-1.5" />
                    Buka Riwayat Pendaftaran
                  </Button>
                </Link>
                <Link href="/admin/members">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-white/10 text-bone hover:border-white/30"
                  >
                    Lihat Database Anggota
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            filteredApps.map((app) => (
              <Card
                key={app.id}
                className="border-white/10 bg-asphalt/60 hover:border-muted-gold/40 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Column: Applicant Overview */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-serif font-bold text-bone">
                          {app.full_name}
                        </h3>
                        {app.status === "pending" && (
                          <Badge variant="gold" className="text-[10px]">
                            MENUNGGU REVIEW
                          </Badge>
                        )}
                        {app.status === "approved" && (
                          <Badge variant="success" className="text-[10px]">
                            DISETUJUI
                          </Badge>
                        )}
                        {app.status === "rejected" && (
                          <Badge variant="destructive" className="text-[10px]">
                            DITOLAK
                          </Badge>
                        )}
                        {app.status === "revision_requested" && (
                          <Badge variant="secondary" className="text-[10px]">
                            PERLU REVISI
                          </Badge>
                        )}
                        <span className="text-[11px] font-mono text-bone-muted">
                          ID: {app.id.slice(0, 8).toUpperCase()}...
                        </span>
                        {app.created_at && (
                          <span className="text-[11px] text-bone-muted/80">
                            • {new Date(app.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-bone-muted">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span>Kota: <strong className="text-bone">{app.city}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bike className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span>Motor: <strong className="text-bone">{app.motorcycle_model} ({app.motorcycle_year})</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                          <span>Plat: <strong className="text-bone">{app.motorcycle_plate}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-bone-muted pt-1">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-gold shrink-0" /> {app.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-gold shrink-0" /> {app.phone_number}
                        </span>
                        <a
                          href={formatWhatsAppUrl(app.phone_number, app.full_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>Chat WhatsApp</span>
                        </a>
                      </div>

                      {app.reason_to_join && (
                        <div className="rounded-md bg-charcoal/70 p-3 text-xs text-bone-muted border border-white/5">
                          <p className="font-semibold text-bone mb-0.5">Motivasi & Alasan Bergabung:</p>
                          <p className="italic">&ldquo;{app.reason_to_join}&rdquo;</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Actions */}
                    <div className="flex lg:flex-col items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs w-full justify-center gap-1.5"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Detail Lengkap</span>
                      </Button>

                      {app.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs font-bold w-full justify-center gap-1.5"
                            disabled={actionProcessing}
                            onClick={() => handleApprove(app.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Setujui (Terbitkan KTA)</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs w-full justify-center gap-1.5"
                            disabled={actionProcessing}
                            onClick={() => handleRequestRevision(app.id)}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Minta Revisi</span>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs w-full justify-center gap-1.5"
                            disabled={actionProcessing}
                            onClick={() => handleReject(app.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Tolak</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-muted-gold/40 bg-asphalt p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <Badge variant="gold">BERKAS PENDAFTARAN</Badge>
                <h3 className="text-xl font-serif font-black uppercase text-bone mt-1">
                  {selectedApp.full_name}
                </h3>
                <p className="text-[11px] font-mono text-muted-gold mt-0.5">
                  ID: {selectedApp.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-bone-muted hover:text-bone text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">Alamat Email</span>
                  <p className="font-semibold text-bone">{selectedApp.email}</p>
                </div>
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">Nomor WhatsApp</span>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-bone">{selectedApp.phone_number}</p>
                    <a
                      href={formatWhatsAppUrl(selectedApp.phone_number, selectedApp.full_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                    >
                      <MessageCircle className="h-3 w-3" /> Chat
                    </a>
                  </div>
                </div>
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">Kota Domisili</span>
                  <p className="font-semibold text-bone">{selectedApp.city}</p>
                </div>
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">Tanggal Mendaftar</span>
                  <p className="font-mono text-bone">
                    {selectedApp.created_at
                      ? new Date(selectedApp.created_at).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-charcoal rounded-md border border-white/5 space-y-2">
                <p className="font-semibold text-muted-gold uppercase text-[10px] tracking-wider">
                  Kontak Darurat Medis
                </p>
                <p className="text-bone">
                  Nama: <strong>{selectedApp.emergency_contact_name}</strong> &bull; Telepon: <strong>{selectedApp.emergency_contact_phone}</strong>
                </p>
              </div>

              <div className="p-4 bg-charcoal rounded-md border border-white/5 space-y-2">
                <p className="font-semibold text-muted-gold uppercase text-[10px] tracking-wider">
                  Spesifikasi Kendaraan
                </p>
                <p className="text-bone">
                  Tipe: <strong>{selectedApp.motorcycle_model}</strong> ({selectedApp.motorcycle_year}) &bull; Plat: <strong>{selectedApp.motorcycle_plate}</strong>
                </p>
              </div>

              <div className="p-4 bg-charcoal rounded-md border border-white/5 space-y-2">
                <p className="font-semibold text-muted-gold uppercase text-[10px] tracking-wider">
                  Alasan Bergabung
                </p>
                <p className="text-bone-muted leading-relaxed italic">
                  &ldquo;{selectedApp.reason_to_join}&rdquo;
                </p>
              </div>

              {selectedApp.rejection_reason && (
                <div className="p-4 bg-red-950/40 rounded-md border border-red-500/30 space-y-1">
                  <p className="font-semibold text-red-400 uppercase text-[10px] tracking-wider">
                    Catatan Penolakan / Revisi
                  </p>
                  <p className="text-red-200">{selectedApp.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>
                Tutup
              </Button>
              {selectedApp.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={actionProcessing}
                    onClick={() => handleReject(selectedApp.id)}
                  >
                    Tolak
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={actionProcessing}
                    onClick={() => handleRequestRevision(selectedApp.id)}
                  >
                    Minta Revisi
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="font-bold"
                    disabled={actionProcessing}
                    onClick={() => handleApprove(selectedApp.id)}
                  >
                    Setujui & Terbitkan KTA
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
