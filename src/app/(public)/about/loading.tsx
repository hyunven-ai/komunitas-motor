import { SkeletonBlock } from "@/components/ui/section-skeleton";

export default function AboutLoading() {
  return (
    <div className="py-16 sm:py-24 bg-[#0B0D12] min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header Shimmer */}
        <div className="max-w-4xl space-y-4">
          <SkeletonBlock className="h-4 w-44 rounded-full bg-red-600/20" />
          <SkeletonBlock className="h-14 sm:h-20 w-4/5 rounded-lg" />
          <SkeletonBlock className="h-5 w-full max-w-2xl rounded" />
          <SkeletonBlock className="h-5 w-3/4 rounded" />
        </div>

        {/* Vision & Mission Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Vision */}
          <div className="rounded-2xl border border-white/10 bg-[#12141C] p-8 sm:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-12 w-12 rounded-xl" />
              <SkeletonBlock className="h-4 w-24 rounded" />
            </div>
            <SkeletonBlock className="h-8 w-48 rounded" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          </div>

          {/* Card 2: Mission */}
          <div className="rounded-2xl border border-white/10 bg-[#12141C] p-8 sm:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-12 w-12 rounded-xl" />
              <SkeletonBlock className="h-4 w-28 rounded" />
            </div>
            <SkeletonBlock className="h-8 w-40 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="h-4 w-4 rounded-full shrink-0" />
                  <SkeletonBlock className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Riding Pledge Banner Skeleton */}
        <div className="rounded-3xl border border-white/10 bg-[#12141C]/80 p-8 sm:p-14 space-y-6">
          <SkeletonBlock className="h-4 w-48 rounded" />
          <SkeletonBlock className="h-10 sm:h-12 w-3/4 rounded-lg" />
          <div className="space-y-4 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <SkeletonBlock className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <SkeletonBlock className="h-5 w-44 rounded" />
                  <SkeletonBlock className="h-3.5 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

