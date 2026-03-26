/**
 * FoodHunt — Loading Skeleton Components
 * Shimmer effect for loading states
 */
export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white/5 rounded-2xl p-4 space-y-3">
      <div className="h-40 bg-white/10 rounded-xl" />
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-6 bg-white/10 rounded-full w-16" />
        <div className="h-6 bg-white/10 rounded-full w-12" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-white/10 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <div className="animate-pulse h-12 bg-white/10 rounded-xl w-full" />;
}
