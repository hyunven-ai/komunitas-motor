import { GalleryGridSkeleton, SkeletonBlock } from "@/components/ui/section-skeleton";

export default function GalleryLoading() {
  return (
    <div className="py-16 sm:py-24 bg-[#0B0D12] min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Shape */}
        <div className="max-w-3xl space-y-4">
          <SkeletonBlock className="h-5 w-36 rounded-full bg-red-600/20 border-red-500/30" />
          <SkeletonBlock className="h-12 sm:h-14 w-3/4 rounded-lg" />
          <SkeletonBlock className="h-5 w-full max-w-2xl rounded" />
        </div>

        {/* Filter Pills Shimmer */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <SkeletonBlock className="h-8 w-28 rounded-full" />
          <SkeletonBlock className="h-8 w-32 rounded-full" />
          <SkeletonBlock className="h-8 w-28 rounded-full" />
          <SkeletonBlock className="h-8 w-30 rounded-full" />
          <SkeletonBlock className="h-8 w-24 rounded-full" />
        </div>

        {/* 6-Card Gallery Grid */}
        <GalleryGridSkeleton />
      </div>
    </div>
  );
}

