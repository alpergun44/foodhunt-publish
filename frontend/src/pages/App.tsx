/**
 * FoodHunt — Ana sayfa orkestrasyonu
 * Phase router (landing / inspiration / game / results) + state
 * Tüm büyük UI parçaları features/ altındaki bileşenlere taşındı.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { api, authApi, Restaurant, InspirationCard, TournamentSlot, PublicRegion, safeGetItem } from '../api'
import { useGeolocation } from '../hooks/useGeolocation'
import { hapticImpact, hapticNotification, configureStatusBar, hideSplashScreen } from '../utils/native'
import { playPickSound, playVictorySound, playRoundCompleteSound, isSoundEnabled, toggleSound } from '../utils/sound'

import { SocialProof }      from '../components/ui/SocialProof'
import { Logo, LogoText }   from '../components/ui/Logo'
import { CookieConsent }    from '../components/ui/CookieConsent'
import { Onboarding, shouldShowOnboarding } from '../components/ui/Onboarding'
import { NoRestaurantsFound } from '../components/ui/EmptyState'
import { IOSInstallBanner } from '../components/ui/IOSInstallBanner'
import { ThemeToggle }      from '../components/ui/ThemeToggle'
import { Icon }             from '../components/ui/Icons'
import { Footer }           from '../components/ui/Footer'

import { VSCard }          from '../features/tournament/VSCard'
import { RoundStepper }    from '../features/tournament/RoundStepper'
import { Confetti }        from '../features/tournament/Confetti'
import { BattleLoadingSkeleton } from '../features/tournament/BattleLoadingSkeleton'
import { MEAL_TYPES, getRoundName, createPairs } from '../features/tournament/constants'

import { Deeplinks }   from '../features/share/Deeplinks'
import { ShareModal }  from '../features/share/ShareModal'

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // ── Phase + filter state
  const [phase, setPhase]       = useState<'landing' | 'inspiration' | 'game' | 'results'>('landing')
  const [mode, setMode]         = useState<'browse' | 'nearby'>('browse')
  const [area, setArea]         = useState<string | null>(null)
  const [cuisine, setCuisine]   = useState<string | null>(null)
  const [mealType, setMealType] = useState<string>('all')

  // ── Data lists
  const [areas, setAreas]       = useState<{ area: string; count: number }[]>([])
  const [cuisines, setCuisines] = useState<{ cuisine: string; count: number }[]>([])
  const [regions, setRegions]   = useState<PublicRegion[]>([])
  const [selectedIlce, setSelectedIlce] = useState<string | null>(null)

  // ── Tournament state
  const [restaurants, setRestaurants]   = useState<Restaurant[]>([])
  const [eliminated, setEliminated]     = useState<Restaurant[]>([])
  const [roundMatches, setRoundMatches] = useState<Restaurant[][]>([])
  const [matchIndex, setMatchIndex]     = useState(0)
  const [roundIndex, setRoundIndex]     = useState(0)
  const [roundWinners, setRoundWinners] = useState<Restaurant[]>([])
  const [totalRounds, setTotalRounds]   = useState(0)
  const [totalCount, setTotalCount]     = useState(0)
  const [roundTransition, setRoundTransition] = useState(false)

  // ── UI state
  const [inspiration, setInspiration]   = useState<InspirationCard | null>(null)
  const [apiError, setApiError]         = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [nearbyMeta, setNearbyMeta]     = useState<{ area_detected: string | null; google_count: number; seed_count: number } | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [serverDown, setServerDown]     = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundOn, setSoundOn]           = useState(isSoundEnabled())
  const [scheduledSlots, setScheduledSlots] = useState<TournamentSlot[]>([])
  const [currentSlot, setCurrentSlot]   = useState<TournamentSlot | null>(null)
  const [tournamentInfo, setTournamentInfo] = useState<{ used: number; limit: number; remaining: number; can_play: boolean } | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const pickLockRef = useRef(false)

  // Geolocation — auto-fetch yapma, kullanıcı "Yakındakiler"e basınca
  const geo = useGeolocation(false)

  // Derived state
  const champion   = useMemo(() => (restaurants.length === 1 ? restaurants[0] : null), [restaurants])
  const runnerUp   = useMemo(() => (eliminated.length > 0 ? eliminated[eliminated.length - 1] : null), [eliminated])
  const thirdPlace = useMemo(() => (eliminated.length > 1 ? eliminated[eliminated.length - 2] : null), [eliminated])

  // ─── Mount: native iOS, health check, onboarding, ilk data ────────────
  useEffect(() => {
    const controller = new AbortController()

    configureStatusBar()
    hideSplashScreen()

    fetch('/api/health', { signal: controller.signal })
      .then(r => { if (!r.ok) setServerDown(true) })
      .catch(e => { if (e.name !== 'AbortError') setServerDown(true) })

    if (shouldShowOnboarding()) setShowOnboarding(true)

    api.trackEvent('page_view')
    api.getAreas().then(setAreas).catch(e => { if (e.name !== 'AbortError') setApiError('Bağlantı hatası. Tekrar deneyin.') })
    api.getRegions().then(setRegions).catch(() => {})

    // Freemium info
    const userToken = safeGetItem('local', 'foodhunt_token')
    if (userToken) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${userToken}` }, signal: controller.signal })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setTournamentInfo({
            used:      data.daily_tournaments || 0,
            limit:     data.daily_limit       || 3,
            remaining: Math.max(0, (data.daily_limit || 3) - (data.daily_tournaments || 0)),
            can_play:  data.can_play !== false,
          })
        })
        .catch(() => {})
    }

    // Scheduled tournament slots — her dakika yenile
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

  // ─── Bölge seçildiğinde mutfakları yükle ───────────────────────────────
  useEffect(() => {
    if (!area) { setCuisines([]); return }
    api.getCuisines(area).then(setCuisines).catch(() => {})
  }, [area])

  // ─── Yakındakiler modu: konum gelince bölgeleri çek ────────────────────
  useEffect(() => {
    if (mode === 'nearby' && geo.position) {
      api.getNearbyAreas(geo.position.lat, geo.position.lng).then(setAreas).catch(() => {})
    }
  }, [mode, geo.position])

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleNearbyMode = useCallback(() => { setMode('nearby'); geo.refresh() }, [geo])

  const handleBrowseMode = useCallback(() => {
    setMode('browse')
    api.getAreas().then(setAreas).catch(() => {})
    setArea(null); setCuisine(null); setSelectedIlce(null); setNearbyMeta(null)
  }, [])

  const handleIlceChange = useCallback((ilce: string | null) => {
    setSelectedIlce(ilce); setArea(ilce); setCuisine(null)
  }, [])

  const handleStartTournament = useCallback(async (count: 8 | 16 | 32) => {
    setLoading(true); setApiError(null)
    try {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      let data: Restaurant[]
      if (mode === 'nearby' && geo.position) {
        const result = await api.getNearby(
          geo.position.lat, geo.position.lng, 3000, count,
          cuisine || undefined, mealType !== 'all' ? mealType : undefined,
        )
        data = result.restaurants
        setNearbyMeta(result.meta)
      } else {
        data = await api.getCatalog(area || undefined, cuisine || undefined, count, abortRef.current.signal, mealType !== 'all' ? mealType : undefined)
      }

      if (data.length < 2) {
        setApiError('Yeterli restoran yok. Filtreleri değiştir.')
        setLoading(false)
        return
      }

      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setRestaurants(shuffled); setEliminated([]); setTotalCount(shuffled.length)
      setRoundMatches(createPairs(shuffled))
      setMatchIndex(0); setRoundIndex(0); setRoundWinners([])
      setTotalRounds(Math.log2(shuffled.length))

      try {
        const card = await api.getInspiration()
        if (card?.text) { setInspiration(card); setPhase('inspiration') }
        else setPhase('game')
      } catch { setPhase('game') }
      api.trackEvent('game_start', { area, cuisine, count, mode, mealType, ...(geo.position ? { lat: geo.position.lat, lng: geo.position.lng } : {}) })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setApiError('Bağlantı hatası. Tekrar deneyin.')
    } finally { setLoading(false) }
  }, [area, cuisine, mode, geo.position, mealType])

  const handlePick = useCallback((winner: Restaurant) => {
    if (pickLockRef.current) return
    pickLockRef.current = true
    hapticImpact('medium')
    playPickSound()

    const currentPair = roundMatches[matchIndex]
    const loser = currentPair[0].id === winner.id ? currentPair[1] : currentPair[0]
    const newWinners = [...roundWinners, winner]
    setEliminated(prev => [...prev, loser])

    if (matchIndex + 1 >= roundMatches.length) {
      // Round complete
      if (newWinners.length === 1) {
        // Tournament over!
        setRestaurants(newWinners)
        setPhase('results')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
        hapticNotification('success')
        playVictorySound()
        api.trackEvent('game_complete', { champion: winner.name, champion_id: winner.id, total: totalCount })
        const token = safeGetItem('local', 'foodhunt_token')
        if (token) authApi.trackTournamentComplete(token, { champion_id: winner.id }).catch(() => {})
        pickLockRef.current = false
        return
      }

      // Sonraki tura geç
      setRoundTransition(true)
      setRoundWinners(newWinners)
      playRoundCompleteSound()

      setTimeout(() => {
        setRoundMatches(createPairs(newWinners))
        setMatchIndex(0)
        setRoundIndex(prev => prev + 1)
        setRoundWinners([])
        setRestaurants(newWinners)
        setRoundTransition(false)
        pickLockRef.current = false
      }, 700)
    } else {
      setRoundWinners(newWinners)
      setTimeout(() => { setMatchIndex(prev => prev + 1); pickLockRef.current = false }, 250)
    }

    api.trackEvent('choice_made', { winner: winner.name, loser: loser.name, round: roundIndex })
  }, [roundMatches, matchIndex, roundWinners, roundIndex, totalCount])

  const handleRestart = useCallback(() => {
    setPhase('landing')
    setArea(null); setCuisine(null); setSelectedIlce(null); setMealType('all')
    setRestaurants([]); setEliminated([]); setCuisines([])
    setNearbyMeta(null)
    setRoundMatches([]); setMatchIndex(0); setRoundIndex(0); setRoundWinners([])
    setTotalRounds(0); setRoundTransition(false); setShowConfetti(false)
  }, [])

  // ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream relative">
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      {/* Server down banner */}
      {serverDown && (
        <div className="sticky top-0 z-50 bg-brand-elevated border-b border-brand-line text-brand-cream px-4 py-2.5 text-center text-sm backdrop-blur flex items-center justify-center gap-2">
          <Icon.Alert /> Sunucu bakımda. Lütfen daha sonra tekrar dene.
        </div>
      )}

      {/* API error banner */}
      {apiError && !serverDown && (
        <div className="sticky top-0 z-50 bg-brand-elevated border-b border-brand-line text-brand-cream px-4 py-2.5 text-center text-sm backdrop-blur relative">
          {apiError}
          <button onClick={() => setApiError(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-cream">
            <Icon.X />
          </button>
        </div>
      )}

      {/* ═══ LANDING ═══ */}
      {phase === 'landing' && (
        <LandingScreen
          soundOn={soundOn}
          toggleSoundClick={() => setSoundOn(toggleSound())}
          mode={mode}
          handleBrowseMode={handleBrowseMode}
          handleNearbyMode={handleNearbyMode}
          geo={geo}
          nearbyMeta={nearbyMeta}
          regions={regions}
          areas={areas}
          cuisines={cuisines}
          selectedIlce={selectedIlce}
          handleIlceChange={handleIlceChange}
          cuisine={cuisine}
          setCuisine={setCuisine}
          mealType={mealType}
          setMealType={setMealType}
          currentSlot={currentSlot}
          tournamentInfo={tournamentInfo}
          loading={loading}
          serverDown={serverDown}
          onStart={handleStartTournament}
        />
      )}

      {/* ═══ INSPIRATION ═══ */}
      {phase === 'inspiration' && inspiration && (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-sm text-center animate-fade-in space-y-5">
            <div className="text-6xl">{inspiration.emoji}</div>
            <div>
              <p className="text-brand-muted text-xs uppercase tracking-widest mb-1.5">Bugünün ilham kaynağı</p>
              <h2 className="font-sans text-xl font-semibold text-brand-cream tracking-tight">{inspiration.text}</h2>
            </div>
            <button onClick={() => setPhase('game')} className="btn-primary w-full">
              Turnuvaya başla
            </button>
          </div>
        </div>
      )}

      {/* ═══ GAME (Loading) ═══ */}
      {phase === 'game' && loading && <BattleLoadingSkeleton />}

      {/* ═══ GAME (Empty) ═══ */}
      {phase === 'game' && !loading && restaurants.length < 2 && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <NoRestaurantsFound onReset={handleRestart} />
        </div>
      )}

      {/* ═══ GAME ═══ */}
      {phase === 'game' && !loading && roundMatches.length > 0 && roundMatches[matchIndex] && !roundTransition && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-3 no-select safe-top">
          <RoundStepper
            totalRounds={totalRounds}
            currentRound={roundIndex}
            totalSize={totalCount}
            roundMatches={roundMatches}
            matchIndex={matchIndex}
          />

          <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted font-medium">
            {getRoundName(roundMatches.length * 2, totalCount)}
          </p>
          <p className="text-sm text-brand-cream font-medium -mt-1 mb-1.5">Hangisini tercih edersin?</p>

          <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-center w-full max-w-4xl">
            <VSCard
              restaurant={roundMatches[matchIndex][0]}
              onClick={() => handlePick(roundMatches[matchIndex][0])}
              animating={pickLockRef.current}
              side="left"
            />
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-surface border border-brand-line text-brand-muted font-medium text-xs">
              VS
            </div>
            <VSCard
              restaurant={roundMatches[matchIndex][1]}
              onClick={() => handlePick(roundMatches[matchIndex][1])}
              animating={pickLockRef.current}
              side="right"
            />
          </div>
        </div>
      )}

      {/* ═══ GAME (Round Transition) ═══ */}
      {phase === 'game' && !loading && roundTransition && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="text-4xl mb-3">→</div>
          <h2 className="text-lg font-semibold text-brand-cream tracking-tight">Tur tamamlandı</h2>
          <p className="text-brand-muted text-sm mt-1">{getRoundName(roundWinners.length, totalCount)} turuna geçiliyor…</p>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {phase === 'results' && champion && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          {showConfetti && <Confetti />}
          <div className="text-center max-w-lg animate-fade-in space-y-5">
            <Icon.Trophy />
            <h2 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight">Şampiyonun</h2>

            <VSCard restaurant={champion} onClick={() => {}} isWinner />

            {/* 2. ve 3. sıra */}
            {(runnerUp || thirdPlace) && (
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {runnerUp && (
                  <div className="bg-brand-surface border border-brand-line p-3.5 rounded-xl text-left">
                    <p className="text-brand-muted text-xs mb-0.5">2. sırada</p>
                    <h3 className="font-medium text-brand-cream text-sm tracking-tight">{runnerUp.name}</h3>
                    {runnerUp.cuisine && <p className="text-brand-muted text-xs mt-0.5">{runnerUp.cuisine}</p>}
                  </div>
                )}
                {thirdPlace && (
                  <div className="bg-brand-surface border border-brand-line p-3.5 rounded-xl text-left">
                    <p className="text-brand-muted text-xs mb-0.5">3. sırada</p>
                    <h3 className="font-medium text-brand-cream text-sm tracking-tight">{thirdPlace.name}</h3>
                    {thirdPlace.cuisine && <p className="text-brand-muted text-xs mt-0.5">{thirdPlace.cuisine}</p>}
                  </div>
                )}
              </div>
            )}

            <Deeplinks restaurant={champion} />

            {/* CTA — misafir kullanıcılar için */}
            {!safeGetItem('local', 'foodhunt_token') && (
              <div className="bg-brand-surface border border-brand-line rounded-xl p-3.5 mt-3 flex items-center gap-3">
                <span className="text-xl">✨</span>
                <div className="flex-1 text-left">
                  <p className="text-brand-cream text-sm font-medium">Turnuva geçmişini kaydet</p>
                  <p className="text-brand-muted text-xs mt-0.5">Favorilerini ve puanlarını takip et</p>
                </div>
                <a href="/giris" className="text-xs font-medium px-3 py-1.5 rounded-md border border-brand-line text-brand-cream hover:bg-brand-elevated transition-colors">
                  Giriş
                </a>
              </div>
            )}

            {/* Aksiyonlar */}
            <div className="flex gap-2.5 pt-1">
              <button onClick={() => { setShareModalOpen(true); api.trackEvent('share_click') }}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                <Icon.Share /> Paylaş
              </button>
              <button onClick={handleRestart}
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2">
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

// ─── Landing Screen (alt bileşen, App içine alındı çünkü çok prop alıyor) ────
interface LandingProps {
  soundOn: boolean
  toggleSoundClick: () => void
  mode: 'browse' | 'nearby'
  handleBrowseMode: () => void
  handleNearbyMode: () => void
  geo: ReturnType<typeof useGeolocation>
  nearbyMeta: { area_detected: string | null; google_count: number; seed_count: number } | null
  regions: PublicRegion[]
  areas: { area: string; count: number }[]
  cuisines: { cuisine: string; count: number }[]
  selectedIlce: string | null
  handleIlceChange: (ilce: string | null) => void
  cuisine: string | null
  setCuisine: (c: string | null) => void
  mealType: string
  setMealType: (m: string) => void
  currentSlot: TournamentSlot | null
  tournamentInfo: { used: number; limit: number; remaining: number; can_play: boolean } | null
  loading: boolean
  serverDown: boolean
  onStart: (count: 8 | 16 | 32) => void
}

function LandingScreen(p: LandingProps) {
  const userName = (() => {
    try { return JSON.parse(safeGetItem('local', 'foodhunt_user') || '{}').name?.charAt(0)?.toUpperCase() || '?' }
    catch { return '?' }
  })()

  return (
    <div className="min-h-screen relative">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2 safe-top">
        <button
          onClick={p.toggleSoundClick}
          className="w-9 h-9 rounded-lg flex items-center justify-center border border-brand-line text-brand-muted hover:text-brand-cream transition-colors"
          aria-label={p.soundOn ? 'Sesi kapat' : 'Sesi aç'}
        >
          {p.soundOn ? '🔊' : '🔇'}
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {safeGetItem('local', 'foodhunt_token') ? (
            <a href="/profil" className="inline-flex items-center gap-2 bg-brand-surface border border-brand-line pl-1.5 pr-3 py-1 rounded-full text-sm font-medium text-brand-cream hover:border-brand-muted/40 transition-colors">
              <span className="w-6 h-6 rounded-full bg-brand-elevated border border-brand-line flex items-center justify-center text-[10px] font-medium">
                {userName}
              </span>
              Profil
            </a>
          ) : (
            <a href="/giris" className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-brand-cream border border-brand-line hover:bg-brand-elevated transition-colors">
              Giriş yap
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pt-6 pb-5 text-center">
        <Logo size={56} className="mb-4 text-brand-cream" />
        {p.currentSlot ? (
          <>
            <h1 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight">
              {p.currentSlot.slot}
            </h1>
            <div className="flex items-center gap-2 mt-2 mb-2">
              <span className="text-base">{p.currentSlot.icon}</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-brand-elevated text-brand-fresh px-2 py-0.5 rounded-md font-medium uppercase tracking-wider border border-brand-line">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-fresh animate-pulse" /> Canlı
              </span>
              <span className="text-xs text-brand-muted tabular-nums">{p.currentSlot.start} – {p.currentSlot.end}</span>
            </div>
          </>
        ) : (
          <LogoText className="text-3xl sm:text-4xl mb-1" />
        )}
        <p className="text-brand-muted text-sm max-w-[280px] leading-relaxed mt-1">
          Favorin restoranı turnuva usulü seç
        </p>
      </section>

      {/* Main card */}
      <section className="px-5 pb-8">
        <div className="max-w-md mx-auto card">

          {/* Mode toggle */}
          <div className="p-3 pb-0">
            <div className="flex bg-brand-elevated border border-brand-line rounded-xl p-1">
              <button
                onClick={p.handleBrowseMode}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  p.mode === 'browse' ? 'bg-brand-surface text-brand-cream border border-brand-line' : 'text-brand-muted hover:text-brand-cream'
                }`}
              >
                <Icon.MapPin /> Bölge seç
              </button>
              <button
                onClick={p.handleNearbyMode}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  p.mode === 'nearby' ? 'bg-brand-surface text-brand-cream border border-brand-line' : 'text-brand-muted hover:text-brand-cream'
                }`}
              >
                <Icon.Crosshair /> Yakınımdakiler
              </button>
            </div>
          </div>

          {/* Nearby status */}
          {p.mode === 'nearby' && (
            <div className="px-4 pt-3 text-center">
              {p.geo.loading && <p className="text-brand-cream text-sm animate-pulse">Konum alınıyor…</p>}
              {p.geo.position && !p.geo.loading && (
                <span className="inline-flex items-center gap-1.5 text-brand-fresh text-xs bg-brand-elevated border border-brand-line px-2.5 py-1 rounded-md">
                  <Icon.Navigation />
                  {p.nearbyMeta?.area_detected ? p.nearbyMeta.area_detected : 'Konum algılandı'}
                </span>
              )}
              {p.geo.error && !p.geo.position && <p className="text-brand-cream text-xs">{p.geo.error}</p>}
              {p.geo.permissionDenied && <p className="text-brand-muted text-xs">Varsayılan konum kullanılacak</p>}
            </div>
          )}

          {/* Filters */}
          <div className="p-4 space-y-2.5">
            {p.mode === 'browse' && (
              <select
                value={p.selectedIlce || ''}
                onChange={e => p.handleIlceChange(e.target.value || null)}
                className="select-field"
              >
                <option value="">İlçe seçin</option>
                {p.regions.length > 0
                  ? p.regions.map(r => {
                      const ad = p.areas.find(a => a.area === r.ilce)
                      return <option key={r.ilce} value={r.ilce}>{r.ilce}{ad ? ` (${ad.count})` : ''}</option>
                    })
                  : p.areas.map(a => <option key={a.area} value={a.area}>{a.area} ({a.count})</option>)
                }
              </select>
            )}

            {(p.mode === 'browse' ? p.cuisines.length > 0 : true) && (
              <select
                value={p.cuisine || ''}
                onChange={e => p.setCuisine(e.target.value || null)}
                className="select-field"
              >
                <option value="">Tüm mutfaklar</option>
                {p.mode === 'browse'
                  ? p.cuisines.map(c => <option key={c.cuisine} value={c.cuisine}>{c.cuisine} ({c.count})</option>)
                  : ['Türk Mutfağı', 'Kebap', 'Pizza', 'Burger', 'Suşi', 'Deniz Ürünleri', 'Kafe', 'Fast Food', 'İtalyan', 'Vejetaryen'].map(c =>
                      <option key={c} value={c}>{c}</option>
                    )
                }
              </select>
            )}
          </div>

          <div className="h-px bg-brand-line mx-4" />

          {/* Meal types */}
          <div className="p-4">
            <p className="text-[11px] text-brand-muted uppercase tracking-widest font-medium mb-2.5">Ne yemek istiyorsun</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {MEAL_TYPES.map(m => (
                <button
                  key={m.id}
                  onClick={() => p.setMealType(m.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                    p.mealType === m.id
                      ? 'bg-brand-cream text-brand-dark'
                      : 'bg-brand-elevated text-brand-muted hover:text-brand-cream border border-brand-line'
                  }`}
                >
                  <span className="text-sm">{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-brand-line mx-4" />

          {/* Tournament size buttons */}
          <div className="p-4 space-y-2">
            {p.tournamentInfo && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-brand-muted">Günlük turnuva</span>
                <span className="text-xs font-medium text-brand-cream tabular-nums">{p.tournamentInfo.remaining}/{p.tournamentInfo.limit}</span>
              </div>
            )}

            <button
              onClick={() => p.onStart(8)}
              disabled={p.loading || p.serverDown || (p.tournamentInfo !== null && !p.tournamentInfo.can_play)}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Icon.Zap /> {p.loading ? 'Yükleniyor…' : 'Hızlı turnuva — 8 restoran'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => p.onStart(16)}
                disabled={p.loading || p.serverDown || (p.tournamentInfo !== null && !p.tournamentInfo.can_play)}
                className="btn-secondary flex-1 disabled:opacity-40"
              >
                {p.loading ? '…' : 'Klasik (16)'}
              </button>
              <button
                onClick={() => p.onStart(32)}
                disabled={p.loading || p.serverDown || (p.tournamentInfo !== null && !p.tournamentInfo.can_play)}
                className="btn-secondary flex-1 disabled:opacity-40"
              >
                {p.loading ? '…' : 'Büyük (32)'}
              </button>
            </div>

            {p.tournamentInfo && !p.tournamentInfo.can_play && (
              <p className="text-center text-brand-muted text-xs pt-1">Günlük limit doldu — yarın 3 yeni hak</p>
            )}
          </div>
        </div>

        <div className="max-w-md mx-auto mt-6">
          <SocialProof />
        </div>
      </section>

      <Footer />
    </div>
  )
}
