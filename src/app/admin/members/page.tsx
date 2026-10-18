"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Users,
  Eye,
  Shield,
  Bike,
  MapPin,
  Phone,
  QrCode,
  CheckCircle2,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Mail,
  KeyRound,
  Copy,
  Check,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Member, MemberStatus } from "@/types/database";

type SortField = "name" | "email" | "city" | "joined_date" | "member_number" | "none";
type SortDirection = "asc" | "desc";

interface EditMemberForm {
  id: string;
  member_number: string;
  full_name: string;
  email?: string;
  phone_number: string;
  city: string;
  blood_type: string;
  motorcycle_model: string;
  motorcycle_plate: string;
  motorcycle_year: number;
  joined_date: string;
  status: MemberStatus;
}

export default function AdminMembersPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [search, setSearch] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = React.useState<string | null>(null);

  // Sorting State
  const [sortField, setSortField] = React.useState<SortField>("none");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Modals State
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);
  const [editingMember, setEditingMember] = React.useState<EditMemberForm | null>(null);
  const [isSavingEdit, setIsSavingEdit] = React.useState<boolean>(false);
  const [deletingMember, setDeletingMember] = React.useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  // Reset Password State
  const [resetMember, setResetMember] = React.useState<Member | null>(null);
  const [resetMode, setResetMode] = React.useState<"direct" | "email">("direct");
  const [newPassword, setNewPassword] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isResetting, setIsResetting] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [resetSuccessInfo, setResetSuccessInfo] = React.useState<{ message: string; password?: string } | null>(null);

  // Fetch Members
  const fetchMembers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/members");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMembers(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat database anggota:", err);
      setErrorFeedback("Gagal memuat data anggota dari database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField("none");
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredAndSortedMembers = React.useMemo(() => {
    // 1. Filter
    const result = members.filter((m) => {
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        m.member_number.toLowerCase().includes(q) ||
        (m.profile?.full_name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.motorcycle_model || "").toLowerCase().includes(q) ||
        (m.motorcycle_plate || "").toLowerCase().includes(q) ||
        (m.profile?.city || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    // 2. Sort
    if (sortField === "none") return result;

    return [...result].sort((a, b) => {
      let valA = "";
      let valB = "";

      if (sortField === "name") {
        valA = (a.profile?.full_name || "").toLowerCase();
        valB = (b.profile?.full_name || "").toLowerCase();
      } else if (sortField === "email") {
        valA = (a.email || "").toLowerCase();
        valB = (b.email || "").toLowerCase();
      } else if (sortField === "city") {
        valA = (a.profile?.city || "").toLowerCase();
        valB = (b.profile?.city || "").toLowerCase();
      } else if (sortField === "joined_date") {
        valA = a.joined_date || "";
        valB = b.joined_date || "";
      } else if (sortField === "member_number") {
        valA = a.member_number || "";
        valB = b.member_number || "";
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [members, search, statusFilter, sortField, sortDirection]);

  // Pagination Calculations
  const totalItems = filteredAndSortedMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedMembers = filteredAndSortedMembers.slice(startIndex, endIndex);

  // Reset to page 1 if search/filter exceeds pages
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Export CSV
  const exportCSV = () => {
    const headers = ["Nomor KTA,Nama Lengkap,Email,Kota,Model Motor,Plat Motor,Status,Tanggal Bergabung"];
    const rows = filteredAndSortedMembers.map((m) =>
      [
        m.member_number,
        `"${m.profile?.full_name || ""}"`,
        `"${m.email || ""}"`,
        `"${m.profile?.city || ""}"`,
        `"${m.motorcycle_model || ""}"`,
        `"${m.motorcycle_plate || ""}"`,
        m.status,
        m.joined_date,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brotherhood_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Edit Modal
  const openEditModal = (member: Member) => {
    setEditingMember({
      id: member.id,
      member_number: member.member_number,
      full_name: member.profile?.full_name || "",
      email: member.email || "",
      phone_number: member.profile?.phone_number || "",
      city: member.profile?.city || "",
      blood_type: member.profile?.blood_type || "",
      motorcycle_model: member.motorcycle_model || "",
      motorcycle_plate: member.motorcycle_plate || "",
      motorcycle_year: member.motorcycle_year || 2024,
      joined_date: member.joined_date || new Date().toISOString().slice(0, 10),
      status: member.status,
    });
  };

  // Reset Password Modal Actions
  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pwd = "Bmc!";
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const openResetPasswordModal = (member: Member) => {
    setResetMember(member);
    setResetMode("direct");
    setNewPassword("");
    setShowPassword(false);
    setCopied(false);
    setResetSuccessInfo(null);
  };

  const handleCopyPassword = () => {
    const pwd = resetSuccessInfo?.password || newPassword;
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetMember) return;

    if (resetMode === "direct" && (!newPassword || newPassword.length < 6)) {
      alert("Kata sandi baru minimal 6 karakter.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/members/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: resetMember.id,
          userId: resetMember.user_id,
          newPassword: resetMode === "direct" ? newPassword : undefined,
          action: resetMode === "direct" ? "set_password" : "send_email",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResetSuccessInfo({
          message: json.message,
          password: resetMode === "direct" ? newPassword : undefined,
        });
        setFeedback(json.message);
        setTimeout(() => setFeedback(null), 5000);
      } else {
        alert(json.message || "Gagal mereset kata sandi.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Terjadi kendala jaringan saat memproses reset kata sandi.");
    } finally {
      setIsResetting(false);
    }
  };

  // Save Edit Member
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMember),
      });

      const json = await res.json();
      if (json.success) {
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id === editingMember.id) {
              return {
                ...m,
                email: editingMember.email,
                status: editingMember.status,
                motorcycle_model: editingMember.motorcycle_model,
                motorcycle_plate: editingMember.motorcycle_plate,
                motorcycle_year: editingMember.motorcycle_year,
                joined_date: editingMember.joined_date,
                profile: m.profile
                  ? {
                      ...m.profile,
                      full_name: editingMember.full_name,
                      phone_number: editingMember.phone_number,
                      city: editingMember.city,
                      blood_type: editingMember.blood_type,
                    }
                  : undefined,
              };
            }
            return m;
          })
        );
        setFeedback(`Data anggota ${editingMember.member_number} berhasil diperbarui!`);
        setTimeout(() => setFeedback(null), 4000);
        setEditingMember(null);
      } else {
        alert(json.message || "Gagal memperbarui data anggota.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/members?id=${deletingMember.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
        setFeedback(`Anggota ${deletingMember.member_number} berhasil dihapus dari database.`);
        setTimeout(() => setFeedback(null), 4000);
        setDeletingMember(null);
      } else {
        alert(json.message || "Gagal menghapus anggota.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan saat menghapus anggota.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-bone-muted/50 group-hover:text-bone-muted ml-1 inline" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-muted-gold ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 text-muted-gold ml-1 inline" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">DIREKTORI RESMI</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Database Anggota Komunitas
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Daftar seluruh rider resmi terdaftar dengan nomor KTA unik terbitan sistem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMembers}
            disabled={isLoading}
            className="text-xs gap-1.5 border-white/10 hover:border-muted-gold/40 text-bone"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-gold ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan Data</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="text-xs gap-2 shrink-0 bg-asphalt border-white/10 hover:border-muted-gold/40 text-bone"
          >
            <Download className="h-4 w-4 text-muted-gold" />
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 hover:text-emerald-200 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {errorFeedback && (
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-red-500/40 bg-red-950/60 text-red-200 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
          <button onClick={() => setErrorFeedback(null)} className="text-red-400 hover:text-red-200 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Filter, Search & Pagination Limit Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-bone-muted" />
          <Input
            placeholder="Cari nomor KTA, nama anggota, motor, plat, atau kota domisili..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 text-xs bg-charcoal"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-gold shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-white/10 bg-asphalt px-2.5 py-1 text-xs text-bone focus:outline-none focus:border-muted-gold"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
              <option value="suspended">Ditangguhkan</option>
              <option value="honorary">Kehormatan</option>
            </select>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-bone-muted">Urutkan:</span>
            <select
              value={`${sortField}_${sortDirection}`}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "none_asc") {
                  setSortField("none");
                  setSortDirection("asc");
                } else {
                  const [field, dir] = val.split("_");
                  setSortField(field as SortField);
                  setSortDirection(dir as SortDirection);
                }
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-white/10 bg-asphalt px-2.5 py-1 text-xs text-bone focus:outline-none focus:border-muted-gold"
            >
              <option value="none_asc">Bawaan (Terbaru)</option>
              <option value="name_asc">Nama (A - Z)</option>
              <option value="name_desc">Nama (Z - A)</option>
              <option value="email_asc">Email (A - Z)</option>
              <option value="email_desc">Email (Z - A)</option>
              <option value="city_asc">Domisili (A - Z)</option>
              <option value="city_desc">Domisili (Z - A)</option>
              <option value="joined_date_desc">Tgl Gabung (Terbaru)</option>
              <option value="joined_date_asc">Tgl Gabung (Terlama)</option>
              <option value="member_number_asc">No. KTA (Menaik)</option>
            </select>
          </div>

          {/* Toggle Items Per Page (10, 20, 30, 50) */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-[11px] text-bone-muted">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-muted-gold/40 bg-asphalt px-2.5 py-1 text-xs font-mono font-bold text-muted-gold focus:outline-none focus:border-muted-gold"
            >
              <option value={10}>10 item</option>
              <option value={20}>20 item</option>
              <option value={30}>30 item</option>
              <option value={50}>50 item</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3">
          <Loader2 className="h-8 w-8 text-muted-gold animate-spin" />
          <p className="text-xs text-bone-muted">Memuat database anggota dari Supabase...</p>
        </div>
      ) : (
        <Card className="border-white/10 bg-asphalt/60 overflow-hidden shadow-xl">
          {paginatedMembers.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="h-10 w-10 text-bone-muted mx-auto opacity-50" />
              <p className="text-sm font-bold text-bone">Tidak ada data anggota ditemukan</p>
              <p className="text-xs text-bone-muted">Coba sesuaikan kata kunci pencarian atau filter status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-charcoal/80 text-[10px] uppercase tracking-wider text-muted-gold font-mono">
                  <tr>
                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("member_number")}
                        className="flex items-center gap-1 hover:text-bone transition-colors group uppercase"
                      >
                        <span>Nomor KTA</span>
                        {renderSortIcon("member_number")}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-bone transition-colors group uppercase font-bold"
                      >
                        <span>Nama Rider (A-Z)</span>
                        {renderSortIcon("name")}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("email")}
                        className="flex items-center gap-1 hover:text-bone transition-colors group uppercase font-bold"
                      >
                        <span>Email Akun</span>
                        {renderSortIcon("email")}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("city")}
                        className="flex items-center gap-1 hover:text-bone transition-colors group uppercase font-bold"
                      >
                        <span>Domisili (A-Z)</span>
                        {renderSortIcon("city")}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Motor & Plat</th>
                    <th className="py-3.5 px-4">
                      <button
                        onClick={() => handleSort("joined_date")}
                        className="flex items-center gap-1 hover:text-bone transition-colors group uppercase font-bold"
                      >
                        <span>Tgl Bergabung</span>
                        {renderSortIcon("joined_date")}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-bone">
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-charcoal/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-muted-gold whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-muted-gold/10 border border-muted-gold/30">
                          {member.member_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-bone block text-sm">
                          {member.profile?.full_name || "Anggota Brotherhood"}
                        </span>
                        {member.profile?.phone_number && (
                          <span className="text-[10px] text-bone-muted font-mono block">
                            {member.profile.phone_number}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {member.email ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-bone">
                            <Mail className="h-3.5 w-3.5 text-muted-gold/80 shrink-0" />
                            <span className="truncate max-w-[200px]" title={member.email}>
                              {member.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-bone-muted/40 font-mono text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-bone-muted whitespace-nowrap font-medium">
                        {member.profile?.city || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-medium">{member.motorcycle_model}</span>
                        <span className="text-[10px] font-mono text-muted-gold">
                          {member.motorcycle_plate} ({member.motorcycle_year})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-bone-muted font-mono whitespace-nowrap">
                        {member.joined_date}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {member.status === "active" && (
                          <Badge variant="gold" className="text-[9px]">
                            AKTIF
                          </Badge>
                        )}
                        {member.status === "inactive" && (
                          <Badge variant="secondary" className="text-[9px]">
                            NON-AKTIF
                          </Badge>
                        )}
                        {member.status === "suspended" && (
                          <Badge variant="destructive" className="text-[9px]">
                            SUSPENDED
                          </Badge>
                        )}
                        {member.status === "honorary" && (
                          <Badge variant="outline" className="text-[9px]">
                            KEHORMATAN
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] h-7 px-2 gap-1 text-muted-gold hover:text-bone hover:bg-white/5"
                            onClick={() => setSelectedMember(member)}
                            title="Lihat Detail KTA"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">KTA</span>
                          </Button>

                          {/* Reset Password Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] h-7 px-2 gap-1 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40"
                            onClick={() => openResetPasswordModal(member)}
                            title="Reset Kata Sandi Anggota"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Reset Sandi</span>
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] h-7 px-2 gap-1 text-sky-400 hover:text-sky-300 hover:bg-sky-950/40"
                            onClick={() => openEditModal(member)}
                            title="Edit Data Anggota"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] h-7 px-2 gap-1 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                            onClick={() => setDeletingMember(member)}
                            title="Hapus Anggota"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Hapus</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10 bg-charcoal/40 text-xs text-bone-muted">
              <div>
                Menampilkan <strong className="text-bone">{startIndex + 1}</strong> &ndash;{" "}
                <strong className="text-bone">{endIndex}</strong> dari{" "}
                <strong className="text-muted-gold">{totalItems}</strong> anggota
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs border-white/10 hover:border-muted-gold/40"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Sebelumnya</span>
                </Button>

                <div className="flex items-center gap-1 font-mono text-xs px-2">
                  <span className="text-muted-gold font-bold">{currentPage}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 text-xs border-white/10 hover:border-muted-gold/40"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* MODAL EDIT DATA ANGGOTA */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-xl border-muted-gold/40 bg-asphalt p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <Badge variant="gold">EDIT DATA ANGGOTA</Badge>
                <h3 className="text-lg font-serif font-black uppercase text-bone mt-1">
                  {editingMember.full_name || "Anggota"}
                </h3>
                <p className="text-xs font-mono font-bold text-muted-gold mt-0.5">
                  KTA: {editingMember.member_number}
                </p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-bone-muted hover:text-bone text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <Label htmlFor="edit_fullName" className="text-[11px] text-bone-muted">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="edit_fullName"
                    required
                    value={editingMember.full_name}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, full_name: e.target.value })
                    }
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_email" className="text-[11px] text-bone-muted">
                    Alamat Email Akun
                  </Label>
                  <Input
                    id="edit_email"
                    type="email"
                    placeholder="email@example.com"
                    value={editingMember.email || ""}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, email: e.target.value })
                    }
                    className="text-xs bg-charcoal font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_phone" className="text-[11px] text-bone-muted">
                    Nomor WhatsApp / HP *
                  </Label>
                  <Input
                    id="edit_phone"
                    required
                    value={editingMember.phone_number}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, phone_number: e.target.value })
                    }
                    className="text-xs bg-charcoal font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_city" className="text-[11px] text-bone-muted">
                    Kota Domisili *
                  </Label>
                  <Input
                    id="edit_city"
                    required
                    value={editingMember.city}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, city: e.target.value })
                    }
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_blood" className="text-[11px] text-bone-muted">
                    Golongan Darah (Opsional)
                  </Label>
                  <Input
                    id="edit_blood"
                    placeholder="Contoh: O+, A+, B+"
                    value={editingMember.blood_type}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, blood_type: e.target.value })
                    }
                    className="text-xs bg-charcoal font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_model" className="text-[11px] text-bone-muted">
                    Merk & Model Motor *
                  </Label>
                  <Input
                    id="edit_model"
                    required
                    value={editingMember.motorcycle_model}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, motorcycle_model: e.target.value })
                    }
                    className="text-xs bg-charcoal"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_plate" className="text-[11px] text-bone-muted">
                    Nomor Plat Motor *
                  </Label>
                  <Input
                    id="edit_plate"
                    required
                    value={editingMember.motorcycle_plate}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, motorcycle_plate: e.target.value })
                    }
                    className="text-xs bg-charcoal font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_year" className="text-[11px] text-bone-muted">
                    Tahun Perakitan Motor
                  </Label>
                  <Input
                    id="edit_year"
                    type="number"
                    min={1980}
                    max={2030}
                    value={editingMember.motorcycle_year}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        motorcycle_year: Number(e.target.value),
                      })
                    }
                    className="text-xs bg-charcoal font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit_joinedDate" className="text-[11px] text-bone-muted">
                    Tanggal Bergabung
                  </Label>
                  <Input
                    id="edit_joinedDate"
                    type="date"
                    value={editingMember.joined_date}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, joined_date: e.target.value })
                    }
                    className="text-xs bg-charcoal font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <Label htmlFor="edit_status" className="text-[11px] text-bone-muted">
                  Status Keanggotaan
                </Label>
                <select
                  id="edit_status"
                  value={editingMember.status}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      status: e.target.value as MemberStatus,
                    })
                  }
                  className="w-full h-9 rounded-md border border-white/10 bg-charcoal px-3 text-xs text-bone focus:outline-none focus:border-muted-gold"
                >
                  <option value="active">AKTIF</option>
                  <option value="inactive">NON-AKTIF</option>
                  <option value="suspended">DITANGGUHKAN (SUSPENDED)</option>
                  <option value="honorary">KEHORMATAN (HONORARY)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMember(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSavingEdit}
                  className="font-bold gap-1.5"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS ANGGOTA */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <Card className="w-full max-w-md border-red-500/50 bg-asphalt p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-full bg-red-950/70 border border-red-500/40">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-bone">Hapus Data Anggota</h3>
                <p className="text-xs text-red-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-bone-muted leading-relaxed">
              Apakah Anda yakin ingin menghapus anggota{" "}
              <strong className="text-bone">
                {deletingMember.profile?.full_name || "Anggota"}
              </strong>{" "}
              dengan nomor KTA{" "}
              <strong className="font-mono text-muted-gold">
                {deletingMember.member_number}
              </strong>{" "}
              dari Database Anggota?
            </p>

            <div className="p-3 bg-charcoal rounded-md border border-white/5 text-xs text-bone-muted space-y-1">
              <p>
                Domisili: <span className="text-bone">{deletingMember.profile?.city || "-"}</span>
              </p>
              <p>
                Motor: <span className="text-bone">{deletingMember.motorcycle_model}</span> (
                {deletingMember.motorcycle_plate})
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingMember(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteMember}
                className="font-bold gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Hapus Anggota</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DETAIL KTA MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-muted-gold/40 bg-asphalt p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <Badge variant="gold">KARTU TANDA ANGGOTA (KTA)</Badge>
                <h3 className="text-xl font-serif font-black uppercase text-bone mt-1">
                  {selectedMember.profile?.full_name}
                </h3>
                <p className="text-xs font-mono font-bold text-muted-gold mt-0.5">
                  {selectedMember.member_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-bone-muted hover:text-bone text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">Kota Domisili</span>
                  <p className="font-semibold text-bone">{selectedMember.profile?.city || "-"}</p>
                </div>
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">No. WhatsApp</span>
                  <p className="font-semibold text-bone">{selectedMember.profile?.phone_number || "-"}</p>
                </div>
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">Golongan Darah</span>
                  <p className="font-semibold text-bone font-mono">
                    {selectedMember.profile?.blood_type || "-"}
                  </p>
                </div>
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1">
                  <span className="text-bone-muted uppercase text-[10px]">Tanggal Bergabung</span>
                  <p className="font-mono text-bone">{selectedMember.joined_date}</p>
                </div>
                <div className="p-3 bg-charcoal rounded-md border border-white/5 space-y-1 col-span-2">
                  <span className="text-bone-muted uppercase text-[10px]">Email Akun</span>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-gold shrink-0" />
                    <p className="font-semibold text-bone font-mono truncate" title={selectedMember.email || ""}>
                      {selectedMember.email || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-charcoal rounded-md border border-white/5 space-y-2">
                <p className="font-semibold text-muted-gold uppercase text-[10px] tracking-wider">
                  Data Kendaraan Touring
                </p>
                <p className="text-bone">
                  Tipe: <strong>{selectedMember.motorcycle_model}</strong> ({selectedMember.motorcycle_year}) &bull; Plat: <strong>{selectedMember.motorcycle_plate}</strong>
                </p>
              </div>

              {selectedMember.qr_verification_token && (
                <div className="p-4 bg-charcoal rounded-md border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-muted-gold uppercase text-[10px] tracking-wider">
                      Token QR Verifikasi KTA
                    </p>
                    <code className="text-[11px] text-bone-muted font-mono">{selectedMember.qr_verification_token}</code>
                  </div>
                  <div className="p-2 bg-asphalt rounded border border-white/10">
                    <QrCode className="h-6 w-6 text-muted-gold" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-amber-400 hover:text-amber-300 border-amber-500/30 hover:bg-amber-950/40"
                onClick={() => {
                  const m = selectedMember;
                  setSelectedMember(null);
                  openResetPasswordModal(m);
                }}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Reset Sandi</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-sky-400 hover:text-sky-300"
                onClick={() => {
                  const m = selectedMember;
                  setSelectedMember(null);
                  openEditModal(m);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Anggota</span>
              </Button>
              <Button variant="default" size="sm" onClick={() => setSelectedMember(null)}>
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL RESET PASSWORD ANGGOTA */}
      {resetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-amber-500/40 bg-asphalt p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/40">
                    KEAMANAN & AKSES
                  </Badge>
                  <h3 className="text-base font-serif font-black uppercase text-bone mt-0.5">
                    Reset Kata Sandi Anggota
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setResetMember(null);
                  setResetSuccessInfo(null);
                }}
                className="text-bone-muted hover:text-bone text-lg"
              >
                ✕
              </button>
            </div>

            {/* Target Member Info */}
            <div className="p-3.5 bg-charcoal rounded-lg border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-bone-muted">Nama Anggota:</span>
                <span className="font-bold text-bone">{resetMember.profile?.full_name || "Anggota"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-bone-muted">Nomor KTA:</span>
                <span className="font-mono text-muted-gold font-bold">{resetMember.member_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-bone-muted">Email Akun:</span>
                <span className="font-mono text-bone">{resetMember.email || "(Tidak ada email terdaftar)"}</span>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-charcoal/80 rounded-lg border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setResetMode("direct");
                  setResetSuccessInfo(null);
                }}
                className={`py-2 px-3 rounded-md font-medium transition-all ${
                  resetMode === "direct"
                    ? "bg-muted-gold text-charcoal font-bold shadow"
                    : "text-bone-muted hover:text-bone"
                }`}
              >
                Set Kata Sandi Langsung
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMode("email");
                  setResetSuccessInfo(null);
                }}
                className={`py-2 px-3 rounded-md font-medium transition-all ${
                  resetMode === "email"
                    ? "bg-muted-gold text-charcoal font-bold shadow"
                    : "text-bone-muted hover:text-bone"
                }`}
              >
                Kirim Tautan ke Email
              </button>
            </div>

            {/* Success Feedback Box */}
            {resetSuccessInfo && (
              <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{resetSuccessInfo.message}</span>
                </div>
                {resetSuccessInfo.password && (
                  <div className="p-2.5 bg-black/40 rounded border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400/80 block uppercase">Kata Sandi Baru:</span>
                      <code className="text-sm font-mono font-bold text-emerald-200">
                        {resetSuccessInfo.password}
                      </code>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPassword}
                      className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <p className="text-[11px] text-emerald-300/80">
                  Berikan kata sandi ini kepada anggota agar dapat login kembali ke portal anggota.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              {resetMode === "direct" ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="new_password" className="text-[11px] text-bone-muted">
                        Kata Sandi Baru * (Minimal 6 karakter)
                      </Label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[11px] text-muted-gold hover:underline flex items-center gap-1 font-mono"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Acak Sandi Kuat</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password baru atau klik Acak Sandi"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-charcoal pr-10 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-bone-muted hover:text-bone text-xs flex items-center"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-bone-muted leading-relaxed">
                    Admin dapat langsung menetapkan kata sandi baru untuk anggota tanpa perlu menunggu konfirmasi email.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-charcoal rounded-lg border border-white/5">
                  <p className="text-xs text-bone-muted leading-relaxed">
                    Sistem akan mengirimkan email resmi berisi tautan aman untuk mengatur ulang kata sandi ke alamat:
                  </p>
                  <p className="text-sm font-mono font-bold text-muted-gold">
                    {resetMember.email || "(Email tidak terdaftar pada akun ini)"}
                  </p>
                  {!resetMember.email && (
                    <p className="text-[11px] text-red-400">
                      Peringatan: Anggota ini belum memiliki alamat email yang valid. Silakan gunakan opsi &quot;Set Kata Sandi Langsung&quot;.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isResetting}
                  onClick={() => {
                    setResetMember(null);
                    setResetSuccessInfo(null);
                  }}
                >
                  Tutup
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isResetting || (resetMode === "email" && !resetMember.email)}
                  className="font-bold gap-1.5"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : resetMode === "direct" ? (
                    <>
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Simpan Kata Sandi</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      <span>Kirim Tautan Email</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
