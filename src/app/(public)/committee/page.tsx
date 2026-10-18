import {
  Shield,
  Award,
  Users,
  Compass,
  Wrench,
  Megaphone,
  Star,
  Zap,
  Bike,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCommitteePageData } from "@/features/committee/queries";

export const revalidate = 0; // Fresh dynamic data on every request

export const metadata = {
  title: "Struktur Pengurus — Brotherhood Community Portal",
  description: "Daftar susunan dewan pengurus dan pejabat organisasi Brotherhood Motorcycle Community.",
};

const ICON_MAP = {
  Shield,
  Award,
  Users,
  Compass,
  Wrench,
  Megaphone,
  Star,
  Zap,
};

export default async function CommitteePage() {
  const committee = await getCommitteePageData();

  return (
    <div className="py-16 sm:py-24 bg-asphalt-grit">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header with High-Impact Typography */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-gold uppercase tracking-widest">
            <span className="h-1.5 w-6 bg-muted-gold rounded-full" />
            <span>{committee.badge || "Organisasi & Kepengurusan"}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black uppercase text-bone tracking-tight leading-tight">
            {committee.title || "Dewan Pengurus & Pejabat Komunitas"}
          </h1>
          <p className="text-base sm:text-lg text-bone-muted leading-relaxed font-sans">
            {committee.description}
          </p>
        </div>

        {/* Committee Grid with Prominent Profile Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {committee.members?.map((officer) => {
            const IconComponent =
              (officer.iconName && ICON_MAP[officer.iconName]) || Shield;

            return (
              <Card
                key={officer.id || officer.code}
                className="border border-white/10 bg-asphalt/60 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden group rounded-2xl"
              >
                {/* Ambient glow accent */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all" />

                <CardContent className="p-6 space-y-5 relative z-10">
                  {/* Top Header Bar */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <div className="h-7 w-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">
                        {officer.code}
                      </span>
                    </div>
                    {officer.memberNumber && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono border-white/10 bg-charcoal text-bone-muted"
                      >
                        {officer.memberNumber}
                      </Badge>
                    )}
                  </div>

                  {/* Profile Image & Personal Identity */}
                  <div className="flex items-center gap-4">
                    {/* Tactical Framed Profile Image */}
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-2 border-amber-400/40 bg-charcoal shadow-xl relative group-hover:border-amber-400 group-hover:shadow-amber-400/10 transition-all">
                        {officer.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={officer.avatarUrl}
                            alt={officer.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-charcoal via-asphalt to-charcoal text-amber-400">
                            <IconComponent className="h-8 w-8 opacity-60" />
                            <span className="text-[9px] font-mono text-bone-muted mt-1 uppercase">
                              {officer.code}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Small Active Badge Dot */}
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-asphalt shadow" />
                    </div>

                    {/* Name, Position & Bike */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-base sm:text-lg font-bold font-serif text-bone leading-snug group-hover:text-amber-300 transition-colors">
                        {officer.name}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {officer.position}
                      </p>
                      {officer.motorcycle && (
                        <div className="flex items-center gap-1.5 text-[11px] text-bone-muted pt-0.5">
                          <Bike className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
                          <span className="truncate italic">{officer.motorcycle}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role & Duty Description */}
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-xs text-bone-muted leading-relaxed font-sans line-clamp-4">
                      {officer.roleDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Commitment note */}
        {committee.commitmentTitle && (
          <div className="rounded-2xl border border-muted-gold/30 bg-gradient-to-b from-charcoal via-asphalt to-charcoal p-6 sm:p-8 text-center max-w-3xl mx-auto space-y-3 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-bone uppercase tracking-wider">
              {committee.commitmentTitle}
            </h3>
            <p className="text-xs sm:text-sm text-bone-muted leading-relaxed font-sans max-w-2xl mx-auto">
              {committee.commitmentDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
