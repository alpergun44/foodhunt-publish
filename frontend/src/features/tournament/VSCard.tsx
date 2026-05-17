/**
 * VSCard — Turnuva sırasında karşı karşıya gelen restoran kartı
 */
import type { Restaurant } from '../../api'
import { Icon } from '../../components/ui/Icons'
import { PLACEHOLDER_IMG } from './constants'

interface VSCardProps {
  restaurant: Restaurant
  onClick: () => void
  isWinner?: boolean
  animating?: boolean
  side?: 'left' | 'right'
}

const PriceLevel = ({ level }: { level?: number }) => {
  const l = level || 1
  return (
    <span className="flex items-center gap-0.5 text-[11px] tabular-nums">
      {[1, 2, 3].map(i => (
        <span key={i} className={i <= l ? 'text-brand-cream font-medium' : 'text-brand-muted/40'}>₺</span>
      ))}
    </span>
  )
}

export function VSCard({ restaurant, onClick, isWinner, animating, side }: VSCardProps) {
  const stars = (restaurant.rating ?? 0).toFixed(1)
  const imgSrc = restaurant.image_url || PLACEHOLDER_IMG

  return (
    <button
      onClick={onClick}
      disabled={animating}
      className={`
        group relative w-full max-w-sm rounded-2xl overflow-hidden text-left
        bg-brand-surface border border-brand-line
        transition-all duration-150
        ${animating ? 'scale-95 opacity-40 pointer-events-none' : 'hover:border-brand-muted/40 hover:-translate-y-px active:scale-[0.98]'}
        ${isWinner ? 'border-brand-cream' : ''}
        ${side === 'left' ? 'animate-fade-in' : side === 'right' ? 'animate-fade-in' : ''}
      `}
    >
      <div className="relative w-full aspect-[4/3] bg-brand-elevated overflow-hidden">
        <img
          src={imgSrc}
          alt={restaurant.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ contentVisibility: 'auto' }}
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }}
        />
        <div className="food-overlay absolute inset-0" />

        {/* Rating */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-brand-surface/85 backdrop-blur text-brand-cream px-2 py-0.5 rounded-md text-xs font-medium border border-brand-line">
          <Icon.Star /> {stars}
        </div>

        {/* Price level */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-brand-surface/85 backdrop-blur px-2 py-0.5 rounded-md border border-brand-line">
          <PriceLevel level={restaurant.price_level} />
        </div>

        {isWinner && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-brand-cream text-brand-dark px-3 py-1 rounded-md text-[11px] font-medium tracking-wider uppercase">
            Şampiyon
          </div>
        )}
      </div>

      <div className="p-4 bg-brand-surface border-t border-brand-line">
        <h3 className="text-base font-semibold text-brand-cream mb-1.5 truncate tracking-tight">{restaurant.name}</h3>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-brand-muted mb-2">
          {restaurant.cuisine && (
            <span className="inline-flex items-center gap-1 bg-brand-elevated text-brand-cream px-2 py-0.5 rounded-md border border-brand-line">
              <Icon.Utensils /> {restaurant.cuisine}
            </span>
          )}
          {restaurant.area && (
            <span className="inline-flex items-center gap-1 text-brand-muted px-2 py-0.5">
              <Icon.MapPin /> {restaurant.area}
            </span>
          )}
        </div>

        {restaurant.top3_products && restaurant.top3_products.length > 0 && (
          <div className="flex flex-col gap-1 pt-2 border-t border-brand-line">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted font-medium">Popüler</span>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.top3_products.slice(0, 3).map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-brand-elevated text-brand-cream px-2 py-0.5 rounded-md text-xs">
                  <span>{p.emoji}</span> {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
