/**
 * BattleLoadingSkeleton — Turnuva yüklenirken gösterilen iskelet
 */
import { SkeletonCard } from '../../components/ui/LoadingSkeleton'

export function BattleLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6">
      <div className="text-center space-y-3 w-full max-w-md">
        <div className="h-3 bg-brand-elevated rounded w-48 mx-auto animate-pulse" />
        <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
          <div className="h-full bg-brand-elevated rounded-full w-1/3 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full max-w-4xl">
        <div className="w-full max-w-sm"><SkeletonCard /></div>
        <div className="w-12 h-12 rounded-full bg-brand-elevated border border-brand-line animate-pulse" />
        <div className="w-full max-w-sm"><SkeletonCard /></div>
      </div>
    </div>
  )
}
