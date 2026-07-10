/**
 * FoodHunt — Ana sayfa orkestrasyonu
 * Phase router (landing / inspiration / game / results) + state
 * Tüm büyük UI parçaları features/ altındaki bileşenlere taşındı.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
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
import { MEAL_TYPES, getRoundName, createPairs, PLACEHOLDER_IMG } from '../features/tournament/constants'

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
  const [copied, setCopied] = useState(false)
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
        api.trackEvent('game_complete', { champion: winner.name, winner_id: winner.id, total_count: totalCount, area, cuisine, meal_type: mealType, mode })
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

    // Pairwise tercih verisi — moat: kim kimi, hangi bağlamda yendi
    api.trackEvent('choice_made', {
      winner_id: winner.id,
      loser_id: loser.id,
      winner: winner.name,
      loser: loser.name,
      round: roundIndex,
      match_index: matchIndex,
      area,
      cuisine,
      meal_type: mealType,
      mode,
      total_count: totalCount,
    })
  }, [roundMatches, matchIndex, roundWinners, roundIndex, totalCount, area, cuisine, mealType, mode])

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

      {/* ═══ GAME — diagonal foto-split arena ═══ */}
      {phase === 'game' && !loading && roundMatches.length > 0 && roundMatches[matchIndex] && !roundTransition && (
        <ArenaMatch
          top={roundMatches[matchIndex][0]}
          bottom={roundMatches[matchIndex][1]}
          onPick={handlePick}
          animating={pickLockRef.current}
          roundName={getRoundName(roundMatches.length * 2, totalCount)}
          totalRounds={totalRounds}
          currentRound={roundIndex}
          matchIndex={matchIndex}
          matchCount={roundMatches.length}
        />
      )}

      {/* ═══ GAME (Round Transition) ═══ */}
      {phase === 'game' && !loading && roundTransition && (
        <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in px-6">
          <div className="font-display font-bold text-5xl text-brand-coral" style={{ textShadow: '0 0 30px rgba(255,90,31,0.5)' }}>→</div>
          <h2 className="font-display text-xl font-bold text-brand-cream mt-4">Tur tamamlandı</h2>
          <p className="text-brand-muted text-sm mt-1">{getRoundName(roundWinners.length, totalCount)} turuna geçiliyor…</p>
        </div>
      )}

      {/* ═══ RESULTS — Kor şampiyon + sipariş akışı ═══ */}
      {phase === 'results' && champion && showConfetti && <Confetti />}
      {phase === 'results' && champion && (
        <ChampionScreen
          champion={champion}
          runnerUp={runnerUp}
          thirdPlace={thirdPlace}
          copied={copied}
          onCopy={() => {
            try { navigator.clipboard?.writeText(champion.name) } catch { /* noop */ }
            setCopied(true)
            api.trackEvent('copy_name', { restaurant_id: champion.id })
            setTimeout(() => setCopied(false), 1600)
          }}
          onChannel={(platform) => {
            api.trackEvent('deeplink_click', { platform, restaurant_id: champion.id, restaurant_name: champion.name })
            const token = safeGetItem('local', 'foodhunt_token')
            if (token) authApi.trackDeeplinkOrder(token, { restaurant_id: champion.id, platform }).catch(() => {})
          }}
          onShare={() => { setShareModalOpen(true); api.trackEvent('share_click') }}
          onRestart={handleRestart}
          isGuest={!safeGetItem('local', 'foodhunt_token')}
        />
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
  const [size, setSize] = useState<8 | 16 | 32>(8)
  const startDisabled = p.loading || p.serverDown || (p.tournamentInfo !== null && !p.tournamentInfo.can_play)

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <div className="kor-grain" />
      {/* Alttan yükselen kor ışığı */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 z-0"
        style={{ background: 'radial-gradient(120% 80% at 50% 115%, rgba(255,90,31,0.20), transparent 60%)' }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-5 pb-1 safe-top">
        <span className="font-display font-bold text-sm tracking-[0.08em]">FOODHUNT</span>
        <div className="flex items-center gap-3">
          <button
            onClick={p.toggleSoundClick}
            className="text-brand-muted hover:text-brand-cream transition-colors"
            aria-label={p.soundOn ? 'Sesi kapat' : 'Sesi aç'}
          >
            {p.soundOn ? <Icon.SoundOn /> : <Icon.SoundOff />}
          </button>
          {safeGetItem('local', 'foodhunt_token') ? (
            <a href="/profil" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cream active:opacity-60 transition-opacity">
              <span className="w-6 h-6 rounded-full bg-brand-elevated flex items-center justify-center text-[10px] font-bold">{userName}</span>
            </a>
          ) : (
            <a href="/giris" className="text-sm font-semibold text-brand-coral active:opacity-60 transition-opacity">Giriş</a>
          )}
        </div>
      </header>

      {/* Hero — kinetik dev başlık */}
      <section className="relative z-10 px-6 pt-8">
        {p.currentSlot && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-brand-fresh font-bold uppercase tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-fresh animate-pulse" /> Canlı · {p.currentSlot.start}–{p.currentSlot.end}
            </span>
          </div>
        )}
        <h1 className="font-display font-bold text-[3.4rem] leading-[0.86] tracking-[-0.02em]">
          NE<br /><span className="kor-mark">YESEM</span>
        </h1>
        <p className="text-brand-muted text-sm mt-5 max-w-[250px] leading-relaxed">
          {size} restoran kapışır. Sen hakem olursun. Bir dakika sürer.
        </p>
      </section>

      {/* Alt panel — filtreler + başlat (başparmak bölgesi) */}
      <section className="relative z-10 mt-auto px-6 pb-8">
        {/* Mod: bölge / yakınımdakiler */}
        <div className="flex gap-2 mb-1">
          <button
            onClick={p.handleBrowseMode}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              p.mode === 'browse' ? 'bg-brand-elevated text-brand-cream' : 'text-brand-muted'
            }`}
          >
            <Icon.MapPin /> Bölge
          </button>
          <button
            onClick={p.handleNearbyMode}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              p.mode === 'nearby' ? 'bg-brand-elevated text-brand-cream' : 'text-brand-muted'
            }`}
          >
            <Icon.Crosshair /> Yakınımda
          </button>
        </div>

        {p.mode === 'nearby' && (
          <div className="text-center py-1">
            {p.geo.loading && <p className="text-brand-cream text-xs animate-pulse">Konum alınıyor…</p>}
            {p.geo.position && !p.geo.loading && (
              <span className="inline-flex items-center gap-1.5 text-brand-fresh text-xs">
                <Icon.Navigation /> {p.nearbyMeta?.area_detected || 'Konum algılandı'}
              </span>
            )}
            {p.geo.permissionDenied && <p className="text-brand-muted text-xs">Varsayılan konum kullanılacak</p>}
          </div>
        )}

        {/* Bölge satırı */}
        {p.mode === 'browse' && (
          <label className="flex items-center justify-between py-3.5 border-t border-brand-line">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Bölge</span>
            <select
              value={p.selectedIlce || ''}
              onChange={e => p.handleIlceChange(e.target.value || null)}
              className="bg-transparent text-right font-semibold text-brand-cream text-[15px] focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-brand-surface">İlçe seçin</option>
              {p.regions.length > 0
                ? p.regions.map(r => {
                    const ad = p.areas.find(a => a.area === r.ilce)
                    return <option key={r.ilce} value={r.ilce} className="bg-brand-surface">{r.ilce}{ad ? ` (${ad.count})` : ''}</option>
                  })
                : p.areas.map(a => <option key={a.area} value={a.area} className="bg-brand-surface">{a.area} ({a.count})</option>)
              }
            </select>
          </label>
        )}

        {/* Mutfak satırı */}
        {(p.mode === 'browse' ? p.cuisines.length > 0 : true) && (
          <label className="flex items-center justify-between py-3.5 border-t border-brand-line">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Mutfak</span>
            <select
              value={p.cuisine || ''}
              onChange={e => p.setCuisine(e.target.value || null)}
              className="bg-transparent text-right font-semibold text-brand-cream text-[15px] focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-brand-surface">Tümü</option>
              {p.mode === 'browse'
                ? p.cuisines.map(c => <option key={c.cuisine} value={c.cuisine} className="bg-brand-surface">{c.cuisine} ({c.count})</option>)
                : ['Türk Mutfağı', 'Kebap', 'Pizza', 'Burger', 'Suşi', 'Deniz Ürünleri', 'Kafe', 'Fast Food', 'İtalyan', 'Vejetaryen'].map(c =>
                    <option key={c} value={c} className="bg-brand-surface">{c}</option>)
              }
            </select>
          </label>
        )}

        {/* Öğün tipi çipleri */}
        <div className="py-3 border-t border-brand-line">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {MEAL_TYPES.map(m => (
              <button
                key={m.id}
                onClick={() => p.setMealType(m.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                  p.mealType === m.id ? 'bg-brand-coral text-[#160A04]' : 'bg-brand-elevated text-brand-muted hover:text-brand-cream'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Boyut + günlük hak */}
        <div className="flex items-center justify-between py-3.5 border-t border-brand-line">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Boyut{p.tournamentInfo ? ' · Hak' : ''}</span>
          <div className="flex items-center gap-3">
            <div className="flex gap-3 text-[15px] font-semibold">
              {([8, 16, 32] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setSize(n)}
                  className={size === n ? 'text-brand-coral' : 'text-brand-muted'}
                >
                  {n}
                </button>
              ))}
            </div>
            {p.tournamentInfo && (
              <span className="text-[15px] font-semibold text-brand-cream tabular-nums">· {p.tournamentInfo.remaining}/{p.tournamentInfo.limit}</span>
            )}
          </div>
        </div>

        {/* Akkor başlat */}
        <button
          onClick={() => p.onStart(size)}
          disabled={startDisabled}
          className="btn-kor w-full mt-4 disabled:opacity-40"
        >
          {p.loading ? 'Yükleniyor…' : 'Turnuvayı Başlat'}
        </button>

        {p.tournamentInfo && !p.tournamentInfo.can_play && (
          <p className="text-center text-brand-muted text-xs pt-2">Günlük hak doldu — yarın yenilenir</p>
        )}
      </section>
    </div>
  )
}

// ─── ArenaMatch — diagonal foto-split turnuva ekranı ────────────────────────
interface ArenaMatchProps {
  top: Restaurant
  bottom: Restaurant
  onPick: (r: Restaurant) => void
  animating: boolean
  roundName: string
  totalRounds: number
  currentRound: number
  matchIndex: number
  matchCount: number
}

function ArenaMatch(p: ArenaMatchProps) {
  const img = (r: Restaurant) => r.image_url || PLACEHOLDER_IMG
  const price = (lvl?: number) => '₺'.repeat(Math.max(1, Math.min(3, lvl || 1)))

  return (
    <div className="fixed inset-0 bg-brand-dark no-select overflow-hidden">
      <div className="kor-grain" />

      {/* İlerleme çubuğu */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center gap-2.5 px-5 pt-[calc(env(safe-area-inset-top)+14px)] pb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-cream whitespace-nowrap">
          <span className="text-brand-coral">{p.roundName.split(' ')[0]}</span> {p.roundName.split(' ').slice(1).join(' ')}
        </span>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: p.totalRounds }).map((_, i) => (
            <span key={i} className={`h-[5px] flex-1 rounded-full ${i <= p.currentRound ? 'bg-brand-coral' : 'bg-brand-elevated'}`}
              style={i <= p.currentRound ? { boxShadow: '0 0 8px rgba(255,90,31,0.6)' } : undefined} />
          ))}
        </div>
        <span className="text-xs font-semibold text-brand-muted tabular-nums">{p.matchIndex + 1}/{p.matchCount}</span>
      </div>

      {/* Üst yarı (diagonal) */}
      <button
        onClick={() => onPickGuard(p, p.top)}
        disabled={p.animating}
        className="absolute inset-x-0 top-0 h-[56%] overflow-hidden text-left active:opacity-90 transition-opacity"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)' }}
      >
        <img src={img(p.top)} alt={p.top.name} loading="eager" className="absolute inset-0 w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }} />
        <span className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(11,9,8,0.12), transparent 45%, rgba(11,9,8,0.85))' }} />
        <span className="absolute left-5 top-[calc(env(safe-area-inset-top)+52px)] right-5 z-[3] block">
          <span className="block text-[10px] font-bold tracking-[0.18em] text-brand-ember">01 · İDDİALI</span>
          <span className="block font-display font-bold text-white text-[2rem] leading-[0.9] tracking-[-0.02em] mt-1.5"
            style={{ textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}>{p.top.name}</span>
          <span className="flex gap-2 mt-3">
            <TapeStat accent>★ {(p.top.rating ?? 0).toFixed(1)}</TapeStat>
            <TapeStat>{price(p.top.price_level)}</TapeStat>
            {p.top.cuisine && <TapeStat>{p.top.cuisine}</TapeStat>}
          </span>
        </span>
      </button>

      {/* Alt yarı (diagonal) */}
      <button
        onClick={() => onPickGuard(p, p.bottom)}
        disabled={p.animating}
        className="absolute inset-x-0 bottom-0 h-[56%] overflow-hidden text-right active:opacity-90 transition-opacity"
        style={{ clipPath: 'polygon(0 18%, 100% 0, 100% 100%, 0 100%)' }}
      >
        <img src={img(p.bottom)} alt={p.bottom.name} loading="eager" className="absolute inset-0 w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }} />
        <span className="absolute inset-0" style={{ background: 'linear-gradient(340deg, rgba(11,9,8,0.12), transparent 45%, rgba(11,9,8,0.88))' }} />
        <span className="absolute left-5 right-5 bottom-[calc(env(safe-area-inset-bottom)+24px)] z-[3] block">
          <span className="block text-[10px] font-bold tracking-[0.18em] text-brand-ember">02 · İDDİALI</span>
          <span className="block font-display font-bold text-white text-[2rem] leading-[0.9] tracking-[-0.02em] mt-1.5"
            style={{ textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}>{p.bottom.name}</span>
          <span className="flex gap-2 mt-3 justify-end">
            {p.bottom.cuisine && <TapeStat>{p.bottom.cuisine}</TapeStat>}
            <TapeStat>{price(p.bottom.price_level)}</TapeStat>
            <TapeStat accent>★ {(p.bottom.rating ?? 0).toFixed(1)}</TapeStat>
          </span>
        </span>
      </button>

      {/* Diagonal akkor dikiş */}
      <span className="absolute left-[-6%] right-[-6%] top-1/2 h-[2px] z-[6] pointer-events-none"
        style={{ background: 'rgb(var(--tint))', transform: 'rotate(-9deg)', boxShadow: '0 0 16px 2px rgba(255,90,31,0.7)' }} />

      {/* VS madalyonu */}
      <span className="absolute top-1/2 left-1/2 z-[9] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-[58px] h-[58px] rounded-full font-display font-bold text-[16px] text-[#160A04]"
        style={{ background: 'conic-gradient(from 210deg, #FF7A3C, #F5410A, #FF7A3C)', transform: 'translate(-50%,-50%) rotate(-9deg)', boxShadow: '0 0 28px 6px rgba(255,90,31,0.6), 0 0 0 6px rgb(var(--bg))' }}>
        VS
      </span>

      {/* İpucu */}
      <span className="absolute bottom-[calc(env(safe-area-inset-bottom)+8px)] inset-x-0 z-10 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted pointer-events-none">
        Kazananın yarısına dokun
      </span>
    </div>
  )
}

