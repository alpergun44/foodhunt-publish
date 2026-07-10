/**
 * RoundStepper — Turnuva ilerlemesini gösteren stepper (32 → 16 → 8 → ... → Final)
 */
import type { Restaurant } from '../../api'

interface Props {
  totalRounds: number
  currentRound: number
  totalSize: number
  roundMatches: Restaurant[][]
  matchIndex: number
}

export function RoundStepper({ totalRounds, currentRound, totalSize, roundMatches, matchIndex }: Props) {
  const steps: { label: string; size: number }[] = []
  let size = totalSize
  for (let i = 0; i <= totalRounds; i++) {
    if (size === 2)      steps.push({ label: 'Final',      size: 2 })
    else if (size === 4) steps.push({ label: 'Yarı Final', size: 4 })
    else                 steps.push({ label: `${size}`,    size })
    size = Math.floor(size / 2)
  }

  return (
    <div className="w-full max-w-lg mx-auto mb-5">
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className={`
              flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-medium transition-all duration-300 tabular-nums
              ${i < currentRound  ? 'bg-brand-cream text-brand-dark' : ''}
              ${i === currentRound ? 'bg-brand-cream text-brand-dark scale-110' : ''}
              ${i > currentRound  ? 'bg-brand-elevated text-brand-muted border border-brand-line' : ''}
            `}>
              {i < currentRound ? '✓' : step.size}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px transition-colors duration-300 ${i < currentRound ? 'bg-brand-cream' : 'bg-brand-line'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-brand-muted text-xs mt-2 tabular-nums">
        Maç {matchIndex + 1} / {roundMatches.length}
      </p>
    </div>
  )
}
