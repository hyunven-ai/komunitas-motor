import { SkeletonBlock } from "@/components/ui/section-skeleton";

export default function PartnersLoading() {
  return (
    <div className="py-16 sm:py-24 bg-[#0a0d14] min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Header Shimmer */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <SkeletonBlock className="h-6 w-52 mx-auto rounded-full bg-red-600/20" />
          <SkeletonBlock className="h-12 sm:h-16 w-4/5 mx-auto rounded-lg" />
          <SkeletonBlock className="h-5 w-full max-w-xl mx-auto rounded" />
          <div className="flex justify-center gap-4 pt-4">
            <SkeletonBlock className="h-12 w-48 rounded-xl bg-red-600/30" />
            <SkeletonBlock className="h-12 w-40 rounded-xl" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          <SkeletonBlock className="h-9 w-32 rounded-xl" />
          <SkeletonBlock className="h-9 w-36 rounded-xl" />
          <SkeletonBlock className="h-9 w-36 rounded-xl" />
          <SkeletonBlock className="h-9 w-32 rounded-xl" />
          <SkeletonBlock className="h-9 w-36 rounded-xl" />
        </div>

        {/* Main Sponsors 2-Column Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-9 w-9 rounded-xl" />
            <div className="space-y-1">
              <SkeletonBlock className="h-6 w-48 rounded" />
              <SkeletonBlock className="h-3.5 w-72 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-[#121626] p-7 space-y-5"
              >
                <SkeletonBlock className="h-56 w-full rounded-2xl" />
                <SkeletonBlock className="h-8 w-3/4 rounded" />
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-16 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

