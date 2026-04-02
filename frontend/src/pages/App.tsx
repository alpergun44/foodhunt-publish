import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { api, authApi, Restaurant, InspirationCard, TournamentSlot, safeGetItem, safeSetItem } from '../api'
import { useGeolocation } from '../hooks/useGeolocation'
import { hapticImpact, hapticNotification, nativeShare, configureStatusBar, hideSplashScreen } from '../utils/native'
import { SocialProof } from '../components/ui/SocialProof'
import { CookieConsent } from '../components/ui/CookieConsent'
import { Onboarding, shouldShowOnboarding } from '../components/ui/Onboarding'
import { NoRestaurantsFound } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/LoadingSkeleton'
import { IOSInstallBanner } from '../components/ui/IOSInstallBanner'

const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#1a1a1a"/><text x="200" y="160" text-anchor="middle" fill="#666" font-size="48">&#127869;</text></svg>'
)

// ─── Icons (Lucide-style inline SVGs) ───────────────────────────────────────
const Icon = {
  Star: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Utensils: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
  Trophy: () => (
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-coral to-brand-amber mb-4">
      <span className="text-4xl">🏆</span>
    </div>
  ),
  Share: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M12 16v-8M8 8l4-4 4 4"/></svg>,
  External: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>,
  X: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>,
  Copy: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Whatsapp: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15c-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-1.73-.9-2.87-1.62-4.01-3.67-.3-.53.31-.49.89-1.63.1-.18.05-.34-.03-.48-.07-.14-.67-1.62-.92-2.21s-.49-.5-.67-.51c-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.35-.27.29-1.04 1.02-1.04 2.49s1.06 2.89 1.2 3.09c.15.2 2.09 3.19 5.06 4.48 1.85.8 2.57.87 3.5.73.56-.08 1.76-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/><path d="M20.52 3.48A11.84 11.84 0 0012.05 0C5.47 0 .1 5.37.1 11.95c0 2.11.55 4.17 1.59 5.99L0 24l6.26-1.64c1.75.95 3.72 1.46 5.74 1.46h.01c6.57 0 11.94-5.35 11.95-11.93A11.85 11.85 0 0020.52 3.48zM12.05 21.79c-1.79 0-3.54-.48-5.07-1.39l-.36-.22-3.78.99 1.01-3.69-.24-.38A9.86 9.86 0 012.12 12c0-5.46 4.44-9.9 9.93-9.9A9.87 9.87 0 0121.95 12c0 5.47-4.44 9.9-9.9 9.9z"/></svg>,
  Twitter: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  Zap: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>,
  Crosshair: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>,
  Navigation: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  AlertTriangle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

// ─── VS Battle Card ─────────────────────────────────────────────────────────
interface VSCardProps {
  restaurant: Restaurant
  onClick: () => void
  isWinner?: boolean
  animating?: boolean
  side?: 'left' | 'right'
}

const VSCard = ({ restaurant, onClick, isWinner, animating, side }: VSCardProps) => {
  const stars = (restaurant.rating ?? 0).toFixed(1)
  const imgSrc = restaurant.image_url || PLACEHOLDER_IMG

  return (
    <button
      onClick={onClick}
      disabled={animating}
      className={`
        group relative w-full max-w-sm rounded-3xl overflow-hidden
        transition-all duration-300 text-left
        ${animating ? 'scale-95 opacity-40 pointer-events-none' : 'hover:scale-[1.03] active:scale-[0.97]'}
        ${isWinner ? 'ring-2 ring-brand-coral shadow-lg shadow-brand-coral/30' : ''}
        ${side === 'left' ? 'animate-slide-up' : side === 'right' ? 'animate-slide-up' : ''}
      `}
      style={{ animationDelay: side === 'right' ? '0.1s' : '0s' }}
    >
      {/* Image with overlay */}
      <div className="relative w-full aspect-[4/3] bg-brand-card overflow-hidden">
        <img
          src={imgSrc}
          alt={restaurant.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }}
        />
        <div className="food-overlay absolute inset-0" />

        {/* Rating badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-brand-amber px-2.5 py-1 rounded-full text-xs font-bold">
          <Icon.Star /> {stars}
        </div>

        {isWinner && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-brand-coral to-brand-amber text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ŞAMPİYON
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 bg-brand-card border-t border-white/5">
        <h3 className="text-lg font-bold text-brand-cream mb-1.5 truncate">{restaurant.name}</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted mb-2">
          {restaurant.cuisine && (
            <span className="flex items-center gap-1 bg-brand-coral/10 text-brand-coral-light px-2 py-0.5 rounded-full">
              <Icon.Utensils /> {restaurant.cuisine}
            </span>
          )}
          {restaurant.area && (
            <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
              <Icon.MapPin /> {restaurant.area}
            </span>
          )}
        </div>

        {/* Top 3 Products */}
        {restaurant.top3_products && restaurant.top3_products.length > 0 && (
          <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted font-semibold">Popüler</span>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.top3_products.slice(0, 3).map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-brand-amber/10 text-brand-amber px-2 py-0.5 rounded-full text-xs font-medium">
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

// ─── Loading Skeleton for VS Battle ─────────────────────────────────────────
const BattleLoadingSkeleton = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6">
    <div className="text-center space-y-3 w-full max-w-md">
      <div className="h-3 bg-white/10 rounded w-48 mx-auto animate-pulse" />
      <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
        <div className="h-full bg-white/10 rounded-full w-1/3 animate-pulse" />
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full max-w-4xl">
      <div className="w-full max-w-sm"><SkeletonCard /></div>
      <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse" />
      <div className="w-full max-w-sm"><SkeletonCard /></div>
    </div>
  </div>
)

// ─── Progress Bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const pct = total > 0 ? ((total - current) / (total - 1)) * 100 : 0
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-xs text-brand-muted mb-1.5">
        <span>Kalan: {current}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-coral to-brand-amber rounded-full transition-all duration-500 progress-glow"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Deeplinks ──────────────────────────────────────────────────────────────
const Deeplinks = ({ restaurant }: { restaurant: Restaurant }) => {
  const links = [
    { key: 'yemeksepeti', url: restaurant.yemeksepeti_link, label: 'Yemeksepeti', color: 'bg-red-500 hover:bg-red-600', emoji: '🔴' },
    { key: 'getir', url: restaurant.getir_link, label: 'Getir', color: 'bg-purple-500 hover:bg-purple-600', emoji: '💜' },
    { key: 'trendyol', url: restaurant.trendyol_link, label: 'Trendyol', color: 'bg-orange-500 hover:bg-orange-600', emoji: '🟠' },
    { key: 'gmaps', url: restaurant.google_maps_url, label: 'Google Maps', color: 'bg-blue-500 hover:bg-blue-600', emoji: '📍' },
    { key: 'website', url: restaurant.website, label: 'Website', color: 'bg-brand-elevated hover:bg-white/10', emoji: '🌐' },
  ].filter(l => l.url)

  if (!links.length) return null

  const handleDeeplinkClick = (platform: string) => {
    api.trackEvent('deeplink_click', { platform, restaurant_id: restaurant.id })
    // Track for points if user is logged in
    const token = safeGetItem('local', 'foodhunt_token')
    if (token) {
      authApi.trackDeeplinkOrder(token, {
        restaurant_id: restaurant.id,
        platform,
      }).catch(() => {}) // non-blocking
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <p className="text-center text-brand-muted text-xs uppercase tracking-wider font-semibold">Sipariş Ver</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {links.map(l => (
          <a
            key={l.key}
            href={l.url!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleDeeplinkClick(l.key)}
            className={`flex items-center gap-2 px-4 py-2.5 ${l.color} text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-lg`}
          >
            <span>{l.emoji}</span> {l.label}
          </a>
        ))}
      </div>
      {safeGetItem('local', 'foodhunt_token') && (
        <p className="text-center text-brand-amber text-xs">+50 puan kazanırsınız!</p>
      )}
    </div>
  )
}

// ─── Share Modal ────────────────────────────────────────────────────────────
const ShareModal = ({ isOpen, onClose, champion }: { isOpen: boolean; onClose: () => void; champion: Restaurant | null }) => {
  const [copied, setCopied] = useState(false)
  if (!isOpen || !champion) return null

  const shareText = `FoodHunt'ta şampiyonu seçtim: ${champion.name}! Sen de oyna`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://foodhunt.app'

  // Try native share first (iOS share sheet), fallback to manual options
  const handleNativeShare = async () => {
    const used = await nativeShare({
      title: 'FoodHunt Şampiyonu',
      text: shareText,
      url: shareUrl,
    })
    if (used) {
      hapticImpact('light')
      onClose()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
      setCopied(true)
      hapticImpact('light')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 safe-bottom" onClick={onClose}>
      <div className="bg-brand-card rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
        <h2 className="text-xl font-bold text-brand-cream mb-4">Paylaş</h2>
        <div className="space-y-2">
          {/* Native share button (iOS share sheet) */}
          <button onClick={handleNativeShare}
            className="w-full flex items-center gap-3 bg-brand-coral hover:bg-brand-coral-light text-white px-4 py-3 rounded-xl transition font-semibold active:scale-95">
            <Icon.Share /> Paylaş
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank')}
            className="w-full flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition font-semibold active:scale-95">
            <Icon.Whatsapp /> WhatsApp
          </button>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
            className="w-full flex items-center gap-3 bg-brand-surface hover:bg-brand-elevated text-white px-4 py-3 rounded-xl transition font-semibold active:scale-95 border border-white/10">
            <Icon.Twitter /> X (Twitter)
          </button>
          <button onClick={handleCopy}
            className="w-full flex items-center gap-3 bg-brand-surface hover:bg-brand-elevated text-white px-4 py-3 rounded-xl transition font-semibold active:scale-95 border border-white/10">
            <Icon.Copy /> {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="mt-16 py-6 text-center text-xs text-brand-muted space-y-3">
    <div className="flex flex-wrap justify-center gap-4">
      <a href="/kvkk" className="hover:text-brand-coral transition">KVKK</a>
      <a href="/kullanim" className="hover:text-brand-coral transition">Kullanım Şartları</a>
      <a href="/cerez" className="hover:text-brand-coral transition">Çerez Politikası</a>
    </div>
    <p className="text-brand-muted/50">&copy; 2026 FoodHunt</p>
  </footer>
)

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<'landing' | 'inspiration' | 'game' | 'results'>('landing')
  const [mode, setMode] = useState<'browse' | 'nearby'>('browse')
  const [area, setArea] = useState<string | null>(null)
  const [cuisine, setCuisine] = useState<string | null>(null)
  const [areas, setAreas] = useState<{ area: string; count: number }[]>([])
  const [cuisines, setCuisines] = useState<{ cuisine: string; count: number }[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [eliminated, setEliminated] = useState<Restaurant[]>([])
  const [inspiration, setInspiration] = useState<InspirationCard | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [nearbyMeta, setNearbyMeta] = useState<{ area_detected: string | null; google_count: number; seed_count: number } | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [serverDown, setServerDown] = useState(false)
  const [scheduledSlots, setScheduledSlots] = useState<TournamentSlot[]>([])
  const [currentSlot, setCurrentSlot] = useState<TournamentSlot | null>(null)
  const [tournamentInfo, setTournamentInfo] = useState<{ used: number; limit: number; remaining: number; can_play: boolean } | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const pickLockRef = useRef(false)

  // Geolocation
  const geo = useGeolocation(false) // Don't auto-request — let user tap "Nearby"

  const champion = useMemo(() => (restaurants.length === 1 ? restaurants[0] : null), [restaurants])
  const runnerUp = useMemo(() => (eliminated.length > 0 ? eliminated[eliminated.length - 1] : null), [eliminated])
  const thirdPlace = useMemo(() => (eliminated.length > 1 ? eliminated[eliminated.length - 2] : null), [eliminated])

  useEffect(() => {
    const controller = new AbortController()

    // Native iOS setup
    configureStatusBar()
    hideSplashScreen()

    // Health check
    fetch('/api/health', { signal: controller.signal })
      .then(r => { if (!r.ok) setServerDown(true) })
      .catch(e => { if (e.name !== 'AbortError') setServerDown(true) })

    // Check onboarding
    if (shouldShowOnboarding()) {
      setShowOnboarding(true)
    }

    api.trackEvent('page_view')
    api.getAreas().then(setAreas).catch(e => { if (e.name !== 'AbortError') setApiError('Bağlantı hatası. Tekrar deneyin.') })

    // Load freemium info
    const userToken = safeGetItem('local', 'foodhunt_token')
    if (userToken) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${userToken}` }, signal: controller.signal })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setTournamentInfo({
            used: data.daily_tournaments || 0,
            limit: data.daily_limit || 3,
            remaining: Math.max(0, (data.daily_limit || 3) - (data.daily_tournaments || 0)),
            can_play: data.can_play !== false,
          })
        })
        .catch(() => {})
    }

    // Load tournament slots
    const loadSlots = () => {
      api.getScheduledTournaments().then(slots => {
        setScheduledSlots(slots)
        setCurrentSlot(slots.find(s => s.is_active) || null)
      }).catch(() => {})
    }
    loadSlots()
    const slotInterval = setInterval(loadSlots, 60000)
    return () => { clearInterval(slotInterval); controller.abort() }
  }, [])

  useEffect(() => {
    if (!area) { setCuisines([]); return }
    api.getCuisines(area).then(setCuisines).catch(() => {})
  }, [area])

  // When nearby mode activated and position obtained, fetch nearby areas
  useEffect(() => {
    if (mode === 'nearby' && geo.position) {
      api.getNearbyAreas(geo.position.lat, geo.position.lng)
        .then(setAreas)
        .catch(() => {})
    }
  }, [mode, geo.position])

  const handleNearbyMode = useCallback(() => {
    setMode('nearby')
    geo.refresh()
  }, [geo])

  const handleBrowseMode = useCallback(() => {
    setMode('browse')
    api.getAreas().then(setAreas).catch(() => {})
    setArea(null)
    setCuisine(null)
    setNearbyMeta(null)
  }, [])

  const handleStartTournament = useCallback(async (count: 8 | 16) => {
    setLoading(true)
    setApiError(null)
    try {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      let data: Restaurant[]

      if (mode === 'nearby' && geo.position) {
        // Use nearby endpoint
        const result = await api.getNearby(
          geo.position.lat, geo.position.lng,
          3000, count,
          cuisine || undefined
        )
        data = result.restaurants
        setNearbyMeta(result.meta)
      } else {
        // Classic catalog
        data = await api.getCatalog(area || undefined, cuisine || undefined, count, abortRef.current.signal)
      }

      if (data.length < 2) {
        setApiError('Yeterli restoran yok. Filtreleri değiştirin.')
        setLoading(false)
        return
      }
      setRestaurants(data)
      setEliminated([])
      setTotalCount(data.length)
      try {
        const card = await api.getInspiration()
        if (card?.text) { setInspiration(card); setPhase('inspiration') }
        else setPhase('game')
      } catch { setPhase('game') }
      api.trackEvent('game_start', { area, cuisine, count, mode, ...(geo.position ? { lat: geo.position.lat, lng: geo.position.lng } : {}) })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setApiError('Bağlantı hatası. Tekrar deneyin.')
    } finally { setLoading(false) }
  }, [area, cuisine, mode, geo.position])

  const handlePick = useCallback((winner: Restaurant) => {
    if (pickLockRef.current) return
    pickLockRef.current = true
    hapticImpact('medium') // Dokunsal geri bildirim
    const loser = restaurants[0].id === winner.id ? restaurants[1] : restaurants[0]
    const remaining = restaurants.filter(r => r.id !== winner.id && r.id !== loser.id)
    api.trackEvent('choice_made', { winner_id: winner.id, loser_id: loser.id })
    setTimeout(() => {
      setEliminated(prev => [...prev, loser])
      const next = [winner, ...remaining]
      if (next.length === 1) {
        setRestaurants(next)
        setPhase('results')
        hapticNotification('success') // Şampiyon belirlendi!
        api.trackEvent('game_complete', { champion_id: winner.id })
        // Award points if user is logged in
        const token = safeGetItem('local', 'foodhunt_token')
        if (token) {
          authApi.trackTournamentComplete(token, { champion_id: winner.id, tournament_type: mode }).catch(() => {})
        }
      } else {
        setRestaurants(next)
      }
      pickLockRef.current = false
    }, 500)
  }, [restaurants])

  const handleRestart = useCallback(() => {
    setPhase('landing'); setArea(null); setCuisine(null)
    setRestaurants([]); setEliminated([]); setCuisines([])
    setNearbyMeta(null)
  }, [])

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="ambient-glow ambient-coral" style={{ top: '-100px', right: '-50px' }} />
      <div className="ambient-glow ambient-amber" style={{ bottom: '20%', left: '-80px' }} />

      {/* Onboarding */}
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      {/* Server down banner */}
      {serverDown && (
        <div className="sticky top-0 z-50 bg-brand-amber/10 border-b border-brand-amber/30 text-brand-amber px-4 py-3 text-center text-sm backdrop-blur-md flex items-center justify-center gap-2">
          <Icon.AlertTriangle />
          Sunucu bakımda. Lütfen daha sonra tekrar deneyin.
        </div>
      )}

      {/* Error Banner */}
      {apiError && !serverDown && (
        <div className="sticky top-0 z-50 bg-red-500/10 border-b border-red-500/30 text-red-300 px-4 py-3 text-center text-sm backdrop-blur-md">
          {apiError}
          <button onClick={() => setApiError(null)} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-300 hover:text-white">
            <Icon.X />
          </button>
        </div>
      )}

      {/* ═══ LANDING ═══ */}
      {phase === 'landing' && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
          {/* Profile / Login button */}
          <div className="absolute top-4 right-4 z-10">
            {safeGetItem('local', 'foodhunt_token') ? (
              <a href="/profil" className="flex items-center gap-2 bg-brand-card border border-white/10 px-4 py-2 rounded-full text-sm font-semibold text-brand-cream hover:border-brand-coral transition">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-coral to-brand-amber flex items-center justify-center text-[10px] font-bold text-white">
                  {(() => { try { const u = JSON.parse(safeGetItem('local', 'foodhunt_user') || '{}'); return u.name?.charAt(0)?.toUpperCase() || '?' } catch { return '?' } })()}
                </span>
                Profil
              </a>
            ) : (
              <a href="/giris" className="flex items-center gap-2 bg-gradient-to-r from-brand-coral to-brand-amber px-4 py-2 rounded-full text-sm font-bold text-white hover:opacity-90 transition active:scale-95">
                Giriş Yap
              </a>
            )}
          </div>

          <div className="text-center max-w-md animate-fade-in space-y-6">
            {/* Hero */}
            <div className="space-y-3">
              {currentSlot ? (
                <>
                  <div className="text-6xl animate-float">{currentSlot.icon}</div>
                  <h1 className="font-display text-4xl sm:text-5xl font-extrabold">
                    <span className="text-gradient-warm">{currentSlot.slot}</span>
                  </h1>
                  <p className="text-brand-muted text-sm">Şimdi aktif! Turnuvaya katıl.</p>
                </>
              ) : (
                <>
                  <div className="text-6xl animate-float">🍽️</div>
                  <h1 className="font-display text-5xl sm:text-6xl font-extrabold">
                    <span className="text-gradient-warm">Food</span>
                    <span className="text-brand-cream">Hunt</span>
                  </h1>
                </>
              )}
              <p className="text-brand-muted text-base leading-relaxed">
                Favorin restoranı turnuva usulü seç.
                <br />
                <span className="text-brand-coral">Tap. Seç. Kazan.</span>
              </p>
            </div>

            {/* Tournament Slots */}
            {scheduledSlots.length > 0 && (
              <div className="grid grid-cols-2 gap-2 w-full">
                {scheduledSlots.map(slot => (
                  <div key={slot.slot} className={`p-2.5 rounded-xl border text-center transition-all ${slot.is_active ? 'bg-brand-coral/15 border-brand-coral/50' : 'bg-brand-surface/50 border-white/5'}`}>
                    <div className="text-xl mb-0.5">{slot.icon}</div>
                    <p className="text-xs font-semibold text-brand-cream">{slot.slot}</p>
                    <p className="text-[10px] text-brand-muted">{slot.start} - {slot.end}</p>
                    {slot.is_active && <span className="text-[10px] text-brand-coral font-bold">AKTIF</span>}
                    {!slot.is_active && slot.starts_in_minutes > 0 && slot.starts_in_minutes < 120 && (
                      <span className="text-[10px] text-brand-amber">{slot.starts_in_minutes} dk</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Mode Toggle */}
            <div className="flex bg-brand-surface rounded-2xl p-1 border border-white/5">
              <button
                onClick={handleBrowseMode}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === 'browse'
                    ? 'bg-brand-coral text-white shadow-lg shadow-brand-coral/20'
                    : 'text-brand-muted hover:text-brand-cream'
                }`}
              >
                <Icon.MapPin /> Bölge Seç
              </button>
              <button
                onClick={handleNearbyMode}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === 'nearby'
                    ? 'bg-brand-coral text-white shadow-lg shadow-brand-coral/20'
                    : 'text-brand-muted hover:text-brand-cream'
                }`}
              >
                <Icon.Crosshair /> Yakınımdakiler
              </button>
            </div>

            {/* Nearby Status */}
            {mode === 'nearby' && (
              <div className="text-center space-y-2">
                {geo.loading && (
                  <p className="text-brand-amber text-sm animate-pulse">Konumunuz alınıyor...</p>
                )}
                {geo.position && !geo.loading && (
                  <div className="flex items-center justify-center gap-2 text-brand-fresh text-sm">
                    <Icon.Navigation />
                    <span>
                      {nearbyMeta?.area_detected
                        ? `${nearbyMeta.area_detected} bölgesi algılandı`
                        : 'Konum algılandı'}
                    </span>
                  </div>
                )}
                {geo.error && !geo.position && (
                  <p className="text-red-400 text-xs">{geo.error} — varsayılan konum kullanılacak</p>
                )}
                {geo.permissionDenied && (
                  <p className="text-brand-muted text-xs">
                    Konum izni reddedildi. İstanbul merkez kullanılacak.
                  </p>
                )}
              </div>
            )}

            {/* Filters */}
            <div className="space-y-3">
              {mode === 'browse' && (
                <select
                  value={area || ''}
                  onChange={e => setArea(e.target.value || null)}
                  className="select-field"
                >
                  <option value="">Tüm Bölgeler</option>
                  {areas.map(a => <option key={a.area} value={a.area}>{a.area} ({a.count})</option>)}
                </select>
              )}

              {(mode === 'browse' ? cuisines.length > 0 : true) && (
                <select
                  value={cuisine || ''}
                  onChange={e => setCuisine(e.target.value || null)}
                  className="select-field"
                >
                  <option value="">Tüm Mutfaklar</option>
                  {mode === 'browse'
                    ? cuisines.map(c => <option key={c.cuisine} value={c.cuisine}>{c.cuisine} ({c.count})</option>)
                    : ['Türk Mutfağı', 'Kebap', 'Pizza', 'Burger', 'Suşi', 'Deniz Ürünleri', 'Kafe', 'Fast Food', 'İtalyan', 'Vejetaryen'].map(c =>
                        <option key={c} value={c}>{c}</option>
                      )
                  }
                </select>
              )}
            </div>

            {/* Freemium Info */}
            {tournamentInfo && (
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-brand-amber">
                  {tournamentInfo.remaining} / {tournamentInfo.limit} turnuva
                </p>
                <p className="text-xs text-brand-muted">
                  {tournamentInfo.can_play
                    ? `Bugün ${tournamentInfo.remaining} turnuva hakkınız kaldı`
                    : 'Günlük limit tamamlandı'}
                </p>
              </div>
            )}

            {/* Start Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleStartTournament(8)}
                disabled={loading || serverDown || (tournamentInfo !== null && !tournamentInfo.can_play)}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <Icon.Zap /> {loading ? 'Yükleniyor...' : 'Hızlı (8)'}
              </button>
              <button
                onClick={() => handleStartTournament(16)}
                disabled={loading || serverDown || (tournamentInfo !== null && !tournamentInfo.can_play)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? 'Yükleniyor...' : 'Klasik (16)'}
              </button>
            </div>

            {/* Premium Upgrade Prompt */}
            {tournamentInfo && !tournamentInfo.can_play && (
              <div className="p-4 bg-brand-amber/10 border border-brand-amber/30 rounded-xl text-center space-y-2">
                <p className="text-brand-amber font-semibold text-sm">Unlimited turnuva oynamak ister misin?</p>
                <p className="text-brand-muted text-xs">Premium ile sınır olmadan oyna!</p>
              </div>
            )}

            {/* Social Proof */}
            <SocialProof />
          </div>
          <Footer />
        </div>
      )}

      {/* ═══ INSPIRATION ═══ */}
      {phase === 'inspiration' && inspiration && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-sm text-center animate-bounce-in space-y-6">
            <div className="text-8xl">{inspiration.emoji}</div>
            <div>
              <p className="text-brand-muted text-xs uppercase tracking-widest mb-2">Bugünün İlham Kaynağı</p>
              <h2 className="font-display text-2xl font-bold text-brand-cream">{inspiration.text}</h2>
            </div>
            <button onClick={() => setPhase('game')} className="btn-primary w-full">
              Turnuvaya Başla
            </button>
          </div>
        </div>
      )}

      {/* ═══ GAME (Loading) ═══ */}
      {phase === 'game' && loading && <BattleLoadingSkeleton />}

      {/* ═══ GAME (Empty State) ═══ */}
      {phase === 'game' && !loading && restaurants.length < 2 && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <NoRestaurantsFound onReset={handleRestart} />
        </div>
      )}

      {/* ═══ GAME ═══ */}
      {phase === 'game' && !loading && restaurants.length >= 2 && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6 no-select safe-top">
          {/* Header */}
          <div className="text-center space-y-3 w-full max-w-md">
            <p className="text-brand-muted text-xs uppercase tracking-widest">Hangisini tercih edersin?</p>
            <ProgressBar current={restaurants.length} total={totalCount} />
          </div>

          {/* Battle */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full max-w-4xl">
            <VSCard
              restaurant={restaurants[0]}
              onClick={() => handlePick(restaurants[0])}
              animating={pickLockRef.current}
              side="left"
            />

            <div className="vs-badge flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-coral to-brand-amber text-brand-dark font-extrabold text-lg shadow-lg shadow-brand-coral/30">
              VS
            </div>

            <VSCard
              restaurant={restaurants[1]}
              onClick={() => handlePick(restaurants[1])}
              animating={pickLockRef.current}
              side="right"
            />
          </div>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {phase === 'results' && champion && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center max-w-lg animate-bounce-in space-y-6">
            <Icon.Trophy />
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-gradient-warm">
              Şampiyonun!
            </h2>

            <VSCard restaurant={champion} onClick={() => {}} isWinner />

            {/* Podium */}
            {(runnerUp || thirdPlace) && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {runnerUp && (
                  <div className="bg-brand-card border border-white/5 p-4 rounded-2xl text-left">
                    <p className="text-brand-muted text-xs mb-1">2. Sırada</p>
                    <h3 className="font-bold text-brand-cream text-sm">{runnerUp.name}</h3>
                    {runnerUp.cuisine && <p className="text-brand-muted text-xs mt-1">{runnerUp.cuisine}</p>}
                  </div>
                )}
                {thirdPlace && (
                  <div className="bg-brand-card border border-white/5 p-4 rounded-2xl text-left">
                    <p className="text-brand-muted text-xs mb-1">3. Sırada</p>
                    <h3 className="font-bold text-brand-cream text-sm">{thirdPlace.name}</h3>
                    {thirdPlace.cuisine && <p className="text-brand-muted text-xs mt-1">{thirdPlace.cuisine}</p>}
                  </div>
                )}
              </div>
            )}

            <Deeplinks restaurant={champion} />

            {/* Points CTA for non-logged-in users */}
            {!safeGetItem('local', 'foodhunt_token') && (
              <div className="bg-brand-amber/10 border border-brand-amber/20 rounded-2xl p-4 mt-4">
                <p className="text-brand-amber text-sm font-semibold">Puan Kazan!</p>
                <p className="text-brand-muted text-xs mt-1">Giriş yaparak turnuva ve sipariş puanları kazanın.</p>
                <a href="/giris" className="inline-block mt-3 bg-gradient-to-r from-brand-coral to-brand-amber text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition">
                  Giriş Yap / Kayıt Ol
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShareModalOpen(true); api.trackEvent('share_click') }}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                <Icon.Share /> Paylaş
              </button>
              <button onClick={handleRestart}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                <Icon.Refresh /> Tekrar
              </button>
            </div>
          </div>
          <Footer />
        </div>
      )}

      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} champion={champion} />
      <CookieConsent />
      <IOSInstallBanner />
    </div>
  )
}
