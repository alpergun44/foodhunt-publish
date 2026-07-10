/**
 * FoodHunt — Auth Page (v6 monokrom)
 * Giriş yöntemleri: Telefon OTP, Google, Apple, E-posta (legacy)
 * Tümü Firebase üzerinden → backend doğrulama → FoodHunt JWT
 */
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import {
  initRecaptcha,
  sendOTP,
  verifyOTP,
  signInWithGoogle,
  signInWithApple,
  isValidTurkishPhone,
  formatTurkishPhone,
} from '../utils/firebase'

// ─── İkonlar (sade outline) ───────────────────────────────────────────────
const I = {
  Phone:   () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>,
  Mail:    () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  Back:    () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  Logout:  () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Trophy:  () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17a2 2 0 0 1-.59 1.41A2 2 0 0 0 9 19.82V22M14 14.66V17a2 2 0 0 0 .59 1.41A2 2 0 0 1 15 19.82V22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  Star:    () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Google:  () => <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  Apple:   () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>,
}

// ─── OTP Input ─────────────────────────────────────────────────────────────
function OTPInput({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...values];
    next[i] = v.slice(-1);
    setValues(next);
    if (v && i < length - 1) refs.current[i + 1]?.focus();
    const code = next.join('');
    if (code.length === length) onComplete(code);
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = [...values];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setValues(next);
    if (pasted.length === length) onComplete(pasted);
    else refs.current[pasted.length]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {values.map((v, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-11 h-12 text-center text-lg font-medium bg-brand-surface border border-brand-line rounded-lg text-brand-cream focus:border-brand-cream focus:outline-none transition-colors"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

// ─── Auth Page ─────────────────────────────────────────────────────────────
type AuthMode = 'phone' | 'otp' | 'email-login' | 'email-register';

export default function AuthPage() {
  const { isAuthenticated, user, login, register, firebaseLogin, logout } = useAuth();
  const [mode, setMode] = useState<AuthMode>('phone');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [points, setPoints] = useState<{ total_points: number; history: any[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard'>('profile');
  const recaptchaInited = useRef(false);

  // ── reCAPTCHA
  useEffect(() => {
    if (recaptchaInited.current) return;
    const t = setTimeout(() => {
      try { initRecaptcha('recaptcha-container'); recaptchaInited.current = true; }
      catch (e) { console.warn('reCAPTCHA init error:', e); }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  // ── OTP geri sayım
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // ── Skor tablosu + puanlar
  useEffect(() => { authApi.getLeaderboard().then(setLeaderboard).catch(() => {}); }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('foodhunt_token');
    if (token) authApi.getPoints(token).then(setPoints).catch(() => {});
  }, [isAuthenticated]);

  // ── Handlers
  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidTurkishPhone(phone)) { setError('Geçerli bir Türkiye cep telefonu numarası girin'); return; }
    setLoading(true); setError('');
    try {
      await sendOTP(phone);
      setMode('otp'); setCountdown(60);
    } catch (e: any) {
      console.error('OTP send error:', e);
      if (e.code === 'auth/too-many-requests') setError('Çok fazla deneme. Birkaç dakika bekleyin.');
      else if (e.code === 'auth/invalid-phone-number') setError('Geçersiz telefon numarası');
      else setError(e.message || 'SMS gönderilemedi.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true); setError('');
    try {
      const t = await verifyOTP(code);
      await firebaseLogin(t);
    } catch (e: any) {
      console.error('OTP verify error:', e);
      if (e.code === 'auth/invalid-verification-code') setError('Geçersiz kod. Tekrar deneyin.');
      else setError(e.message || 'Doğrulama başarısız');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const t = await signInWithGoogle();
      await firebaseLogin(t);
    } catch (e: any) {
      console.error('Google sign-in error:', e);
      if (e.code !== 'auth/popup-closed-by-user') setError(e.message || 'Google ile giriş yapılamadı');
    } finally { setLoading(false); }
  };

  const handleApple = async () => {
    setLoading(true); setError('');
    try {
      const t = await signInWithApple();
      await firebaseLogin(t);
    } catch (e: any) {
      console.error('Apple sign-in error:', e);
      if (e.code !== 'auth/popup-closed-by-user') setError(e.message || 'Apple ile giriş yapılamadı');
    } finally { setLoading(false); }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'email-register') await register(email, password, name);
      else await login(email, password);
    } catch (e: any) { setError(e.message || 'Bir hata oluştu'); }
    finally { setLoading(false); }
  };

  // ─── PROFİL ───────────────────────────────────────────────────────────
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-brand-dark text-brand-cream">
        <header className="sticky top-0 z-10 bg-brand-dark/85 backdrop-blur border-b border-brand-line">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-cream transition-colors">
              <I.Back /> Ana sayfa
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-cream transition-colors">
                <I.Logout /> Çıkış
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-8 space-y-5">
          {/* Profil kartı */}
          <section className="card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-elevated border border-brand-line flex items-center justify-center text-xl font-medium text-brand-cream mx-auto mb-4">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{user.name}</h2>
            <p className="text-brand-muted text-sm mt-0.5">{user.email || user.phone || ''}</p>
            {user.auth_provider && (
              <span className="inline-block mt-3 text-xs bg-brand-elevated text-brand-muted px-2.5 py-0.5 rounded-md">
                {user.auth_provider === 'phone'      ? 'Telefon'
                : user.auth_provider === 'google.com' ? 'Google'
                : user.auth_provider === 'apple.com'  ? 'Apple'
                : 'E-posta'}
              </span>
            )}
            <div className="mt-5 inline-flex items-center gap-2 bg-brand-elevated border border-brand-line px-3.5 py-1.5 rounded-full">
              <I.Trophy />
              <span className="font-semibold tabular-nums">{points?.total_points || 0}</span>
              <span className="text-sm text-brand-muted">puan</span>
            </div>
          </section>

          {/* Sekmeler */}
          <div className="flex bg-brand-elevated border border-brand-line rounded-xl p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-brand-surface text-brand-cream border border-brand-line' : 'text-brand-muted hover:text-brand-cream'}`}
            >
              Puan geçmişi
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'leaderboard' ? 'bg-brand-surface text-brand-cream border border-brand-line' : 'text-brand-muted hover:text-brand-cream'}`}
            >
              Skor tablosu
            </button>
          </div>

          {/* Puan geçmişi */}
          {activeTab === 'profile' && (
            <div className="space-y-2">
              {(!points?.history || points.history.length === 0) ? (
                <div className="card p-6 text-center text-brand-muted text-sm">
                  <p>Henüz puan kazanmadın.</p>
                  <p className="mt-1.5 text-xs">Turnuva tamamla veya sipariş ver.</p>
                </div>
              ) : (
                points.history.map((h, i) => (
                  <div key={i} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {h.type === 'deeplink_order' ? `Sipariş (${h.platform})` : 'Turnuva tamamlama'}
                      </p>
                      <p className="text-brand-muted text-xs mt-0.5">
                        {new Date(h.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <span className="text-brand-cream font-semibold tabular-nums">+{h.points}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Skor tablosu */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="card p-6 text-center text-brand-muted text-sm">
                  Henüz skor tablosu boş.
                </div>
              ) : (
                leaderboard.map(l => (
                  <div key={l.rank} className="card p-4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium bg-brand-elevated border border-brand-line text-brand-muted tabular-nums">
                      {l.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{l.name}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 text-brand-cream font-semibold tabular-nums text-sm">
                      <I.Star /> {l.points}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ─── GİRİŞ ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream flex flex-col">
      <div id="recaptcha-container" />

      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-cream transition-colors">
          <I.Back /> Ana sayfa
        </a>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="font-sans font-semibold text-2xl tracking-tight">FoodHunt</h1>
            <p className="text-brand-muted text-sm">
              {mode === 'phone'          ? 'Hesabına gir veya yeni hesap aç'
              : mode === 'otp'           ? `${formatTurkishPhone(phone)} numarasına kod gönderildi`
              : mode === 'email-login'   ? 'E-posta ile giriş'
              : 'Yeni hesap oluştur'}
            </p>
          </div>

          {/* ─── TELEFON / SOSYAL ─────────────────────────────────────── */}
          {mode === 'phone' && (
            <>
              <div className="space-y-2">
                <button onClick={handleGoogle} disabled={loading}
                  className="social-btn group">
                  <I.Google />
                  <span>Google ile devam et</span>
                </button>
                <button onClick={handleApple} disabled={loading}
                  className="social-btn group">
                  <I.Apple />
                  <span>Apple ile devam et</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-brand-muted">
                <div className="flex-1 h-px bg-brand-line" />
                <span>veya</span>
                <div className="flex-1 h-px bg-brand-line" />
              </div>

              <form onSubmit={handleSendOTP} className="space-y-2.5">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-brand-muted text-sm pointer-events-none">
                    <span>🇹🇷</span><span>+90</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="5XX XXX XXXX"
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/[^\d\s\-()]/g, '')); setError(''); }}
                    className="input-field pl-[5rem] tracking-wide"
                    autoFocus
                  />
                </div>

                {error && <ErrorBox>{error}</ErrorBox>}

                <button
                  type="submit"
                  disabled={loading || !phone.replace(/\D/g, '').length}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2"
                >
                  {loading ? 'SMS gönderiliyor…' : <><I.Phone /> SMS ile kod gönder</>}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => { setShowEmail(!showEmail); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-cream transition-colors"
                >
                  <I.Mail /> E-posta ile giriş
                </button>

                {showEmail && (
                  <div className="mt-2.5 flex gap-2 justify-center">
                    <button onClick={() => { setMode('email-login'); setError(''); }}
                      className="px-3 py-1.5 text-sm rounded-md border border-brand-line text-brand-cream hover:bg-brand-elevated transition-colors">
                      Giriş yap
                    </button>
                    <button onClick={() => { setMode('email-register'); setError(''); }}
                      className="px-3 py-1.5 text-sm rounded-md border border-brand-line text-brand-muted hover:bg-brand-elevated transition-colors">
                      Kayıt ol
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── OTP DOĞRULAMA ───────────────────────────────────────── */}
          {mode === 'otp' && (
            <div className="space-y-5">
              <p className="text-center text-brand-muted text-sm">6 haneli kodu gir</p>
              <OTPInput onComplete={handleVerifyOTP} />
              {error && <ErrorBox>{error}</ErrorBox>}
              {loading && <p className="text-center text-brand-muted text-sm">Doğrulanıyor…</p>}

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-brand-muted text-sm">Tekrar gönder ({countdown}s)</p>
                ) : (
                  <button onClick={() => handleSendOTP()} disabled={loading}
                    className="text-sm text-brand-cream hover:underline disabled:opacity-50">
                    Kodu tekrar gönder
                  </button>
                )}
              </div>

              <button onClick={() => { setMode('phone'); setError(''); }}
                className="w-full text-center text-sm text-brand-muted hover:text-brand-cream transition-colors">
                Telefon numarasını değiştir
              </button>
            </div>
          )}

          {/* ─── E-POSTA GİRİŞ/KAYIT ────────────────────────────────── */}
          {(mode === 'email-login' || mode === 'email-register') && (
            <>
              <form onSubmit={handleEmail} className="space-y-2.5">
                {mode === 'email-register' && (
                  <input type="text" placeholder="Adın"
                    value={name} onChange={e => setName(e.target.value)}
                    className="input-field" required />
                )}
                <input type="email" placeholder="E-posta"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" required autoFocus />
                <input type="password" placeholder="Şifre (en az 6 karakter)"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field" required minLength={6} />

                {error && <ErrorBox>{error}</ErrorBox>}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Yükleniyor…' : mode === 'email-login' ? 'Giriş yap' : 'Kayıt ol'}
                </button>
              </form>

              <p className="text-center text-sm text-brand-muted">
                {mode === 'email-login' ? (
                  <>Hesabın yok mu?{' '}
                    <button onClick={() => { setMode('email-register'); setError(''); }}
                      className="text-brand-cream font-medium hover:underline">Kayıt ol</button>
                  </>
                ) : (
                  <>Zaten hesabın var mı?{' '}
                    <button onClick={() => { setMode('email-login'); setError(''); }}
                      className="text-brand-cream font-medium hover:underline">Giriş yap</button>
                  </>
                )}
              </p>

              <button onClick={() => { setMode('phone'); setError(''); setShowEmail(false); }}
                className="w-full text-center text-sm text-brand-muted hover:text-brand-cream transition-colors">
                Telefon ile giriş yap
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Yardımcı bileşenler ─────────────────────────────────────────────────
function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-elevated border border-brand-line rounded-lg px-3.5 py-2.5 text-sm text-brand-cream">
      {children}
    </div>
  );
}
