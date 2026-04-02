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
    <EmptyState
      emoji="🔍"
      title="Restoran bulunamadı"
      description="Bu bölge veya mutfak için henüz restoran eklenmemiş. Farklı bir filtre deneyin."
      actionLabel={onReset ? "Filtreleri Temizle" : undefined}
      onAction={onReset}
    />
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
