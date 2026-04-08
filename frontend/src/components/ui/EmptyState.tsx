/**
 * FoodHunt — Empty State Components
 */

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '🍽️', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="text-6xl mb-4">{emoji}</span>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-white/60 max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-brand-coral text-white font-semibold rounded-xl
                     hover:bg-brand-coral-light transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function NoRestaurantsFound({ onReset }: { onReset?: () => void }) {
  return (
    <div className="text-center max-w-sm mx-auto space-y-6 animate-fade-in">
      <div className="relative">
        <div className="text-7xl mb-2">🍽️</div>
        <div className="absolute -top-2 -right-4 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>❓</div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-brand-cream">Restoran Bulunamadı</h3>
        <p className="text-brand-muted text-sm leading-relaxed">
          Seçtiğin filtrelere uygun yeterli restoran yok. Farklı bir bölge veya mutfak türü deneyebilirsin.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 003.51 15"/></svg>
            Filtreleri Değiştir
          </button>
        )}
        <p className="text-brand-muted text-xs">
          İpucu: "Tüm Mutfaklar" seçerek daha fazla sonuç görebilirsin
        </p>
      </div>
    </div>
  );
}

export function NoFavorites() {
  return (
    <EmptyState
      emoji="💛"
      title="Henüz favorin yok"
      description="Turnuva sonuçlarında beğendiğin restoranı favorilere ekleyebilirsin."
    />
  );
}

export function NoHistory() {
  return (
    <EmptyState
      emoji="🏆"
      title="Henüz turnuva oynamadın"
      description="İlk turnuvanı oyna ve sonuçlarını burada gör!"
    />
  );
}
