"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, AlertCircle, Loader2, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function MemberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const isMock =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock-project");

    if (isMock) {
      setTimeout(() => {
        router.push("/member");
      }, 600);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Check if admin trying to log in through member portal
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);

        const hasAdmin = roles?.some((r) =>
          ["super_admin", "chairman", "admin", "treasurer", "event_officer", "moderator"].includes(r.role)
        );

        if (hasAdmin) {
          router.push("/admin");
        } else {
          router.push("/member");
        }
      }
    } catch {
      setErrorMessage("Gagal menghubungkan ke server autentikasi.");
      setLoading(false);
    }
  };

  return (
    <Card className="border-white/[0.08] bg-[#131724] shadow-2xl backdrop-blur-md text-[#f1f5f9]">
      <CardHeader className="space-y-1.5 text-center pb-4">
        <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/60 border border-red-500/30 text-red-400">
          <User className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Portal Anggota
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Masuk untuk mengakses KTA digital, pendaftaran event, dan forum komunitas.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-slate-300">
              Email Terdaftar
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="nama@brotherhood.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-10 text-xs bg-[#171b29] border-white/10 text-white placeholder-slate-500 focus:border-red-500/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                Kata Sandi
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-10 text-xs bg-[#171b29] border-white/10 text-white placeholder-slate-500 focus:border-red-500/50"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-semibold text-xs bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.35)] mt-2 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 text-center">
        <p className="text-xs text-slate-400">
          Belum terdaftar sebagai anggota?{" "}
          <Link href="/join" className="text-red-400 hover:underline font-medium">
            Daftar Calon Member
          </Link>
        </p>

        <div className="w-full pt-3 border-t border-white/[0.06]">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-300 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
            <span>Akses Khusus Dewan Pengurus & Admin HQ &rarr;</span>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
