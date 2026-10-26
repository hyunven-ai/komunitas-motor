import Link from "next/link";
import Image from "next/image";

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
      <Link href="/" className="mb-6 flex flex-col items-center gap-2 group relative z-10 text-center">
        <Image
          src="/logo.png"
          alt="Borneo Brotherhood"
          width={260}
          height={58}
          priority
          className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_2px_14px_rgba(239,68,68,0.35)]"
        />
        <span className="text-[10px] tracking-widest text-red-400 font-mono uppercase font-semibold">
          Community Portal
        </span>
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
