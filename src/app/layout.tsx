import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswaldDisplay = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#171918",
};

export const metadata: Metadata = {
  title: "Brotherhood Community Portal — Motorcycle Touring & Brotherhood",
  description:
    "Portal resmi manajemen komunitas motor touring Brotherhood. Info touring, pendaftaran anggota, KTA digital dengan verifikasi QR, dan forum anggota.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${oswaldDisplay.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-charcoal text-bone selection:bg-muted-gold selection:text-charcoal font-sans overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
