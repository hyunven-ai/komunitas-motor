import { SkeletonBlock } from "@/components/ui/section-skeleton";

export default function CommitteeLoading() {
  return (
    <div className="py-16 sm:py-24 bg-[#0B0D12] min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Shimmer */}
        <div className="max-w-3xl space-y-4">
          <SkeletonBlock className="h-4 w-44 rounded-full bg-red-600/20" />
          <SkeletonBlock className="h-12 sm:h-14 w-4/5 rounded-lg" />
          <SkeletonBlock className="h-5 w-full max-w-2xl rounded" />
        </div>

        {/* 6-Card Officer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-[#12141C] p-6 space-y-5 shadow-xl"
            >
              {/* Top Header Bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="h-7 w-7 rounded-lg" />
                  <SkeletonBlock className="h-4 w-20" />
                </div>
                <SkeletonBlock className="h-5 w-24 rounded-full" />
              </div>

              {/* Profile Image & Personal Identity */}
              <div className="flex items-center gap-4">
                <SkeletonBlock className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-6 w-3/4 rounded" />
                  <SkeletonBlock className="h-4 w-1/2 rounded" />
                  <SkeletonBlock className="h-3.5 w-4/5 rounded" />
                </div>
              </div>

              {/* Role & Duty Description */}
              <div className="border-t border-white/5 pt-3 space-y-2">
                <SkeletonBlock className="h-3.5 w-full" />
                <SkeletonBlock className="h-3.5 w-5/6" />
                <SkeletonBlock className="h-3.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

