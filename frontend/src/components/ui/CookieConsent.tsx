/**
 * FoodHunt — Cookie Consent Banner (KVKK compliant)
 */
import { useState, useEffect } from 'react';
import { safeGetItem, safeSetItem } from '../../api';

const CONSENT_KEY = 'foodhunt_cookie_consent';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = safeGetItem('local', CONSENT_KEY);
    if (!consent) setShow(true);
  }, []);

  const handleAccept = () => {
    safeSetItem('local', CONSENT_KEY, JSON.stringify({ analytics: true, ts: Date.now() }));
    setShow(false);
    // Enable GA4
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  const handleReject = () => {
    safeSetItem('local', CONSENT_KEY, JSON.stringify({ analytics: false, ts: Date.now() }));
    setShow(false);
    // Disable GA4
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-brand-dark/95 backdrop-blur-lg
                    border-t border-brand-line shadow-card">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-brand-cream/70 text-sm flex-1">
          Deneyimini iyilestirmek icin cerezleri kullaniyoruz. Detaylar icin{' '}
          <a href="/cerez" className="text-brand-cream hover:underline">
            cerez politikamizi
          </a>{' '}
          inceleyebilirsin.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-brand-cream/60 hover:text-brand-cream text-sm transition-colors"
          >
            Reddet
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 bg-brand-cream text-brand-cream text-sm font-semibold rounded-lg
                       hover:bg-brand-cream-light transition-all active:scale-95"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window { gtag: (...args: any[]) => void; }
}
