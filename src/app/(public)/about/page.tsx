import Link from "next/link";
import { Target, HeartHandshake, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrganizationProfile } from "@/features/organization/queries";

export const revalidate = 0; // Ensure fresh data on dynamic updates

export const metadata = {
  title: "Tentang Kami — Brotherhood Community Portal",
  description: "Sejarah, visi, misi, dan ikrar safety riding komunitas motor Brotherhood.",
};

export default async function AboutPage() {
  const org = await getOrganizationProfile();

  return (
    <div className="py-16 sm:py-24 bg-asphalt-grit">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header with High-Impact Typography */}
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
            <span className="h-1.5 w-6 bg-muted-gold rounded-full" />
            <span>{org.historySubtitle || "Profil & Sejarah Organisasi"}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-bold uppercase tracking-tight text-bone leading-none whitespace-pre-line">
            {org.historyTitle || (
              <>
                MENJELAJAH DENGAN KEHORMATAN, <br />
                <span className="text-metallic-gold">BERSAUDARA DALAM KEBAIKAN</span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg text-bone-muted leading-relaxed font-sans max-w-3xl">
            {org.historyDescription}
          </p>
        </div>

        {/* Vision & Mission Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* VISI */}
          <div className="tactical-panel rounded-2xl border border-muted-gold/40 bg-gradient-to-br from-charcoal via-asphalt to-charcoal p-8 sm:p-10 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-charcoal border border-muted-gold/50 flex items-center justify-center text-muted-gold shadow-md">
                <Target className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-gold">
                {org.visionBadge || "VISION 2030"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-bone uppercase tracking-wide">
              {org.visionTitle || "Visi Komunitas"}
            </h2>
            <p className="text-xs sm:text-sm text-bone-muted leading-relaxed font-sans">
              {org.visionText}
            </p>
          </div>

          {/* MISI POKOK */}
          <div className="tactical-panel rounded-2xl border border-white/10 bg-gradient-to-br from-charcoal via-asphalt to-charcoal p-8 sm:p-10 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-charcoal border border-white/10 flex items-center justify-center text-muted-gold shadow-md">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-bone-muted">
                {org.missionBadge || "CORE MISSION"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-bone uppercase tracking-wide">
              {org.missionTitle || "Misi Pokok"}
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-bone-muted font-sans">
              {org.missions?.map((mission, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-muted-gold shrink-0 mt-0.5" />
                  <span>{mission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Safety Riding Pledge — Tactical Stamped Manifesto / SOP Jalanan */}
        <div
          id="safety-pledge"
          className="rounded-3xl border-2 border-muted-gold/40 bg-gradient-to-b from-charcoal via-tarmac to-charcoal p-8 sm:p-14 relative overflow-hidden shadow-2xl"
        >
          <div className="max-w-4xl space-y-8 relative z-10">
            <div className="flex items-center gap-2 text-muted-gold font-mono text-xs uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4" />
              <span>{org.sopBadge || "SOP Jalanan & Dokumen Resmi Ikrar"}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-bone leading-tight">
              {org.sopTitle || (
                <>
                  5 IKRAR KESELAMATAN BERKENDARA <br />
                  <span className="text-metallic-gold">ANGGOTA BROTHERHOOD</span>
                </>
              )}
            </h2>

            <div className="space-y-4 pt-2">
              {org.sopItems?.map((item, index) => {
                const isGold = index === 0 || index === 1 || index === org.sopItems.length - 1;
                return (
                  <div
                    key={index}
                    className="flex gap-5 items-start p-4 rounded-xl bg-charcoal/80 border border-white/5"
                  >
                    <span
                      className={`font-display font-bold text-3xl shrink-0 ${
                        isGold ? "text-muted-gold" : "text-bone"
                      }`}
                    >
                      {item.number || `0${index + 1}`}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-bone text-lg uppercase tracking-wider">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-bone-muted leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="border-t border-white/10 pt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-display font-bold text-bone uppercase tracking-wider">
              Tertarik Bergabung Dengan Komunitas Kami?
            </h3>
            <p className="text-xs sm:text-sm text-bone-muted font-sans">
              Pendaftaran anggota baru dibuka sepanjang tahun dengan seleksi adab berkendara yang
              transparan.
            </p>
          </div>
          <Link href="/join">
            <Button
              size="lg"
              className="tactical-cut font-display font-bold uppercase tracking-wider text-xs py-6 sm:py-3.5 bg-gradient-to-r from-muted-gold to-forged-gold text-charcoal hover:brightness-110"
            >
              <span>Formulir Pendaftaran</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
