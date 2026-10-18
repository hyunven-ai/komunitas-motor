"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, Mail, AlertCircle, Loader2, ArrowRight, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
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
        router.push("/admin");
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
        // Strict role validation for admin access
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);

        const hasAdminRole = roles?.some((r) =>
          ["super_admin", "chairman", "admin", "treasurer", "event_officer", "moderator"].includes(r.role)
        );

        if (!hasAdminRole) {
          await supabase.auth.signOut();
          setErrorMessage(
            "Akses ditolak: Akun Anda tidak memiliki wewenang administrator pengurus. Silakan masuk melalui Portal Anggota."
          );
          setLoading(false);
          return;
        }

        router.push("/admin");
      }
    } catch {
      setErrorMessage("Gagal menghubungkan ke server autentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0d14] px-4 py-12 text-[#f1f5f9] relative overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Background cosmic radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-sky-500/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* Top Logo */}
      <Link href="/" className="mb-6 flex items-center gap-3 group relative z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#161a29] shadow-inner transition-transform group-hover:scale-105">
          <Shield className="h-6 w-6 text-indigo-400" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-wider text-white uppercase flex items-center gap-1.5">
            BROTHERHOOD <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">HQ</span>
          </span>
          <span className="text-[10px] tracking-widest text-indigo-400 font-mono uppercase font-semibold">
            Executive Control Desk
          </span>
        </div>
      </Link>

      <main className="w-full max-w-md relative z-10">
        <Card className="border-white/[0.08] bg-[#131724] shadow-2xl backdrop-blur-md text-[#f1f5f9]">
          <CardHeader className="space-y-1.5 text-center pb-4">
            <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Login Pengurus & Admin
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Akses terbatas khusus Dewan Pengurus, Tim Sekretariat & Bendahara Komunitas.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-medium text-slate-300">
                  Email Administrator HQ
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@brotherhood.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 text-xs bg-[#171b29] border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password" className="text-xs font-medium text-slate-300">
                    Kata Sandi Keamanan
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Bantuan sandi?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-10 text-xs bg-[#171b29] border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] mt-2 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Mengautentikasi Sesi HQ...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Panel Pengurus</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-0 text-center">
            <div className="w-full pt-3 border-t border-white/[0.06]">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
                <span>Bukan pengurus? Masuk sebagai Anggota Komunitas</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer Back Link */}
      <p className="mt-6 text-center text-xs text-slate-400 relative z-10">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          &larr; Kembali ke Website Publik
        </Link>
      </p>
    </div>
  );
}
