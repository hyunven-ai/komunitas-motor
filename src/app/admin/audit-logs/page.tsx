"use client";

import * as React from "react";
import {
  Download,
  Filter,
  Lock,
  UserCheck,
  CreditCard,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuditLogEntry {
  id: string;
  action: string;
  category: "MEMBERSHIP" | "FINANCE" | "EVENT" | "SECURITY" | "MODERATION";
  entity: string;
  performedBy: string;
  operatorRole: string;
  timestamp: string;
  ip: string;
  userAgent: string;
}

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: "log-01",
    action: "MEMBERSHIP_APPROVED",
    category: "MEMBERSHIP",
    entity: "Member: Bambang Wijaya (BMC-2026-0012)",
    performedBy: "Farhan Ardiansyah",
    operatorRole: "Sekretaris Jenderal",
    timestamp: "15 Menit lalu (15 Okt 17:15)",
    ip: "180.252.12.8",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "log-02",
    action: "PAYMENT_ATOMIC_APPROVED",
    category: "FINANCE",
    entity: "Invoice #INV-202611-0012 (Rp 350.000)",
    performedBy: "Rizky Pratama",
    operatorRole: "Bendahara Umum",
    timestamp: "1 Jam lalu (15 Okt 16:30)",
    ip: "182.1.88.42",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "log-03",
    action: "EVENT_CREATED",
    category: "EVENT",
    entity: "Touring Jalur Selatan Jawa: Pangandaran - Yogyakarta",
    performedBy: "Dimas Suryo",
    operatorRole: "Road Captain / Event Officer",
    timestamp: "Kemarin, 14:20 WIB",
    ip: "114.122.9.15",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },
  {
    id: "log-04",
    action: "TOPIC_PINNED",
    category: "MODERATION",
    entity: "SOP Keselamatan Konvoi 2026",
    performedBy: "Farhan Ardiansyah",
    operatorRole: "Moderator / Sekjen",
    timestamp: "2 Hari lalu",
    ip: "180.252.12.8",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "log-05",
    action: "SECURITY_ADMIN_LOGIN",
    category: "SECURITY",
    entity: "Admin Session Sesi Super Admin",
    performedBy: "Super Administrator",
    operatorRole: "Super Admin",
    timestamp: "3 Hari lalu",
    ip: "103.11.45.90",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
];

export default function AdminAuditLogsPage() {
  const [logs] = React.useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");

  const filteredLogs = logs.filter((l) => {
    if (categoryFilter !== "ALL" && l.category !== categoryFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.performedBy.toLowerCase().includes(q) ||
        l.ip.includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Waktu", "Tindakan", "Kategori", "Entitas", "Operator", "Role", "IP Address", "User Agent"];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      l.action,
      l.category,
      `"${l.entity.replace(/"/g, '""')}"`,
      `"${l.performedBy}"`,
      `"${l.operatorRole}"`,
      l.ip,
      `"${l.userAgent}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_brotherhood_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (category: AuditLogEntry["category"], action: string) => {
    switch (category) {
      case "SECURITY":
        return (
          <Badge variant="destructive" className="font-mono text-[9px] gap-1">
            <Lock className="h-2.5 w-2.5" /> {action}
          </Badge>
        );
      case "FINANCE":
        return (
          <Badge variant="gold" className="font-mono text-[9px] gap-1">
            <CreditCard className="h-2.5 w-2.5" /> {action}
          </Badge>
        );
      case "MEMBERSHIP":
        return (
          <Badge variant="success" className="font-mono text-[9px] gap-1">
            <UserCheck className="h-2.5 w-2.5" /> {action}
          </Badge>
        );
      case "EVENT":
        return (
          <Badge variant="secondary" className="font-mono text-[9px] gap-1">
            <Calendar className="h-2.5 w-2.5" /> {action}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-mono text-[9px]">
            {action}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Badge variant="gold">AUDIT TRAIL & KEAMANAN SISTEM</Badge>
          <h1 className="text-3xl font-serif font-black uppercase text-bone mt-1">
            Catatan Aktivitas Administratif
          </h1>
          <p className="text-xs text-bone-muted mt-0.5">
            Seluruh tindakan sensitif (persetujuan anggota, mutasi kas, modifikasi role, dan akses login) terekam permanen.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="text-xs font-bold gap-1.5 shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-muted-gold" />
          <span>Ekspor Audit Log (CSV)</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <Input
          placeholder="Cari tindakan, operator, atau alamat IP..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs sm:w-80"
        />

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-bone-muted mr-1 shrink-0" />
          {["ALL", "MEMBERSHIP", "FINANCE", "EVENT", "SECURITY"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-muted-gold text-charcoal font-bold"
                  : "bg-asphalt text-bone-muted hover:text-bone border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-white/10 bg-asphalt/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-charcoal/80 text-[10px] uppercase tracking-wider text-muted-gold font-mono">
              <tr>
                <th className="py-3 px-4">Stempel Waktu</th>
                <th className="py-3 px-4">Tindakan Sistem</th>
                <th className="py-3 px-4">Entitas Terkait</th>
                <th className="py-3 px-4">Operator Pengurus</th>
                <th className="py-3 px-4">Alamat IP & Klien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-bone">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-charcoal/40 transition-colors">
                  <td className="py-3 px-4 text-bone-muted font-mono whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.category, log.action)}
                  </td>
                  <td className="py-3 px-4 font-medium max-w-xs">{log.entity}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div>
                      <strong className="text-bone">{log.performedBy}</strong>
                      <span className="block text-[10px] text-bone-muted font-mono">{log.operatorRole}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-bone-muted whitespace-nowrap">
                    <div>
                      <span>{log.ip}</span>
                      <span className="block text-[9px] text-bone-muted/60 truncate max-w-[160px]" title={log.userAgent}>
                        {log.userAgent}
                      </span>
                    </div>
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
