/**
 * FoodHunt — Auth Page (Login / Register / Profile)
 * Supports Email+Password, Google Sign-In, Apple Sign-In
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'

// ─── Google Sign-In Script Loader ──────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function useGoogleSignIn(onSuccess: (credential: string) => void) {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      ;(window as any).google?.accounts?.id?.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) onSuccess(response.credential)
        },
      })
      ;(window as any).google?.accounts?.id?.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'filled_black', size: 'large', width: 320, text: 'continue_with', shape: 'pill' }
      )
    }
    document.head.appendChild(script)
    return () => { script.remove() }
  }, [onSuccess])
}

// ─── Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  Mail: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  Apple: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>,
  Trophy: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14l-1.5 6.5a5.5 5.5 0 01-11 0L5 3zM12 17v4m-4 0h8"/></svg>,
  Star: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Back: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
}

// ─── Auth Page ─────────────────────────────────────────────────────────────
export default function AuthPage() {
  const { isAuthenticated, user, login, register, googleLogin, logout } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [points, setPoints] = useState<{ total_points: number; history: any[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard'>('profile')

  // Google Sign-In
  const handleGoogleSuccess = useCallback(async (credential: string) => {
    setLoading(true)
    setError('')
    try {
      await googleLogin(credential)
    } catch (e: any) {
      setError(e.message || 'Google ile giriş yapılamadı')
    } finally {
      setLoading(false)
    }
  }, [googleLogin])

  useGoogleSignIn(handleGoogleSuccess)

  // Load leaderboard
  useEffect(() => {
    authApi.getLeaderboard().then(setLeaderboard).catch(() => {})
  }, [isAuthenticated])

  // Load points when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    const token = localStorage.getItem('foodhunt_token')
    if (token) {
      authApi.getPoints(token).then(setPoints).catch(() => {})
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // ─── Profile View (authenticated) ──────────────────────────────────────
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-cream">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-bg/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
            <a href="/" className="flex items-center gap-2 text-brand-muted hover:text-brand-cream transition">
              <Icons.Back /> Ana Sayfa
            </a>
            <button onClick={logout} className="flex items-center gap-2 text-brand-muted hover:text-red-400 transition text-sm">
              <Icons.Logout /> Çıkış
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          {/* User Card */}
          <div className="bg-brand-card border border-white/5 rounded-3xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-coral to-brand-amber flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-brand-muted text-sm mt-1">{user.email}</p>
            <div className="mt-4 flex items-center justify-center gap-2 bg-brand-amber/10 text-brand-amber px-4 py-2 rounded-full">
              <Icons.Trophy />
              <span className="font-bold text-lg">{points?.total_points || 0}</span>
              <span className="text-sm opacity-75">puan</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-brand-surface rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === 'profile' ? 'bg-brand-coral text-white' : 'text-brand-muted'}`}
            >
              Puan Geçmişi
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === 'leaderboard' ? 'bg-brand-coral text-white' : 'text-brand-muted'}`}
            >
              Skor Tablosu
            </button>
          </div>

          {/* Points History */}
          {activeTab === 'profile' && (
            <div className="space-y-2">
              {(!points?.history || points.history.length === 0) ? (
                <div className="bg-brand-card border border-white/5 rounded-2xl p-6 text-center text-brand-muted">
                  <p>Henüz puan kazanmadınız.</p>
                  <p className="text-sm mt-2">Turnuva tamamlayın veya sipariş verin!</p>
                </div>
              ) : (
                points.history.map((h, i) => (
                  <div key={i} className="bg-brand-card border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {h.type === 'deeplink_order' ? `Sipariş (${h.platform})` : 'Turnuva Tamamlama'}
                      </p>
                      <p className="text-brand-muted text-xs mt-0.5">
                        {new Date(h.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <span className="text-brand-amber font-bold">+{h.points}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="bg-brand-card border border-white/5 rounded-2xl p-6 text-center text-brand-muted">
                  Henüz skor tablosu boş.
                </div>
              ) : (
                leaderboard.map((l) => (
                  <div key={l.rank} className={`bg-brand-card border rounded-2xl p-4 flex items-center gap-4 ${l.rank <= 3 ? 'border-brand-amber/30' : 'border-white/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${l.rank === 1 ? 'bg-yellow-500 text-black' : l.rank === 2 ? 'bg-gray-300 text-black' : l.rank === 3 ? 'bg-amber-700 text-white' : 'bg-brand-surface text-brand-muted'}`}>
                      {l.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{l.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-brand-amber font-bold">
                      <Icons.Star /> {l.points}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Login / Register Form ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-bg text-brand-cream flex flex-col">
      {/* Header */}
      <div className="px-4 py-3">
        <a href="/" className="flex items-center gap-2 text-brand-muted hover:text-brand-cream transition text-sm">
          <Icons.Back /> Ana Sayfa
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="text-5xl mb-3">🍔</div>
            <h1 className="font-display text-2xl font-extrabold text-gradient-warm">FoodHunt</h1>
            <p className="text-brand-muted text-sm mt-2">
              {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <div id="google-signin-btn" className="flex justify-center" />
            {!GOOGLE_CLIENT_ID && (
              <button disabled className="w-full flex items-center justify-center gap-3 bg-white text-black rounded-full py-3 font-semibold opacity-50 cursor-not-allowed">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google ile devam et
              </button>
            )}

            {/* Apple */}
            <button
              onClick={() => {/* Apple Sign In will be configured with Apple Developer account */}}
              className="w-full flex items-center justify-center gap-3 bg-white text-black rounded-full py-3 font-semibold hover:bg-gray-100 transition active:scale-[0.98]"
            >
              <Icons.Apple /> Apple ile devam et
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-brand-muted text-xs uppercase tracking-wider">veya</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <Icons.User />
                <input
                  type="text"
                  placeholder="Adınız"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-brand-surface border border-white/10 rounded-xl pl-4 pr-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:border-brand-coral focus:outline-none transition"
                  required
                />
              </div>
            )}
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:border-brand-coral focus:outline-none transition"
              required
            />
            <input
              type="password"
              placeholder="Şifreniz (en az 6 karakter)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:border-brand-coral focus:outline-none transition"
              required
              minLength={6}
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-coral to-brand-amber text-white font-bold py-3 rounded-xl transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-brand-muted text-sm">
            {mode === 'login' ? (
              <>Hesabınız yok mu?{' '}
                <button onClick={() => { setMode('register'); setError('') }} className="text-brand-coral font-semibold hover:underline">
                  Kayıt Olun
                </button>
              </>
            ) : (
              <>Zaten hesabınız var mı?{' '}
                <button onClick={() => { setMode('login'); setError('') }} className="text-brand-coral font-semibold hover:underline">
                  Giriş Yapın
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
