import { SkeletonNewsCard } from "@/components/states";

export default function NewsLoading() {
  return (
    <div className="py-16 sm:py-24 bg-charcoal min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="h-6 w-36 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-2/3 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-full bg-white/5 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonNewsCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

