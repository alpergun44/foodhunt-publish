/**
 * Confetti — Şampiyon ekranı için sade konfeti efekti
 * Monokrom: sadece foreground rengiyle düşen parçalar
 */
import { useEffect, useState } from 'react'

export function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; duration: number; opacity: number }>>([])

  useEffect(() => {
    const p = Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.8,
      opacity: 0.4 + Math.random() * 0.5,
    }))
    setParticles(p)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-0 animate-confetti-fall bg-brand-cream"
          style={{
            left: `${p.x}%`,
            width: `${5 + Math.random() * 4}px`,
            height: `${5 + Math.random() * 4}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
