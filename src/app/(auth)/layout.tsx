import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0d14] px-4 py-12 text-[#f1f5f9] relative overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Background cosmic radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-red-600/10 via-sky-500/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* Top Logo */}
      <Link href="/" className="mb-6 flex items-center gap-3 group relative z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#161a29] shadow-inner transition-transform group-hover:scale-105">
          <Shield className="h-6 w-6 text-red-400" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-wider text-white uppercase">
            BROTHERHOOD
          </span>
          <span className="text-[10px] tracking-widest text-red-400 font-mono uppercase font-semibold">
            Community Portal
          </span>
        </div>
      </Link>

      <main className="w-full max-w-md relative z-10">{children}</main>

      {/* Footer Back Link */}
      <p className="mt-6 text-center text-xs text-slate-400 relative z-10">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          &larr; Kembali ke Website Publik
        </Link>
      </p>
    </div>
  );
}
