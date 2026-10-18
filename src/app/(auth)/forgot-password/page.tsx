"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
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
        setSuccess(true);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMessage("Terjadi kendala saat mengirim instruksi reset kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-white/10 bg-asphalt/80 shadow-2xl backdrop-blur-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif font-black uppercase text-bone">
          Reset Kata Sandi
        </CardTitle>
        <CardDescription className="text-xs text-bone-muted">
          Masukkan alamat email akun Anda. Kami akan mengirimkan tautan pemulihan kata sandi.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-bone text-base">Instruksi Terkirim!</h4>
              <p className="text-xs text-bone-muted">
                Periksa kotak masuk email <span className="text-muted-gold font-mono">{email}</span> untuk memperbarui kata sandi Anda.
              </p>
            </div>
            <Link href="/login" className="block pt-2">
              <Button variant="outline" className="w-full">
                Kembali ke Halaman Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Terdaftar</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-bone-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@brotherhood.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-bold mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim Email...</span>
                </>
              ) : (
                <>
                  <span>Kirim Tautan Reset</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center text-xs text-bone-muted pt-0">
        <Link href="/login" className="text-muted-gold hover:underline">
          &larr; Batal dan kembali ke login
        </Link>
      </CardFooter>
    </Card>
  );
}
