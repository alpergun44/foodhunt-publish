/**
 * FoodHunt — Onboarding Component
 * 3-step intro for first-time users
 */
import { useState } from 'react';
import { safeGetItem, safeSetItem } from '../../api';

const ONBOARDING_KEY = 'foodhunt_onboarding_done';

const steps = [
  {
    emoji: '🏟️',
    title: 'Turnuva Baslat',
    description: 'Bolge ve mutfak sec, restoranlar karsi karsiya gelsin. 8 veya 16 restoran arasinda sec!',
  },
  {
    emoji: '🆚',
    title: 'Favori Restorani Sec',
    description: 'Her turda iki restoran karsilasiyor. Hangisini tercih edersen onu sec, sampiyon belirlensin!',
  },
  {
    emoji: '🎉',
    title: 'Siparis Ver & Paylas',
    description: 'Sampiyon restoranin Yemeksepeti, Getir veya Trendyol linkiyle hemen siparis ver. Sonucu arkadaslarinla paylas!',
  },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      safeSetItem('local', ONBOARDING_KEY, 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    safeSetItem('local', ONBOARDING_KEY, 'true');
    onComplete();
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-brand-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center
                      shadow-2xl transform transition-all">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-brand-coral w-6' : i < step ? 'bg-brand-coral/50' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <span className="text-6xl block mb-4">{current.emoji}</span>
        <h2 className="text-2xl font-bold text-white mb-3">{current.title}</h2>
        <p className="text-white/70 mb-8 leading-relaxed">{current.description}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            Atla
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-brand-coral text-white font-semibold rounded-xl
                       hover:bg-brand-coral-light transition-all active:scale-95"
          >
            {step < steps.length - 1 ? 'Devam' : 'Basla!'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function shouldShowOnboarding(): boolean {
  return !safeGetItem('local', ONBOARDING_KEY);
}
