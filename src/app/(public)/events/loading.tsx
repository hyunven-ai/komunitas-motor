import { SkeletonEventCard } from "@/components/states";

export default function EventsLoading() {
  return (
    <div className="py-16 sm:py-24 bg-asphalt-grit min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Shape */}
        <div className="max-w-4xl space-y-4">
          <div className="h-4 w-44 bg-white/10 rounded-full animate-pulse" />
          <div className="h-12 w-3/4 sm:w-1/2 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-6 w-full max-w-2xl bg-white/5 rounded-md animate-pulse" />
        </div>

        {/* Content-shaped Skeleton Grid (showing the shape of what is coming!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonEventCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

