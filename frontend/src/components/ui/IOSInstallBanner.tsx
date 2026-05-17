import { useState, useEffect } from 'react'

/**
 * iOS PWA Install Banner
 * iOS Safari doesn't support beforeinstallprompt — we show a custom banner
 * guiding users to use Share → Add to Home Screen.
 */

const DISMISS_KEY = 'foodhunt_pwa_dismissed'
const DISMISS_DAYS = 14 // Don't show again for 2 weeks after dismiss

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  // Must be Safari (not Chrome/Firefox on iOS — they can't install PWAs anyway, but we still show)
  const isSafari = /Safari/.test(ua)
  return isIOS && isSafari
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    ('standalone' in window.navigator && (window.navigator as any).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return false
    const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24)
    return daysSince < DISMISS_DAYS
  } catch {
    return false
  }
}

export function IOSInstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show on iOS, not already installed as PWA, not previously dismissed
    if (isIOSSafari() && !isStandalone() && !isDismissed()) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] safe-bottom animate-slide-up">
      <div className="mx-3 mb-3 bg-brand-card/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-brand-muted hover:text-white transition"
          aria-label="Kapat"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>

        <div className="flex items-start gap-3 pr-6">
          {/* App icon */}
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-elevated border border-brand-line flex items-center justify-center text-xl">
            🍽
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-brand-cream mb-1">
              FoodHunt'ı Yükle
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Hızlı erişim için ana ekranına ekle:{' '}
              {/* iOS Share icon inline */}
              <span className="inline-flex items-center align-middle mx-0.5">
                <svg className="w-4 h-4 text-brand-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M12 16v-8M8 8l4-4 4 4"/>
                </svg>
              </span>
              {' '}simgesine bas, sonra <strong className="text-brand-cream">"Ana Ekrana Ekle"</strong> seç.
            </p>
          </div>
        </div>

        {/* Visual step indicator */}
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/5">
          <Step num={1} text="Paylaş" icon="share" />
          <Arrow />
          <Step num={2} text="Ana Ekrana Ekle" icon="plus" />
          <Arrow />
          <Step num={3} text="Ekle" icon="check" />
        </div>
      </div>
    </div>
  )
}

function Step({ num, text, icon }: { num: number; text: string; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full bg-brand-elevated border border-brand-line flex items-center justify-center">
        {icon === 'share' && (
          <svg className="w-4 h-4 text-brand-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M12 16v-8M8 8l4-4 4 4"/>
          </svg>
        )}
        {icon === 'plus' && (
          <svg className="w-4 h-4 text-brand-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
          </svg>
        )}
        {icon === 'check' && (
          <svg className="w-4 h-4 text-brand-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
      </div>
      <span className="text-[10px] text-brand-muted font-medium">{text}</span>
    </div>
  )
}

function Arrow() {
  return (
    <svg className="w-4 h-4 text-brand-muted/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}
