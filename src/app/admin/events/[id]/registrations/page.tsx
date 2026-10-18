"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  ArrowLeft,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface RegItem {
  id: string;
  memberNumber: string;
  fullName: string;
  motorcycle: string;
  plate: string;
  status: "confirmed" | "registered" | "attended" | "cancelled";
  paymentStatus: "paid" | "unpaid";
  registeredAt: string;
}

const SAMPLE_REGS: RegItem[] = [
  {
    id: "reg-01",
    memberNumber: "BMC-2026-0012",
    fullName: "Bambang Wijaya",
    motorcycle: "Kawasaki Versys 650",
    plate: "B 4421 KBR",
    status: "confirmed",
    paymentStatus: "paid",
    registeredAt: "2026-10-14 11:20 WIB",
  },
  {
    id: "reg-02",
    memberNumber: "BMC-2018-0001",
    fullName: "Aryo Perkasa",
    motorcycle: "BMW R1250GS Adv",
    plate: "B 1001 ARY",
    status: "attended",
    paymentStatus: "paid",
    registeredAt: "2026-10-12 09:15 WIB",
  },
  {
    id: "reg-03",
    memberNumber: "BMC-2018-0004",
    fullName: "Hendrik 'Bison'",
    motorcycle: "Honda Africa Twin",
    plate: "B 4400 BSN",
    status: "attended",
    paymentStatus: "paid",
    registeredAt: "2026-10-12 14:30 WIB",
  },
  {
    id: "reg-04",
    memberNumber: "BMC-2020-0033",
    fullName: "Teguh Supriyadi",
    motorcycle: "Honda CB500X",
    plate: "F 3321 SO",
    status: "confirmed",
    paymentStatus: "paid",
    registeredAt: "2026-10-13 16:45 WIB",
  },
];

export default function EventRegistrationsPage() {
  const params = useParams();
  const eventId = (params?.id as string) || "evt-south-2026";
  const [registrations] = React.useState<RegItem[]>(SAMPLE_REGS);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  const filtered = registrations.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.memberNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.plate.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ["Member Number,Full Name,Motorcycle,Plate,Status,Payment,Registered At"];
    const rows = filtered.map((r) =>
      [
        r.memberNumber,
        `"${r.fullName}"`,
        `"${r.motorcycle}"`,
        `"${r.plate}"`,
        r.status,
        r.paymentStatus,
        `"${r.registeredAt}"`,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `participants_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs text-bone-muted hover:text-muted-gold mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Daftar Event</span>
          </Link>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Daftar Peserta Touring
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Manajemen peserta, status pembayaran kontribusi, dan rekapitulasi kehadiran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/events/${eventId}/attendance`}>
            <Button size="sm" variant="default" className="text-xs font-bold gap-1.5">
              <QrCode className="h-3.5 w-3.5" />
              <span>Buka Scanner Presensi</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={exportCSV}
            className="text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-muted-gold" />
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-bone-muted" />
          <Input
            placeholder="Cari nama peserta, nomor KTA, atau plat nomor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-gold shrink-0" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 rounded-md border border-white/10 bg-asphalt px-3 py-2 text-xs text-bone focus:outline-none focus:border-muted-gold w-full sm:w-auto"
          >
            <option value="all">Semua Status</option>
            <option value="confirmed">Terkonfirmasi (Lunas)</option>
            <option value="attended">Hadir di Lokasi</option>
            <option value="registered">Belum Bayar</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-white/10 bg-asphalt/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-charcoal/80 text-[10px] uppercase tracking-wider text-muted-gold font-mono">
              <tr>
                <th className="py-3 px-4">No. KTA</th>
                <th className="py-3 px-4">Nama Rider</th>
                <th className="py-3 px-4">Motor & Plat</th>
                <th className="py-3 px-4">Waktu Daftar</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-bone">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-charcoal/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-muted-gold">
                    {item.memberNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-bone">
                    {item.fullName}
                  </td>
                  <td className="py-3 px-4">
                    <span>{item.motorcycle}</span>
                    <span className="block text-[10px] text-muted-gold font-mono">{item.plate}</span>
                  </td>
                  <td className="py-3 px-4 text-bone-muted font-mono">
                    {item.registeredAt}
                  </td>
                  <td className="py-3 px-4">
                    {item.paymentStatus === "paid" ? (
                      <Badge variant="success" className="text-[9px]">LUNAS</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[9px]">BELUM BAYAR</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.status === "attended" ? (
                      <Badge variant="gold" className="text-[9px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> HADIR
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px]">
                        TERKONFIRMASI
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