function onPickGuard(p: ArenaMatchProps, r: Restaurant) {
  if (!p.animating) p.onPick(r)
}

function TapeStat({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur ${accent ? 'text-brand-ember' : 'text-white'}`}
      style={{ background: 'rgba(0,0,0,0.42)' }}>
      {children}
    </span>
  )
}

// ─── ChampionScreen — Kor şampiyon + sipariş akışı ──────────────────────────
interface ChampionProps {
  champion: Restaurant
  runnerUp: Restaurant | null
  thirdPlace: Restaurant | null
  copied: boolean
  onCopy: () => void
  onChannel: (platform: string) => void
  onShare: () => void
  onRestart: () => void
  isGuest: boolean
}

function ChampionScreen(p: ChampionProps) {
  const c = p.champion
  const enc = (s: string) => encodeURIComponent(s)
  const price = '₺'.repeat(Math.max(1, Math.min(3, c.price_level || 1)))
  const img = c.image_url || PLACEHOLDER_IMG

  // Sipariş kanalları — restoran bazlı link varsa onu, yoksa isim aramasını kullan
  const channels = [
    { key: 'yemeksepeti', label: "Yemeksepeti'nde aç", tag: 'APP', color: '#FA0050', letters: 'YS',
      url: c.yemeksepeti_link || `https://www.yemeksepeti.com/search?q=${enc(c.name)}` },
    { key: 'getir', label: "Getir'de aç", tag: 'APP', color: '#5D3EBC', letters: 'G',
      url: c.getir_link || 'https://getir.com' },
    { key: 'ubereats', label: "Uber Eats'te aç", tag: 'APP', color: '#142328', letters: 'UE',
      url: c.trendyol_link || `https://www.ubereats.com/tr/search?q=${enc(c.name)}` },
    { key: 'gmaps', label: 'Google Maps’te gör', tag: 'YORUM · YOL', color: '#1A73E8', letters: '◉',
      url: c.google_maps_url || `https://www.google.com/maps/search/${enc(c.name + ' ' + (c.area || ''))}` },
  ]

  return (
    <div className="fixed inset-0 bg-brand-dark overflow-y-auto no-scrollbar">
      <div className="kor-grain" />
      <div className="relative z-[5] min-h-full flex flex-col">
        {/* Kazanan foto — tam genişlik */}
        <div className="relative h-[52vh] min-h-[300px] overflow-hidden shrink-0">
          <img src={img} alt={c.name} className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG }} />
          <span className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,9,8,0.1), transparent 38%, rgb(var(--bg)))' }} />
          <span className="absolute top-[calc(env(safe-area-inset-top)+16px)] left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#160A04] px-4 py-1.5 rounded-full"
            style={{ background: 'rgb(var(--tint))', boxShadow: '0 0 22px rgba(255,90,31,0.5)' }}>
            ★ Şampiyon
          </span>
          <div className="absolute left-5 right-5 bottom-4 z-[6]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ember">Bu turnuvanın kazananı</p>
            <h1 className="font-display font-bold text-white text-[2.6rem] leading-[0.88] tracking-[-0.02em] mt-1.5"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              <span className="kor-mark">{c.name}</span>
            </h1>
            <div className="flex gap-2 mt-3">
              <TapeStat accent>★ {(c.rating ?? 0).toFixed(1)}</TapeStat>
              {c.cuisine && <TapeStat>{c.cuisine}</TapeStat>}
              <TapeStat>{price}</TapeStat>
              {c.area && <TapeStat>{c.area}</TapeStat>}
            </div>
          </div>
        </div>

        {/* Sipariş kanalları */}
        <div className="px-5 pt-4 flex flex-col gap-2">
          {channels.map(ch => (
            <a key={ch.key} href={ch.url} target="_blank" rel="noopener noreferrer"
              onClick={() => p.onChannel(ch.key)}
              className="flex items-center gap-3 bg-brand-surface border border-brand-line rounded-xl px-3.5 py-3 active:opacity-70 transition-opacity">
              <span className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: ch.color }}>{ch.letters}</span>
              <span className="flex-1 text-[13px] font-semibold text-brand-cream">{ch.label}</span>
              <span className="text-[9px] font-bold tracking-[0.12em] text-brand-muted">{ch.tag}</span>
            </a>
          ))}
        </div>

        {/* İsmi kopyala + Paylaş */}
        <div className="px-5 pt-3 flex gap-2.5">
          <button onClick={p.onCopy}
            className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-[0.04em] bg-brand-coral text-[#160A04] active:opacity-80 transition-opacity">
            {p.copied ? '✓ Kopyalandı' : '⧉ İsmi kopyala'}
          </button>
          <button onClick={p.onShare}
            className="flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-[0.04em] bg-brand-surface border border-brand-line text-brand-cream active:opacity-70 transition-opacity">
            Paylaş
          </button>
        </div>

        {/* 2. – 3. sıra */}
        {(p.runnerUp || p.thirdPlace) && (
          <div className="px-5 pt-3 grid grid-cols-2 gap-2.5">
            {p.runnerUp && (
              <div className="bg-brand-surface border border-brand-line rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">2. sırada</p>
                <p className="text-brand-cream text-sm font-semibold mt-1 truncate">{p.runnerUp.name}</p>
                {p.runnerUp.cuisine && <p className="text-brand-muted text-xs mt-0.5 truncate">{p.runnerUp.cuisine}</p>}
              </div>
            )}
            {p.thirdPlace && (
              <div className="bg-brand-surface border border-brand-line rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">3. sırada</p>
                <p className="text-brand-cream text-sm font-semibold mt-1 truncate">{p.thirdPlace.name}</p>
                {p.thirdPlace.cuisine && <p className="text-brand-muted text-xs mt-0.5 truncate">{p.thirdPlace.cuisine}</p>}
              </div>
            )}
          </div>
        )}

        {/* Misafir CTA */}
        {p.isGuest && (
          <div className="mx-5 mt-3 bg-brand-surface border border-brand-line rounded-xl p-3.5 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-brand-cream text-sm font-semibold">Turnuva geçmişini kaydet</p>
              <p className="text-brand-muted text-xs mt-0.5">Favorilerini ve puanlarını takip et</p>
            </div>
            <a href="/giris" className="text-sm font-semibold px-3.5 py-1.5 rounded-full bg-brand-elevated text-brand-coral active:opacity-60 transition-opacity">Giriş</a>
          </div>
        )}

        {/* Fallback + tekrar */}
        <button onClick={p.onRestart}
          className="mt-3 mb-[calc(env(safe-area-inset-bottom)+20px)] text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted active:text-brand-cream transition-colors">
          Sipariş veremedim → hak iadesiyle tekrar oyna
        </button>
      </div>
    </div>
  )
}
