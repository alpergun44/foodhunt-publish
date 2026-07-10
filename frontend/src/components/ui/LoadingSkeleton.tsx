/**
 * FoodHunt — Loading Skeleton Components
 * Shimmer effect for loading states
 */
export function SkeletonCard() {
  return (
    <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-pulse">
      {/* Image area */}
      <div className="relative w-full aspect-[4/3] bg-brand-elevated">
        {/* Rating badge skeleton */}
        <div className="absolute top-3 left-3 w-16 h-6 bg-brand-line rounded-md" />
        {/* Price badge skeleton */}
        <div className="absolute top-3 right-3 w-12 h-6 bg-brand-line rounded-md" />
      </div>
      {/* Content area */}
      <div className="p-4 bg-brand-surface border-t border-brand-line space-y-3">
        {/* Title */}
        <div className="h-5 bg-brand-line rounded-md w-3/4" />
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 bg-brand-elevated rounded-md w-20" />
          <div className="h-5 bg-brand-elevated rounded-md w-16" />
        </div>
        {/* Products */}
        <div className="pt-2 border-t border-brand-line space-y-2">
          <div className="h-3 bg-brand-elevated rounded w-12" />
          <div className="flex gap-1.5">
            <div className="h-5 bg-brand-elevated rounded-md w-24" />
            <div className="h-5 bg-brand-elevated rounded-md w-20" />
          </div>
        </div>
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
          className="h-3 bg-brand-elevated rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <div className="animate-pulse h-11 bg-brand-elevated rounded-xl w-full" />;
}

export function BattleSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6">
      {/* Round stepper skeleton */}
      <div className="w-full max-w-lg mx-auto mb-4">
        <div className="flex items-center justify-between gap-1">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className="w-7 h-7 rounded-full bg-brand-elevated animate-pulse" />
              {i < 4 && <div className="flex-1 h-px bg-brand-line" />}
            </div>
          ))}
        </div>
      </div>
      {/* Header skeleton */}
      <div className="h-4 bg-brand-elevated rounded w-48 mx-auto animate-pulse" />
      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full max-w-4xl">
        <SkeletonCard />
        <div className="w-12 h-12 rounded-full bg-brand-elevated border border-brand-line animate-pulse flex items-center justify-center">
          <span className="text-brand-muted font-medium text-xs">VS</span>
        </div>
        <SkeletonCard />
      </div>
    </div>
  );
}
